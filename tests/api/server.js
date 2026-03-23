const express = require('express');
const app = express();
app.use(express.json());

const validTokens = ['Bearer test-token-123'];

const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!validTokens.includes(token)) {
    return res.status(401).json({ status: false, message: 'Invalid token' });
  }
  next();
};

app.post('/api/v1/transaction/initialize', auth, (req, res) => {
  const { email, amount } = req.body;
  if (!email || !amount) {
    return res.status(400).json({ status: false, message: 'Email and amount are required' });
  }
  if (amount <= 0) {
    return res.status(400).json({ status: false, message: 'Amount must be greater than 0' });
  }
  res.status(200).json({
    status: true,
    message: 'Authorization URL created',
    data: {
      authorization_url: 'https://checkout.paystack.com/mock-ref-123',
      access_code: 'mock_access_123',
      reference: 'mock-ref-123'
    }
  });
});

app.get('/api/v1/transaction/verify/:reference', auth, (req, res) => {
  const { reference } = req.params;
  if (reference === 'invalid-ref') {
    return res.status(400).json({ status: false, message: 'Transaction reference not found' });
  }
  res.status(200).json({
    status: true,
    message: 'Verification successful',
    data: {
      status: 'success',
      reference,
      amount: 10000,
      currency: 'NGN',
      paid_at: new Date().toISOString()
    }
  });
});

app.post('/api/v1/transfer', auth, (req, res) => {
  const { amount, recipient, reason } = req.body;
  if (!amount || !recipient) {
    return res.status(400).json({ status: false, message: 'Amount and recipient are required' });
  }
  if (amount > 1000000) {
    return res.status(400).json({ status: false, message: 'Amount exceeds transfer limit' });
  }
  res.status(200).json({
    status: true,
    message: 'Transfer queued',
    data: {
      reference: 'TRF_' + Date.now(),
      amount,
      recipient,
      reason: reason || 'No reason provided',
      status: 'pending',
      transfer_code: 'TRF_mock_123'
    }
  });
});

app.post('/api/v1/webhook', (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  if (!signature) {
    return res.status(400).json({ status: false, message: 'Missing webhook signature' });
  }
  res.status(200).json({ status: true, message: 'Webhook received' });
});


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
