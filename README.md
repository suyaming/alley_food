# 巷口 Alley · A Snack Shop Demo

> A small Chinese street-food collective.

A demo storefront built with **Nuxt 4 + Tailwind CSS** that checks out through
the **PayPal Orders v2 REST API**. The brand identity (name, logo, palette,
typography) was generated following the
[ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
methodology for the design system, and the
[logo-generator-skill](https://github.com/op7418/logo-generator-skill)
methodology for the wordmark — six SVG variants live in `public/logos/`, the
interactive showcase at `public/showcase.html`, and the picked variant
(`v2 朱印 Vermilion Stamp`) is wired into the site via
`app/components/BrandMark.vue`.

Products are static (8 snacks defined in `shared/products.ts`), the cart lives
in `localStorage`, and orders are stored in-memory on the server — perfect for
demos, no database required.

The integration follows the recommended secure flow:

- The browser only ever sees the PayPal **client id**.
- The PayPal **client secret** is used exclusively in Nuxt server routes.
- All cart amounts are **recomputed on the server** from the canonical
  `shared/products.ts` data — the browser only sends `{ productId, quantity }`.

## Stack

| Concern        | Choice                                                |
| -------------- | ----------------------------------------------------- |
| Framework      | Nuxt 4 (Vue 3 + Nitro)                                |
| Styling        | `@nuxtjs/tailwindcss`                                 |
| PayPal client  | Hosted JS SDK (`https://www.paypal.com/sdk/js`)       |
| PayPal server  | Direct REST calls to `/v1/oauth2/token` + `/v2/checkout/orders` |
| Cart state     | `useState` + `localStorage`                           |
| Order storage  | In-memory `Map` (resets on server restart)            |

## 1. Get PayPal sandbox credentials

1. Sign in at <https://developer.paypal.com/dashboard/applications/sandbox>.
2. Create (or open) a **Sandbox** REST API app. Copy the **Client ID** and
   **Secret**.
3. Under **Testing Tools → Sandbox Accounts** make sure you have a
   *Personal* (buyer) test account — note the email and password. You will
   sign in with this account inside the PayPal popup during checkout.

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

```env
# Server-only (never exposed to the browser)
NUXT_PAYPAL_CLIENT_ID=your_paypal_client_id
NUXT_PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NUXT_PAYPAL_ENV=sandbox            # or "live"

# Browser-visible (PayPal JS SDK needs the client id)
NUXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NUXT_PUBLIC_PAYPAL_CURRENCY=USD
```

> The same client id appears twice on purpose: PayPal's hosted JS SDK runs in
> the browser and needs the public id, while the server uses the (private)
> secret for OAuth.

## 3. Install & run

```bash
npm install
npm run dev
```

The app starts at `http://localhost:3000` (or `:3001` if 3000 is busy).

## 4. Try the checkout

1. Add a few products to the cart from the home page.
2. Open `/cart` and click **Checkout with PayPal**.
3. Click the yellow **PayPal** button, then sign in with your sandbox
   *personal* (buyer) account in the popup.
4. Approve the payment. You will be redirected to `/success?orderId=...` with
   a receipt that shows the captured amount, capture id, and buyer.

You can also verify the captured order in the
[PayPal sandbox dashboard](https://www.sandbox.paypal.com/myaccount/transactions/).

## Project layout

```
app/
  app.vue                    # Layout with <SiteHeader /> and <NuxtPage />
  assets/css/tailwind.css    # Tailwind entry + design tokens
  components/
    SiteHeader.vue
    ProductCard.vue
    PaypalButton.vue         # Loads PayPal JS SDK and renders Smart Buttons
  composables/
    useCart.ts               # Cart state + localStorage persistence
    usePaypal.ts             # Idempotent PayPal SDK loader
  pages/
    index.vue                # Product grid
    product/[id].vue         # Product detail
    cart.vue
    checkout.vue             # PayPal button + summary
    success.vue              # Order receipt
server/
  utils/
    paypal.ts                # OAuth token cache + REST helper
    orders.ts                # In-memory order store
  api/
    paypal/
      create-order.post.ts   # Server-side amount calculation + create order
      capture-order.post.ts  # Capture the approved order
    orders/[id].get.ts       # Receipt fetch endpoint
shared/
  types.ts                   # Product / CartItem / OrderRecord types
  products.ts                # Static product catalog (used by client AND server)
```

## Going to production

A few things you would want to add before pointing this at real money:

- Switch `NUXT_PAYPAL_ENV` to `live` and use live API credentials.
- Replace the in-memory `orders` map with a real database (Postgres, SQLite +
  Prisma, etc.).
- Add a webhook endpoint for `PAYMENT.CAPTURE.COMPLETED` /
  `PAYMENT.CAPTURE.DENIED` to keep order state authoritative even if the
  browser disconnects between approve and capture.
- Add shipping address collection (set
  `application_context.shipping_preference` to `GET_FROM_FILE` or pass a full
  shipping object) and tax/shipping into the `amount.breakdown`.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run preview    # preview the production build locally
```
