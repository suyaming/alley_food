# Deploying 巷口 Alley to a Tencent Cloud HK VPS

> 🇨🇳 中文版本：[DEPLOY.zh-CN.md](DEPLOY.zh-CN.md)

This walks through a first-time deploy onto **Tencent Cloud International** (轻量应用服务器, HK 节点) using Docker + Caddy. The setup is also portable to any Ubuntu/Debian VPS.

> **Why HK / Tencent International?** No ICP licence required (vs. Mainland), pays via Alipay / WeChat (vs. needing a foreign card on AWS/GCP), and the Hong Kong region keeps latency low for Mainland-adjacent users while remaining outside the GFW for outbound calls (PayPal, OpenRouter, etc.).

---

## 1 · Provision the VPS

1. Sign up at [intl.cloud.tencent.com](https://intl.cloud.tencent.com) — needs a non-Mainland phone number + email; pay with Alipay/WeChat.
2. **Lighthouse / Lightweight Application Server**
   - Region: **Hong Kong, China**
   - OS: **Ubuntu 22.04 LTS**
   - Spec: 2 vCPU / 4 GB RAM / 80 GB SSD (the smallest one that comfortably runs Node + Caddy + future Umami)
   - Bandwidth: 30 Mbps peak (or higher if you expect traffic)
3. Open the firewall (Tencent's "防火墙" panel) for: **80**, **443**, **22**.

## 2 · Domain + DNS

1. Register a domain. **DNSPod** (Tencent's registrar) takes Alipay/WeChat. Namecheap and Cloudflare also work but require a foreign card.
2. Add an **A record** pointing your domain (e.g. `shop.example.com`) to the VPS public IP.
3. Wait 5–10 minutes for propagation (`nslookup shop.example.com`).

## 3 · Server bootstrap

SSH into the box (`ssh root@<vps-ip>`) and run:

```bash
# System updates
apt-get update && apt-get -y upgrade
apt-get install -y git ufw curl ca-certificates sqlite3

# Firewall (open SSH, HTTP, HTTPS only)
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install Docker Engine + Compose v2 (official script)
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Optional: create a non-root operator
adduser ops --disabled-password --gecos ""
usermod -aG docker ops
mkdir -p /home/ops/.ssh
cp ~/.ssh/authorized_keys /home/ops/.ssh/
chown -R ops:ops /home/ops/.ssh
```

## 4 · Clone the repo

```bash
mkdir -p /opt/alley-shop
chown -R ops:ops /opt/alley-shop
sudo -u ops -H bash -c '
  cd /opt
  git clone https://github.com/<you>/paypal_shop.git alley-shop
  cd alley-shop
  cp .env.production.example .env.production
'
```

Edit `/opt/alley-shop/.env.production` and fill in **all** values (PayPal live creds, Resend API key, domain, admin password, etc.).

> **Email — Resend setup**: sign up at [resend.com](https://resend.com), add your sending domain, paste the SPF/DKIM DNS records into your DNS provider, wait for verification (usually < 5 min), then create an API key under [resend.com/api-keys](https://resend.com/api-keys) and put it in `NUXT_RESEND_API_KEY`. Free tier covers 3 000 emails/month.

## 5 · First boot

```bash
cd /opt/alley-shop
DOMAIN=shop.example.com docker compose up -d --build
docker compose logs -f app   # watch boot, look for `Listening on http://0.0.0.0:3000`
```

Caddy will request a Let's Encrypt cert on first request (~5 s). Visit `https://shop.example.com` — should serve the homepage on HTTPS with no warnings.

Smoke checks:

```bash
curl -fsS https://shop.example.com/api/health   # → { "ok": true, ... }
curl -fsS https://shop.example.com/sitemap.xml | head -20
```

## 6 · PayPal sandbox → live cutover

Until you flip these switches the site is taking sandbox payments only. Your buyers will see "PayPal Sandbox" in the popup.

1. **Get live API credentials**
   - Open [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/live) → "My Apps & Credentials" → switch the toggle to **Live**.
   - Click "Create App" (or use an existing live app). Pick a meaningful name.
   - Copy `Client ID` → `NUXT_PAYPAL_CLIENT_ID` + `NUXT_PUBLIC_PAYPAL_CLIENT_ID`.
   - Copy `Secret` → `NUXT_PAYPAL_CLIENT_SECRET`.

2. **Whitelist callback URLs** (under the live app's settings)
   - Return URL: `https://shop.example.com/checkout`
   - Cancel URL: `https://shop.example.com/checkout`
   - Optional success page: `https://shop.example.com/success`

3. **Switch env**
   ```bash
   sed -i 's/NUXT_PAYPAL_ENV=sandbox/NUXT_PAYPAL_ENV=live/' .env.production
   docker compose up -d --build app
   ```

4. **Subscribe the live webhook** — see §7 below.

5. **End-to-end smoke test in live**
   - Make a real $0.01 (or 0.10 USD) purchase from another browser / payment method.
   - Verify the order shows `CAPTURED` in `/orders` (with the real order id).
   - Verify the buyer + kitchen emails arrive.
   - Issue a refund from the PayPal dashboard; verify the webhook flips status to `REFUNDED` and the refund email goes out.
   - Check Sentry / app logs for any unexpected warnings.

If anything fails, flip `NUXT_PAYPAL_ENV` back to `sandbox` and rebuild — the env is the only switch.

## 7 · PayPal webhook

PayPal can only sign webhooks once the URL is publicly reachable.

1. Go to [PayPal Developer → My Apps & Credentials → Live](https://developer.paypal.com/dashboard/applications/live).
2. Open your live app → **Add Webhook**.
3. URL: `https://shop.example.com/api/paypal/webhook`
4. Events to subscribe (minimum):
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `PAYMENT.CAPTURE.REVERSED`
   - `PAYMENT.CAPTURE.DENIED`
   - `CUSTOMER.DISPUTE.CREATED`
5. Copy the **Webhook ID**, paste into `.env.production` as `NUXT_PAYPAL_WEBHOOK_ID`.
6. Restart: `docker compose up -d --build app`
7. Use the webhook tester in the dashboard to fire a `PAYMENT.CAPTURE.COMPLETED` and watch the app log:
   ```bash
   docker compose logs -f app | grep webhook
   ```

## 8 · Daily backup

```bash
chmod +x /opt/alley-shop/scripts/backup.sh
crontab -e
# add this line:
0 3 * * * /opt/alley-shop/scripts/backup.sh >> /var/log/alley-backup.log 2>&1
```

Backups land in `/opt/alley-shop/backups/`, compressed and pruned to 30 days.

## 9 · Rolling deploys

From your dev machine (replace `<vps-ip>`):

```bash
DEPLOY_HOST=<vps-ip> DEPLOY_USER=ops ./scripts/deploy.sh
```

This SSHes in, pulls latest `main`, rebuilds the app container, and runs the health check. Caddy stays up the whole time.

For zero-downtime, switch to `docker compose up -d --build --no-deps --force-recreate app` — Caddy will simply re-route as soon as the new container is healthy.

## 10 · Analytics (Umami)

Umami runs as a separate container next to the app, sharing only the postgres password env. It's reverse-proxied at `/umami` so you don't need an extra subdomain.

1. **First run** — already started by `docker compose up -d`. Visit `https://shop.example.com/umami` and log in (default `admin / umami`). Change the password in Settings → Profile.
2. **Add a website** in Umami → Websites → Add. Pick any name, set the domain to your real domain.
3. Copy the **Website ID** (UUID under the "Tracking code" tab).
4. Set on the VPS:
   ```bash
   sed -i 's|^NUXT_PUBLIC_UMAMI_HOST=.*|NUXT_PUBLIC_UMAMI_HOST=https://shop.example.com/umami|' .env.production
   sed -i "s|^NUXT_PUBLIC_UMAMI_WEBSITE_ID=.*|NUXT_PUBLIC_UMAMI_WEBSITE_ID=<paste-uuid-here>|" .env.production
   docker compose up -d --build app
   ```
5. Visitors who click **Accept all** in the cookie banner will now appear in the Umami dashboard. Page views, `add_to_cart`, `checkout_initiated`, and `purchase` events are tracked.

## 11 · Tightening (Phase 3 work)

- `nuxt-security` rate-limits `/api/paypal/*`, `/api/admin/login`, etc.
- `@sentry/nuxt` for error monitoring (DSN in `.env.production`).
- GitHub Actions auto-deploys on `main` (see `.github/workflows/deploy.yml`).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Caddy: tls handshake failed` | DNS not yet propagated, or port 80/443 blocked by Tencent's "防火墙" panel. |
| Webhook returns `503 webhook-not-configured` | `NUXT_PAYPAL_WEBHOOK_ID` is empty. |
| Webhook returns `401 signature-invalid` | Server clock drift > 5 min, or wrong webhook ID. Run `timedatectl set-ntp true`. |
| `EACCES /app/data/orders.db` | Volume owned by root. Run `chown -R 1000:1000 ./data` on the host (matches the `node` user inside the container). |
| Out of memory during `docker build` | Use a 2GB+ swap or build the image locally and `docker save`/`load` to the VPS. |
