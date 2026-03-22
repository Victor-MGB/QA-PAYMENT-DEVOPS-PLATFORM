const request = require('supertest');
const app = require('./server');

describe('Authentication Tests', () => {
  
  test('should reject request with no token', async () => {
    const res = await request(app)
      .post('/api/v1/transaction/initialize')
      .send({ email: 'test@test.com', amount: 5000 });
    
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe(false);
    expect(res.body.message).toBe('Invalid token');
  });

  test('should reject request with wrong token', async () => {
    const res = await request(app)
      .post('/api/v1/transaction/initialize')
      .set('Authorization', 'Bearer wrong-token')
      .send({ email: 'test@test.com', amount: 5000 });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe(false);
  });

  test('should accept request with valid token', async () => {
    const res = await request(app)
      .post('/api/v1/transaction/initialize')
      .set('Authorization', 'Bearer test-token-123')
      .send({ email: 'test@test.com', amount: 5000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
  });

});
