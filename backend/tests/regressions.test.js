const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(file, mocks, extra = {}) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    module, exports: module.exports, console, Date, AbortSignal,
    process: { env: { STRIPE_SECRET_KEY: 'test', GEMINI_API_KEY: 'test', GEMINI_MODEL: 'test' } },
    require(name) { if (name in mocks) return mocks[name]; throw Error(name); },
    ...extra,
  });
  return module.exports;
}
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });

for (const [label, user, decoded, expected] of [
  ['blocked account', { isBlocked: true }, {}, 403],
  ['revoked token', { tokenVersion: 1 }, { tokenVersion: 0 }, 401],
  ['current token', { tokenVersion: 1 }, { tokenVersion: 1 }, 200],
  ['legacy token before reset', {}, {}, 200],
]) {
  test(label, async () => {
    const protect = load('middleware/authMiddleware.js', {
      jsonwebtoken: { verify: () => ({ id: 'user', ...decoded }) },
      '../models/User': { findById: () => ({ select: async () => user }) },
    });
    const res = response(); let next = false;
    await protect({ headers: { authorization: 'Bearer token' } }, res, () => { next = true; });
    assert.equal(res.code, expected);
    assert.equal(next, expected === 200);
  });
}

for (const state of ['canceled', 'unpaid', 'active']) {
  test(`checkout verification: ${state}`, async () => {
    let saved;
    const controller = load('controllers/subscriptionController.js', {
      dotenv: { config() {} },
      stripe: () => ({ checkout: { sessions: { retrieve: async () => ({ mode: 'subscription', status: 'complete', payment_status: 'paid', metadata: { userId: 'user' }, subscription: { id: 'sub', status: state }, customer: 'customer' }) } } }),
      '../models/Subscription': { findOneAndUpdate: async (_, value) => { saved = value; } },
      '../models/User': { findByIdAndUpdate: async () => ({ subscriptionStatus: 'active' }) },
    });
    const res = response();
    await controller.verifyCheckoutSession({ body: { sessionId: 'old' }, user: { _id: 'user' } }, res);
    assert.equal(res.code, state === 'active' ? 200 : 400);
    assert.equal(Boolean(saved), state === 'active');
  });
}

test('zero budget is saved', async () => {
  const strategy = { budget: 1000, save: async () => {} };
  const c = load('controllers/marketingController.js', {
    '../models/MarketingStrategy': { findById: async () => strategy },
    '../models/MarketingGrowth': {}, '../models/MarketingMedia': {},
  });
  await c.updateStrategy({ params: { id: 's' }, body: { budget: 0 } }, response());
  assert.equal(strategy.budget, 0);
});

test('explicit null unlinks strategy, omitted field preserves it', async () => {
  const entry = { strategy: 'original', save: async () => {} };
  const c = load('controllers/marketingGrowthController.js', { '../models/MarketingGrowth': { findById: async () => entry } });
  await c.updateGrowthEntry({ params: { id: 'g' }, body: {} }, response());
  assert.equal(entry.strategy, 'original');
  await c.updateGrowthEntry({ params: { id: 'g' }, body: { strategy: null } }, response());
  assert.equal(entry.strategy, null);
});

test('exhausted quota rejects before calling provider', async () => {
  let called = false;
  const c = load('controllers/predictionController.js', { '../models/User': { findOneAndUpdate: async () => null } }, { fetch: async () => { called = true; } });
  const res = response();
  await c.predict({ body: { coinId: 'bitcoin' }, user: { _id: 'user', subscriptionStatus: 'inactive' } }, res);
  assert.equal(res.code, 429);
  assert.equal(called, false);
});

test('provider failure refunds reserved allowance and hides provider details', async () => {
  let refunded = false;
  const c = load('controllers/predictionController.js', { '../models/User': {
    findOneAndUpdate: async () => ({ predictionCount: 1 }),
    updateOne: async () => { refunded = true; },
  } }, { fetch: async () => { throw Error('secret provider details'); } });
  const res = response();
  await c.predict({ body: { coinId: 'bitcoin' }, user: { _id: 'user' } }, res);
  assert.equal(res.code, 502);
  assert.equal(refunded, true);
  assert.equal(JSON.stringify(res.body).includes('secret'), false);
});

test('premium prediction returns validated result without reserving free quota', async () => {
  let calls = 0;
  const c = load('controllers/predictionController.js', { '../models/User': {
    findById: async () => ({ subscriptionStatus: 'active' }),
  } }, { fetch: async () => ({ ok: true, json: async () => {
    calls++;
    if (calls === 1) return [{ id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 100 }];
    if (calls === 2) return { prices: Array.from({ length: 30 }, (_, i) => [i, 100 + i]), total_volumes: Array.from({ length: 30 }, (_, i) => [i, 100]) };
    return { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ action: 'HOLD', reason: 'Test reason.', risk: 'Test risk.' }) }] } }] };
  } }) });
  const res = response();
  await c.predict({ body: { coinId: 'bitcoin' }, user: { _id: 'user', subscriptionStatus: 'active' } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.prediction.action, 'HOLD');
  assert.equal(res.body.coin.symbol, 'BTC');
  assert.equal(calls, 3);
});

