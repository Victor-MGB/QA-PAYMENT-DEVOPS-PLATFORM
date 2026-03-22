import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const paymentDuration = new Trend('payment_duration');
const transferDuration = new Trend('transfer_duration');
const totalPayments = new Counter('total_payments');

// k6 load stages
export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
    error_rate: ['rate<0.05'],
    payment_duration: ['p(95)<600'],
    transfer_duration: ['p(95)<600'],
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';
const AUTH_TOKEN = 'Bearer test-token-123';
const headers = { 'Content-Type': 'application/json', 'Authorization': AUTH_TOKEN };

// Helper function for safe JSON parsing
function safeParse(res) {
  try { return JSON.parse(res.body); } 
  catch (e) { return {}; }
}

// Retry logic for robustness
function retryRequest(fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const res = fn();
    if (res.status === 200) return res;
  }
  return fn(); // final attempt
}

// Main test function
export default function () {
  
  // -------- Payment Initialization --------
  group('Payment Initialization', () => {
    const start = Date.now();
    const res = retryRequest(() =>
      http.post(`${BASE_URL}/transaction/initialize`, JSON.stringify({
        email: `user${__VU}@loadtest.com`,
        amount: Math.floor(Math.random() * 50000) + 1000,
      }), { headers })
    );
    paymentDuration.add(Date.now() - start);
    totalPayments.add(1);

    const body = safeParse(res);
    const reference = body.data?.reference;

    const success = check(res, {
      'status 200': res.status === 200,
      'has reference': reference !== undefined,
      'response < 500ms': res.timings.duration < 500,
    });
    errorRate.add(!success);

    // Store reference for verification stage
    if (reference) {
      __ENV.REF = reference; // temporary env variable per VU
    }
  });

  sleep(0.5);

  // -------- Webhook / Transaction Verification --------
  group('Transaction Verification (Simulated Webhook)', () => {
    const reference = __ENV.REF || `mock-ref-${__VU}`;
    const res = http.get(`${BASE_URL}/transaction/verify/${reference}`, { headers });

    const body = safeParse(res);
    const success = check(res, {
      'status 200': res.status === 200,
      'verified success': body.data?.status === 'success',
      'response < 500ms': res.timings.duration < 500,
    });
    errorRate.add(!success);
  });

  sleep(0.5);

  // -------- Fund Transfer --------
  group('Fund Transfer', () => {
    const start = Date.now();
    const res = retryRequest(() =>
      http.post(`${BASE_URL}/transfer`, JSON.stringify({
        amount: Math.floor(Math.random() * 10000) + 500,
        recipient: `RCP_load_${__VU}`,
        reason: 'Load test transfer',
      }), { headers })
    );
    transferDuration.add(Date.now() - start);

    const body = safeParse(res);
    const success = check(res, {
      'status 200': res.status === 200,
      'transfer pending': body.data?.status === 'pending',
      'transfer code exists': body.data?.transfer_code !== undefined,
      'response < 500ms': res.timings.duration < 500,
    });
    errorRate.add(!success);
  });

  sleep(1);

  // -------- Auth Failure Handling --------
  group('Auth Failure Handling', () => {
    const res = http.post(`${BASE_URL}/transaction/initialize`, JSON.stringify({ email: 'test@test.com', amount: 5000 }), {
      headers: { 'Content-Type': 'application/json' }
    });

    check(res, { 'unauth returns 401': res.status === 401 });
  });

  sleep(0.5);
}

// -------- Custom Summary for Grafana / CI --------
export function handleSummary(data) {
  return {
    'reports/k6-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const metrics = data.metrics;
  const reqs    = metrics.http_reqs?.values?.count ?? 0;
  const rps     = metrics.http_reqs?.values?.rate?.toFixed(2) ?? 0;
  const p95     = metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) ?? 0;
  const p99     = metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) ?? 0;
  const errRate = ((metrics.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2);
  const vus     = metrics.vus_max?.values?.max ?? 0;

  return `
========================================
   QA PAYMENT DEVOPS PLATFORM — k6 LOAD REPORT
========================================
  Total requests  : ${reqs}
  Requests/sec    : ${rps}
  Peak VUs        : ${vus}
  Error rate      : ${errRate}%
  p95 latency     : ${p95}ms
  p99 latency     : ${p99}ms
========================================
`;
}