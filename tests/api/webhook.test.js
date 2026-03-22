const request = require('supertest');
const app = require('./server');

describe('Webhook Simulation Tests', () => {

  test('should accept webhook with valid signature', async () => {
    const res = await request(app)
      .post('/api/v1/webhook')
      .set('x-paystack-signature', 'sha512-mock-signature')
      .send({
        event: 'charge.success',
        data: { reference: 'mock-ref-123', amount: 10000, status: 'success' }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test('should reject webhook with missing signature', async () => {
    const res = await request(app)
      .post('/api/v1/webhook')
      .send({
        event: 'charge.success',
        data: { reference: 'mock-ref-123' }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toBe('Missing webhook signature');
  });

  test('should handle transfer.success webhook event', async () => {
    const res = await request(app)
      .post('/api/v1/webhook')
      .set('x-paystack-signature', 'sha512-mock-signature')
      .send({
        event: 'transfer.success',
        data: { reference: 'TRF_mock123', amount: 5000, status: 'success' }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
  });

});
