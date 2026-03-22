Cypress.Commands.add('initializePayment', (email, amount) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/transaction/initialize`,
    headers: { Authorization: Cypress.env('authToken') },
    body: { email, amount }
  });
});

Cypress.Commands.add('verifyTransaction', (reference) => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/transaction/verify/${reference}`,
    headers: { Authorization: Cypress.env('authToken') }
  });
});

Cypress.Commands.add('makeTransfer', (amount, recipient, reason) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/transfer`,
    headers: { Authorization: Cypress.env('authToken') },
    body: { amount, recipient, reason }
  });
});
