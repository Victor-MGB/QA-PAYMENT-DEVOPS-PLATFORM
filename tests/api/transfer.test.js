const request = require('supertest');
const app = require('./server');

const VALID_TOKEN = 'Bearer test-token-123';

describe('Payment Initialization Tests', () => {

  test('should initialize payment successfully', async () => {
    const res = await request(app)
      .post('/api/v1/transaction/initialize')
      .set('Authorization', VALID_TOKEN)
      .send({ email: 'customer@test.com', amount: 10000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toHaveProperty('authorization_url');
    expect(res.body.data).toHaveProperty('reference');
  });

  test('should reject payment with missing email', async () => {
    const res = await request(app)
      .post('/api/v1/transaction/initialize')
      .set('Authorization', VALID_TOKEN)
      .send({ amount: 10000 });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
  });

  test('should reject payment with zero amount', async () => {
    const res = await request(app)
      .post('/api/v1/transaction/initialize')
      .set('Authorization', VALID_TOKEN)
      .send({ email: 'customer@test.com', amount: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
  });

});

describe('Transaction Verification Tests', () => {

  test('should verify a valid transaction', async () => {
    const res = await request(app)
      .get('/api/v1/transaction/verify/mock-ref-abc')
      .set('Authorization', VALID_TOKEN);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('success');
    expect(res.body.data).toHaveProperty('amount');
    expect(res.body.data).toHaveProperty('paid_at');
  });

  test('should fail on invalid reference', async () => {
    const res = await request(app)
      .get('/api/v1/transaction/verify/invalid-ref')
      .set('Authorization', VALID_TOKEN);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
  });

});

describe('Transfer Tests', () => {

  test('should queue a valid transfer', async () => {
    const res = await request(app)
      .post('/api/v1/transfer')
      .set('Authorization', VALID_TOKEN)
      .send({ amount: 5000, recipient: 'RCP_mock123', reason: 'Test payment' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data).toHaveProperty('transfer_code');
  });

  test('should reject transfer above limit', async () => {
    const res = await request(app)
      .post('/api/v1/transfer')
      .set('Authorization', VALID_TOKEN)
      .send({ amount: 2000000, recipient: 'RCP_mock123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
  });

  test('should reject transfer with missing recipient', async () => {
    const res = await request(app)
      .post('/api/v1/transfer')
      .set('Authorization', VALID_TOKEN)
      .send({ amount: 5000 });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
  });

});
