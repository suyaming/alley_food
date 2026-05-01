# Tests

Two test layers, run independently.

## Unit (Vitest)

Fast deterministic tests for pure functions, the order FSM, the SQLite layer (against a temp DB), and product catalogue integrity.

```bash
npm test          # one-shot
npm run test:watch
```

Files:

- `test/products.test.ts` — 80-product catalogue completeness, slug uniqueness, image existence
- `test/order-fsm.test.ts` — happy path + illegal transitions
- `test/orders.test.ts` — saveOrder / updateOrder / getOrder / listOrders against a fresh on-disk SQLite

## End-to-end (Playwright)

Boots the Nuxt dev server on port 3001 (so you can keep `npm run dev` on 3000 in parallel) and drives a real Chromium.

First-time setup (once):

```bash
npx playwright install chromium
```

Run:

```bash
npm run test:e2e
```

Files:

- `test/e2e/checkout.spec.ts` — three flows:
  1. Home → product → add to cart → cart → checkout
  2. Cmd/Ctrl-K opens search and matches
  3. `/admin` redirects to `/admin/login` when unauthenticated

The full PayPal sandbox popup is **not** asserted here because it requires a buyer account and exercises PayPal's iframes (brittle). The CI pipeline (`.github/workflows/ci.yml`) runs only the unit tests.
