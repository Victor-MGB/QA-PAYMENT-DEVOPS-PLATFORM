describe('Payment Flow - Full Journey', () => {

  context('Payment Initialization', () => {

    it('should initialize a valid payment successfully', () => {
      cy.initializePayment('customer@test.com', 10000).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.status).to.be.true;
        expect(res.body.data).to.have.property('authorization_url');
        expect(res.body.data).to.have.property('reference');
        expect(res.body.data.reference).to.eq('mock-ref-123');
      });
    });

    it('should reject payment with no email', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/transaction/initialize`,
        headers: { Authorization: Cypress.env('authToken') },
        body: { amount: 5000 },
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.status).to.be.false;
        expect(res.body.message).to.eq('Email and amount are required');
      });
    });

    it('should reject payment with zero amount', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/transaction/initialize`,
        headers: { Authorization: Cypress.env('authToken') },
        body: { email: 'customer@test.com', amount: 0 },
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.status).to.be.false;
      });
    });

    it('should reject unauthenticated payment request', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/transaction/initialize`,
        body: { email: 'customer@test.com', amount: 5000 },
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.status).to.be.false;
      });
    });

  });

  context('Transaction Verification', () => {

    it('should verify a completed transaction', () => {
      cy.verifyTransaction('mock-ref-abc').then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.status).to.eq('success');
        expect(res.body.data).to.have.property('amount');
        expect(res.body.data).to.have.property('paid_at');
        expect(res.body.data.currency).to.eq('NGN');
      });
    });

    it('should fail verification for invalid reference', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/transaction/verify/invalid-ref`,
        headers: { Authorization: Cypress.env('authToken') },
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.status).to.be.false;
      });
    });

  });

  context('Fund Transfers', () => {

    it('should complete a valid fund transfer', () => {
      cy.makeTransfer(5000, 'RCP_mock123', 'Vendor payment').then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.status).to.be.true;
        expect(res.body.data.status).to.eq('pending');
        expect(res.body.data).to.have.property('transfer_code');
        expect(res.body.data.amount).to.eq(5000);
      });
    });

    it('should reject transfer exceeding limit', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/transfer`,
        headers: { Authorization: Cypress.env('authToken') },
        body: { amount: 2000000, recipient: 'RCP_mock123' },
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Amount exceeds transfer limit');
      });
    });

    it('should reject transfer with no recipient', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/transfer`,
        headers: { Authorization: Cypress.env('authToken') },
        body: { amount: 5000 },
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.status).to.be.false;
      });
    });

  });

  context('Full Payment Journey', () => {

    it('should complete the full payment lifecycle', () => {
      cy.initializePayment('lifecycle@test.com', 15000).then((initRes) => {
        expect(initRes.status).to.eq(200);
        const reference = initRes.body.data.reference;

        cy.verifyTransaction(reference).then((verifyRes) => {
          expect(verifyRes.status).to.eq(200);
          expect(verifyRes.body.data.status).to.eq('success.');
        });
      });
    });

  });
});
