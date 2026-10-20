import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createHmac } from "node:crypto";
import ts from "typescript";
const requireDependency = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the production TypeScript with isolated DB/auth/payment mocks. No requests
// are sent to Supabase or Yoco, and no real payment credentials are loaded.
function load(relativePath, mocks = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const instance = new Module(filename);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const requireOriginal = instance.require.bind(instance);
  instance.require = name => Object.hasOwn(mocks, name) ? mocks[name]
    : name.startsWith("@/") ? load(`${name.slice(2)}.ts`, mocks)
    : name.startsWith(".") && fs.existsSync(path.resolve(path.dirname(filename), `${name}.ts`)) ? load(path.resolve(path.dirname(filename), `${name}.ts`), mocks)
    : requireOriginal(name);
  instance._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
  return instance.exports;
}

const pricing = load("app/lib/checkout-pricing.ts");
const signature = load("lib/payments/yoco-signature.ts");
const { paymentState, purchasedCartItems } = load("app/lib/payment-status.ts");
const product = { id: "product", brand_id: "brand", name: "T-shirt", price: "R100.00", availableSizes: ["S", "M"], availableMaterials: ["Cotton"], stock: 10 };
const item = { product_id: "product", quantity: 1, size: "S", material: "Cotton" };
const orderId = "11111111-1111-4111-8111-111111111111";
const secret = `whsec_${Buffer.from("payment-test-secret").toString("base64")}`;

function signedRequest(payload, { timestamp = Math.floor(Date.now() / 1000), tampered = false } = {}) {
  const body = JSON.stringify(payload);
  const digest = createHmac("sha256", Buffer.from(secret.slice(6), "base64")).update(`event.${timestamp}.${body}`).digest("base64");
  return new Request("https://shop.example/api/yoco/webhook", { method: "POST", headers: { "webhook-id": "event", "webhook-timestamp": String(timestamp), "webhook-signature": `v1,${digest}` }, body: tampered ? `${body} ` : body });
}

test("server prices ignore supplied item prices and retain The Village delivery rules", () => {
  const requested = pricing.parseCheckoutItems([{ ...item, unit_price: 0.01 }]);
  const delivery = pricing.priceCheckout(requested, [product], "delivery");
  assert.equal(delivery.totalCents, 17500);
  assert.equal(delivery.cartItems[0].unit_price, 100);
  assert.equal(pricing.priceCheckout(requested, [product], "pickup").totalCents, 10000);
  assert.equal(pricing.priceCheckout([{ ...item, quantity: 5 }], [product], "delivery").totalCents, 50000);
  assert.equal(pricing.moneyToCents(0.1 + 0.2), 30);
  assert.throws(() => pricing.moneyToCents(1.001));
});

test("checkout rejects invalid quantities, unavailable variants, stock shortages and mixed brands", () => {
  for (const quantity of [0, -1, 1.5, 100, "2"]) assert.throws(() => pricing.parseCheckoutItems([{ ...item, quantity }]));
  assert.throws(() => pricing.priceCheckout([{ ...item, size: "XXL" }], [product], "delivery"));
  assert.throws(() => pricing.priceCheckout([{ ...item, quantity: 11 }], [product], "delivery"));
  assert.throws(() => pricing.priceCheckout([item], [{ ...product, soldOut: true }], "delivery"));
  assert.throws(() => pricing.priceCheckout([item, { ...item, product_id: "other" }], [product, { ...product, id: "other", brand_id: "other-brand" }], "delivery"));
  assert.throws(() => pricing.moneyToCents("-10"));
});

test("default material is canonicalized without losing the original cart key", () => {
  const result = pricing.priceCheckout([{ ...item, material: "Default" }], [product], "pickup");
  assert.equal(result.cartItems[0].material, "Cotton");
  assert.equal(result.cartItems[0].cart_item_id, "product-S-Default");
});

test("signature verification accepts valid raw bodies and rejects tampering and stale events", async () => {
  const valid = signedRequest({ type: "payment.succeeded" });
  assert.equal(signature.verifyYocoSignature(await valid.text(), valid.headers, secret), true);
  for (const req of [signedRequest({}, { tampered: true }), signedRequest({}, { timestamp: 1 })]) assert.equal(signature.verifyYocoSignature(await req.text(), req.headers, secret), false);
  assert.equal(signature.verifyYocoSignature("{}", new Headers(), secret), false);
});

function database() {
  const state = { order: null, inserts: 0, updates: [], products: [product] };
  const client = { from(table) {
    let action = "select", values, filters = [];
    const query = {
      select() { return query; },
      in() { return Promise.resolve({ data: state.products, error: null }); },
      insert(value) { action = "insert"; values = value; return query; },
      update(value) { action = "update"; values = value; return query; },
      eq(key, value) { filters.push(row => row?.[key] === value); return query; },
      neq(key, value) { filters.push(row => row?.[key] !== value); return query; },
      async single() {
        assert.equal(table, "orders");
        if (action === "insert") { state.inserts++; state.order = { id: orderId, ...values }; }
        return { data: state.order, error: null };
      },
      async maybeSingle() { return { data: filters.every(filter => filter(state.order)) ? state.order : null, error: null }; },
      then(resolve, reject) {
        if (action === "update" && filters.every(filter => filter(state.order))) { state.updates.push(values); Object.assign(state.order, values); }
        return Promise.resolve({ error: null }).then(resolve, reject);
      },
    };
    return query;
  } };
  return { state, client };
}

test("checkout authenticates, generates a server order reference and retains failed attempts", async t => {
  const db = database();
  let authenticated = false;
  let gatewayFailure = false;
  let gatewayPayload;
  const user = { id: "verified-customer", email: "member@example.com" };
  const before = { YOCO_SECRET_KEY: process.env.YOCO_SECRET_KEY, YOCO_WEBHOOK_SECRET: process.env.YOCO_WEBHOOK_SECRET, NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL };
  Object.assign(process.env, { YOCO_SECRET_KEY: "test-only", YOCO_WEBHOOK_SECRET: secret, NEXT_PUBLIC_BASE_URL: "https://shop.example" });
  t.after(() => { for (const [key, value] of Object.entries(before)) if (value === undefined) delete process.env[key]; else process.env[key] = value; });
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    gatewayPayload = JSON.parse(options.body);
    return Response.json(gatewayFailure ? { error: "test failure" } : { id: "ch_fixture", redirectUrl: "https://payments.example/checkout" }, { status: gatewayFailure ? 502 : 200 });
  });
  const { POST } = load("app/api/yoco/create-checkout/route.ts", { "@/lib/supebase/server": { createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: authenticated ? user : null }, error: null }) } }) }, "@/lib/supebase/admin": { supabaseAdmin: db.client } });
  const body = { customer_id: "forged", order_number: "forged", customer_email: "forged@example.com", customer_name: "Member", shipping_method: "delivery", shipping_address: "Test address", cartItems: [item], total_amount: 175 };
  const request = payload => new Request("https://shop.example/api/yoco/create-checkout", { method: "POST", body: JSON.stringify(payload) });
  assert.equal((await POST(request(body))).status, 401);
  assert.equal(db.state.inserts, 0);
  authenticated = true;
  assert.equal((await POST(request({ ...body, total_amount: 0.01 }))).status, 409);
  assert.equal(db.state.inserts, 0);
  assert.equal((await POST(request(body))).status, 200);
  assert.equal(db.state.order.customer_id, user.id);
  assert.equal(db.state.order.email, user.email);
  assert.match(db.state.order.order_id, /^VIL-/);
  assert.equal(db.state.order.payment_status, "pending");
  assert.equal(db.state.order.yoco_checkout_id, "ch_fixture");
  assert.equal(gatewayPayload.amount, 17500);
  assert.ok(gatewayPayload.successUrl.includes(orderId));
  gatewayFailure = true;
  assert.equal((await POST(request(body))).status, 502);
  assert.equal(db.state.order.payment_status, "failed");
});

test("webhook checks signatures, amounts and currency, and does not downgrade paid orders", async t => {
  const before = process.env.YOCO_WEBHOOK_SECRET;
  process.env.YOCO_WEBHOOK_SECRET = secret;
  t.after(() => { if (before === undefined) delete process.env.YOCO_WEBHOOK_SECRET; else process.env.YOCO_WEBHOOK_SECRET = before; });
  const db = database();
  db.state.order = { id: orderId, total: 175, payment_status: "pending", yoco_checkout_id: "ch_fixture" };
  const { handleYocoWebhook } = load("lib/payments/yoco-webhook.ts", { "@/lib/supebase/admin": { supabaseAdmin: db.client } });
  const event = { type: "payment.succeeded", payload: { id: "p_fixture", status: "succeeded", amount: 17500, currency: "ZAR", metadata: { order_id: orderId, checkoutId: "ch_fixture" } } };
  assert.equal((await handleYocoWebhook(new Request("https://shop.example", { method: "POST", body: JSON.stringify(event) }))).status, 401);
  assert.equal((await handleYocoWebhook(signedRequest({ ...event, payload: { ...event.payload, amount: 1 } }))).status, 400);
  assert.equal((await handleYocoWebhook(signedRequest({ ...event, payload: { ...event.payload, currency: "USD" } }))).status, 400);
  assert.equal(db.state.order.payment_status, "pending");
  assert.equal((await handleYocoWebhook(signedRequest(event))).status, 200);
  assert.equal(db.state.order.payment_status, "paid");
  assert.equal(db.state.order.yoco_checkout_id, "ch_fixture");
  assert.equal(db.state.order.yoco_payment_id, "p_fixture");
  assert.equal((await (await handleYocoWebhook(signedRequest(event))).json()).duplicate, true);
  assert.equal((await handleYocoWebhook(signedRequest({ ...event, type: "payment.failed" }))).status, 200);
  assert.equal(db.state.order.payment_status, "paid");
  assert.equal(db.state.updates.length, 1);
});

test("only confirmed payments reconcile the purchased quantities, once per order", () => {
  const { useCartStore } = load("app/lib/cartStore.ts", { "zustand/middleware": { persist: initializer => initializer } });
  useCartStore.setState({ items: [{ id: "product", cartItemId: "product-S-Cotton", quantity: 3 }, { id: "other", cartItemId: "other", quantity: 1 }] });
  const purchased = purchasedCartItems([{ ...item, quantity: 2 }]);
  assert.equal(paymentState("pending"), "pending");
  assert.equal(paymentState("PAID"), "paid");
  assert.equal(paymentState("FAILED"), "failed");
  useCartStore.getState().reconcilePaidOrder(orderId, purchased);
  assert.equal(useCartStore.getState().items[0].quantity, 1);
  assert.equal(useCartStore.getState().items.length, 2);
  useCartStore.getState().reconcilePaidOrder(orderId, purchased);
  assert.equal(useCartStore.getState().items[0].quantity, 1);
  assert.deepEqual(purchasedCartItems("invalid json"), []);
});

test("payment status reads require authentication and ownership", async () => {
  const db = database();
  db.state.order = { id: orderId, customer_id: "owner", payment_status: "pending" };
  let user = null;
  const { GET } = load("app/api/yoco/orders/[orderId]/route.ts", {
    "@/lib/supebase/server": { createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) } }) },
    "@/lib/supebase/admin": { supabaseAdmin: db.client },
  });
  const request = new Request("https://shop.example");
  const context = { params: Promise.resolve({ orderId }) };
  assert.equal((await GET(request, context)).status, 401);
  user = { id: "other-customer" };
  assert.equal((await GET(request, context)).status, 404);
  user = { id: "owner" };
  assert.equal((await GET(request, context)).status, 200);
});

test("the return page distinguishes missing, pending, failed and paid orders", () => {
  const React = requireDependency("react");
  const { renderToStaticMarkup } = requireDependency("react-dom/server");
  for (const status of [null, "pending", "failed", "paid"]) {
    let index = 0;
    let reconciled = 0;
    const effects = [];
    const reference = status ? orderId : null;
    const order = status ? { id: orderId, order_id: "VIL-FIXTURE", total: 175, payment_status: status, shipping_method: "delivery", shipping_address: "Test address", metadata: { cartItems: [item] } } : null;
    const { default: SuccessPage } = load("app/success/page.tsx", {
      react: { ...React, useEffect: callback => effects.push(callback), useState: initial => [index++ === 1 ? { reference, order, loading: false, error: null, timedOut: false, needsSignIn: false } : initial, () => {}] },
      "next/link": { __esModule: true, default: ({ children, ...props }) => React.createElement("a", props, children) },
      "next/navigation": { useSearchParams: () => new URLSearchParams(reference ? { order_id: reference } : {}) },
      "@/app/lib/user": { useUser: () => ({ user: { email: "member@example.com" } }) },
      "@/app/lib/cartStore": { useCartStore: selector => selector({ hasHydrated: true, reconcilePaidOrder: () => reconciled++ }) },
    });
    const markup = renderToStaticMarkup(React.createElement(SuccessPage));
    assert.ok(markup.includes(status === null ? "Missing order reference" : status === "pending" ? "Confirming your payment" : status === "failed" ? "Payment not completed" : "Payment successful"));
    effects[1]();
    assert.equal(reconciled, status === "paid" ? 1 : 0);
  }
});
