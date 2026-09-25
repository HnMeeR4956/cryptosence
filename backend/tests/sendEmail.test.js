const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
function load(env, fetch) {
  const sandbox = { module: { exports: {} }, process: { env }, fetch, AbortSignal };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../utils/sendEmail.js"), "utf8"), sandbox);
  return sandbox.module.exports;
}
test("Brevo sends reset content over HTTPS and requires acknowledgement", async () => {
  let request;
  const send = load({ BREVO_API_KEY: "test-key", BREVO_SENDER_EMAIL: "sender@example.com" },
    async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ messageId: "test-id" }) }; });
  assert.equal(await send({ email: "user@example.com", subject: "Reset", message: "test reset link" }), "test-id");
  assert.equal(request.url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(request.options.headers["api-key"], "test-key");
  const body = JSON.parse(request.options.body);
  assert.equal(body.sender.email, "sender@example.com");
  assert.equal(body.to[0].email, "user@example.com");
  assert.equal(body.textContent, "test reset link");
  assert.ok(request.options.signal);
});
test("missing Brevo configuration fails before contacting provider", async () => {
  await assert.rejects(load({}, () => assert.fail("must not send"))({}), /configuration/);
});
test("provider rejection is sanitized and is not reported as success", async () => {
  await assert.rejects(load({ BREVO_API_KEY: "test", BREVO_SENDER_EMAIL: "sender@example.com" },
    async () => ({ ok: false, status: 401 }))({}), /HTTP 401/);
});
test("network timeout and missing acknowledgement propagate as failure", async () => {
  const env = { BREVO_API_KEY: "test", BREVO_SENDER_EMAIL: "sender@example.com" };
  await assert.rejects(load(env, async () => { throw new Error("timeout"); })({}), /timeout/);
  await assert.rejects(load(env, async () => ({ ok: true, json: async () => ({}) }))({}), /acceptance/);
});
