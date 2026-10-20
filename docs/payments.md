# Storefront payments

The storefront now follows the Mazwi Store lifecycle: authenticate the customer,
create a pending order, redirect to Yoco, and show the verified payment status on
return. The Village retains its per-brand checkout and delivery pricing: R75 below
R500, free delivery from R500, and free pickup from a configured brand address.

## Configuration

- `NEXT_PUBLIC_BASE_URL`: the deployed website origin, including `https://`.
- `YOCO_SECRET_KEY`: the matching test or live Yoco API secret.
- `YOCO_WEBHOOK_SECRET`: the signing secret for the configured webhook subscription.

Use `/api/yoco/webhook` as the storefront webhook URL. The existing
`/api/webhooks/yoco` URL calls the same handler for backwards compatibility. Use
the secret belonging to the actual subscription; registering another subscription
can produce a different signing secret. Checkout refuses to start if verification
is not configured.

The checkout API uses existing `orders` fields and `metadata.cartItems`, with prices,
product details, customer identity, and pickup details resolved server-side. The
payment amount is calculated in integer cents. Returned payments are checked
against the saved amount and currency before the order becomes paid. Checkout IDs
and payment IDs remain separate. Duplicate events are safe and a failed event
cannot downgrade a paid order.

The return page polls the authenticated `/api/yoco/orders/[orderId]` endpoint every
three seconds for up to two minutes, with a manual retry afterwards. It removes
only paid quantities from the cart, once per order, and preserves other brands and
items added while payment was in progress. Neither a redirect nor opening a URL
marks an order paid. Failed checkout attempts are retained for reconciliation.

The legacy `/order-success` page uses the same verified status screen. The unused
`/api/villageorders/create` endpoint returns HTTP 410 rather than accepting
browser-supplied paid orders.

## Separate custom-design checkout

The custom-design checkout still uses its existing order schema and routes. Its
webhook now also verifies signatures before processing events; it must use the
correct `YOCO_WEBHOOK_SECRET`. This change does not migrate design orders into the
storefront product catalogue or alter design pricing.

## Verification

Run `npm run test:payments` and `npm run build`. Payment tests use isolated mocks;
they do not contact Yoco, send emails, create charges, or change live order data.
Before enabling live payments, verify the configured webhook subscription with a
Yoco test-mode checkout and confirm a matching amount moves the pending order to
paid. No live transaction or webhook subscription is created by this code change.
