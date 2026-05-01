# 巷口 Alley · 上线部署指南（腾讯云国际版 HK）

本文档配合 [DEPLOY.md](DEPLOY.md)（英文原版）使用，假设你从零开始把站点跑到一台**腾讯云国际版**香港轻量服务器上，使用 Docker + Caddy 自动 HTTPS。整套流程也能直接搬到任何 Ubuntu/Debian 的 VPS 上。

> **为什么选香港 / 腾讯云国际版？**
> - 不需要 ICP 备案（vs. 大陆主机）
> - 支持支付宝 / 微信付款（vs. AWS / GCP 必须外卡）
> - 香港节点对大陆用户延迟低，同时位于 GFW 之外，调用 PayPal / Resend / OpenRouter / Sentry 都不用代理

英文版本走通后再翻这份中文文档当 checklist 用最稳。

---

## 1 · 开机

1. 注册 [intl.cloud.tencent.com](https://intl.cloud.tencent.com)，需要**非大陆手机号** + 邮箱，付款用支付宝 / 微信
2. 在 **轻量应用服务器（Lighthouse）** 创建实例
   - 地域：**Hong Kong, China**
   - 系统镜像：**Ubuntu 22.04 LTS**
   - 配置：2 vCPU / 4 GB RAM / 80 GB SSD（最低跑得动 Node + Caddy + Umami 的组合）
   - 带宽：30 Mbps 峰值（按预期流量调整）
3. 在腾讯控制台 → "防火墙" 面板开放：**80**、**443**、**22**

## 2 · 域名 + DNS

1. 注册域名。**DNSPod**（腾讯系）支持支付宝 / 微信；Namecheap、Cloudflare 也可以但要外卡
2. 加一条 **A 记录**：把你的域名（例如 `shop.example.com`）指向 VPS 公网 IP
3. 等 5–10 分钟 DNS 生效（`nslookup shop.example.com` 验证一下）

## 3 · 服务器初始化

SSH 进去（`ssh root@<vps-ip>`），一次性跑这套：

```bash
# 系统更新 + 必备工具
apt-get update && apt-get -y upgrade
apt-get install -y git ufw curl ca-certificates sqlite3

# 防火墙：只开 SSH / HTTP / HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 装 Docker Engine + Compose v2（官方一键脚本）
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# 可选：建一个非 root 操作账户
adduser ops --disabled-password --gecos ""
usermod -aG docker ops
mkdir -p /home/ops/.ssh
cp ~/.ssh/authorized_keys /home/ops/.ssh/
chown -R ops:ops /home/ops/.ssh
```

## 4 · 拉代码

```bash
mkdir -p /opt/alley-shop
chown -R ops:ops /opt/alley-shop
sudo -u ops -H bash -c '
  cd /opt
  git clone https://github.com/<your-username>/paypal_shop.git alley-shop
  cd alley-shop
  cp .env.production.example .env.production
'
```

打开 `/opt/alley-shop/.env.production`，把所有占位值填成真值——PayPal live 凭证、Resend API key、域名、管理后台密码等等。

> **邮件 — Resend 配置流程**
> 1. 注册 [resend.com](https://resend.com)（每月 3 000 封免费额度，每天 100 封）
> 2. **Domains** → Add `your-domain.com`，把生成的 SPF + DKIM TXT 记录复制到你的 DNS 服务商（DNSPod / Cloudflare 都行），等 1–5 分钟变绿
> 3. **API Keys** → Create → 复制 `re_xxxxxxxx`，粘贴到 `NUXT_RESEND_API_KEY`
> 4. **From 地址必须是已验证域名下的邮箱**（如 `hello@your-domain.com`），Resend 不允许从未验证域名发件

## 5 · 第一次启动

```bash
cd /opt/alley-shop
DOMAIN=shop.example.com docker compose up -d --build
docker compose logs -f app   # 看启动日志，等到 `Listening on http://0.0.0.0:3000`
```

Caddy 第一次访问时会自动向 Let's Encrypt 申请证书（约 5 秒）。打开浏览器访问 `https://shop.example.com`，应该看到首页正常加载且无证书警告。

冒烟测试：

```bash
curl -fsS https://shop.example.com/api/health   # → { "ok": true, ... }
curl -fsS https://shop.example.com/sitemap.xml | head -20
```

## 6 · PayPal sandbox → live 切换

只要这一步没做，站点收的全是沙箱付款，买家在 PayPal 弹窗里会看到 "PayPal Sandbox" 字样。

### 6.1 拿 live 凭证

1. 打开 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/live) → "My Apps & Credentials" → 顶部开关切到 **Live**
2. 点 "Create App"（或选已有的 live app），起个有意义的名字
3. 复制 `Client ID` → 填到 `.env.production` 的 `NUXT_PAYPAL_CLIENT_ID` 和 `NUXT_PUBLIC_PAYPAL_CLIENT_ID` 两处
4. 复制 `Secret` → 填到 `NUXT_PAYPAL_CLIENT_SECRET`

### 6.2 配置回调地址（在 live app 设置里）

- Return URL: `https://shop.example.com/checkout`
- Cancel URL: `https://shop.example.com/checkout`
- 可选 success page: `https://shop.example.com/success`

### 6.3 切换 env

```bash
sed -i 's/NUXT_PAYPAL_ENV=sandbox/NUXT_PAYPAL_ENV=live/' .env.production
docker compose up -d --build app
```

### 6.4 订阅 live webhook

详见下文 §7。

### 6.5 端到端 live 烟测

- 用另一台设备 / 另一种支付方式下一笔真实的 $0.01 或 $0.10 测试单
- 验证 `/orders` 显示该订单状态为 `CAPTURED`，order id 是真实的
- 检查买家邮箱 + 厨房邮箱都收到通知
- 在 PayPal 后台对该订单发起退款，验证 webhook 能把状态翻成 `REFUNDED`，且退款邮件已发出
- 翻一下 Sentry / docker 日志，确认没有意外告警

任何一步失败：直接把 `NUXT_PAYPAL_ENV` 改回 `sandbox` 重启容器，开关就这一个。

## 7 · PayPal Webhook 订阅

PayPal 必须在 URL 公开可达后才能签 webhook。

1. 进入 [PayPal Developer → My Apps & Credentials → Live](https://developer.paypal.com/dashboard/applications/live)
2. 打开你的 live app → **Add Webhook**
3. URL：`https://shop.example.com/api/paypal/webhook`
4. 至少订阅以下事件：
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `PAYMENT.CAPTURE.REVERSED`
   - `PAYMENT.CAPTURE.DENIED`
   - `CUSTOMER.DISPUTE.CREATED`
5. 复制生成的 **Webhook ID**，粘贴到 `.env.production` 的 `NUXT_PAYPAL_WEBHOOK_ID`
6. 重启：`docker compose up -d --build app`
7. 在 PayPal 后台用 webhook 测试器触发一条 `PAYMENT.CAPTURE.COMPLETED`，同时盯日志：
   ```bash
   docker compose logs -f app | grep webhook
   ```

## 8 · 每日备份

```bash
chmod +x /opt/alley-shop/scripts/backup.sh
crontab -e
# 加这一行（每日凌晨 3 点跑）：
0 3 * * * /opt/alley-shop/scripts/backup.sh >> /var/log/alley-backup.log 2>&1
```

备份文件落在 `/opt/alley-shop/backups/`，自动 gzip 压缩、自动清理 30 天前的旧文件。

## 9 · 滚动发布

在你本机（替换 `<vps-ip>`）：

```bash
DEPLOY_HOST=<vps-ip> DEPLOY_USER=ops ./scripts/deploy.sh
```

脚本会 SSH 上去，`git pull` 最新 `main`、重建 app 容器、跑健康检查。整个过程 Caddy 不停。

想做零停机：把命令改成 `docker compose up -d --build --no-deps --force-recreate app`——新容器健康后 Caddy 立即切流量。

## 10 · Umami 自托管分析

Umami 作为独立容器与 app 平行运行，共用 postgres 密码。反向代理走 `/umami` 路径，省一个二级域名。

1. **首次启动**：`docker compose up -d` 已经一并起来了。访问 `https://shop.example.com/umami`，默认账号 `admin / umami`，进去先到 Settings → Profile 改密码
2. **加站点**：Umami → Websites → Add，名字随便填，domain 填真实域名
3. 复制 "Tracking code" 标签下的 **Website ID**（UUID 格式）
4. 在 VPS 上：
   ```bash
   sed -i 's|^NUXT_PUBLIC_UMAMI_HOST=.*|NUXT_PUBLIC_UMAMI_HOST=https://shop.example.com/umami|' .env.production
   sed -i "s|^NUXT_PUBLIC_UMAMI_WEBSITE_ID=.*|NUXT_PUBLIC_UMAMI_WEBSITE_ID=<刚才那个 UUID>|" .env.production
   docker compose up -d --build app
   ```
5. 访客点 cookie 横幅的 **Accept all** 后才会上报。Umami 后台能看到页面访问以及 `add_to_cart` / `checkout_initiated` / `purchase` 三个自定义事件

## 11 · 安全 + 监控（已开箱即用）

- `nuxt-security` 自动给 `/api/paypal/*`、`/api/admin/login` 等关键路由限流
- `@sentry/nuxt` 错误监控——把 DSN 填进 `.env.production` 的 `NUXT_PUBLIC_SENTRY_DSN` 就生效
- GitHub Actions 自动部署（推 `main` 分支即触发，见 `.github/workflows/deploy.yml`）
- 安全 header（CSP / HSTS / X-Frame-Options 等）已经默认开启，没什么需要手动配的

## 12 · 故障排查

| 现象 | 解法 |
|---|---|
| `Caddy: tls handshake failed` | DNS 还没生效，或腾讯云"防火墙"面板没开 80/443 |
| Webhook 回 `503 webhook-not-configured` | `NUXT_PAYPAL_WEBHOOK_ID` 是空的 |
| Webhook 回 `401 signature-invalid` | 服务器时钟漂移 > 5 分钟，或 webhook ID 填错。`timedatectl set-ntp true` 修一下 |
| `EACCES /app/data/orders.db` | volume 是 root 所有。在宿主机跑 `chown -R 1000:1000 ./data`（匹配容器内的 `node` 用户）|
| `docker build` 内存不够 | 加个 2GB+ 的 swap，或本机 build 完用 `docker save`/`docker load` 传上去 |
| Resend 邮件 403 | sender 地址用了未验证域名。换成你在 Resend 验证过的域名邮箱 |
| 首页 loading 闪烁 | 多半是 HMR 残留，刷新两次或 `docker compose restart app` |

## 13 · 域名 / 邮件 DNS 速查表

把这几条记录加到你的 DNS 服务商（每个单独一行）：

| 类型 | 主机 | 值 | 用途 |
|---|---|---|---|
| A | `shop` | `<VPS 公网 IP>` | 网站本体 |
| TXT | `@` (或 `send` 子域，看 Resend 给的) | `v=spf1 include:_spf.resend.com ~all` | 防伪造发件 |
| TXT | `resend._domainkey` | `<Resend 控制台给的 DKIM>` | DKIM 签名 |
| MX | `@` | 可选——只有你想 **接收** 邮件才需要 | |

> 只发不收的话 MX 不是必须的；Resend 是单向发件服务。如果想收 `kitchen@your-domain.com`，得再配一个邮箱托管（Zoho Mail 免费版 / 腾讯企业邮 / Cloudflare Email Routing）。

## 14 · 上线前最后一遍 checklist

```
[ ] 域名 A 记录已指向 VPS
[ ] HTTPS 已签发（访问首页无警告）
[ ] /api/health 返回 200
[ ] /sitemap.xml 列出全部 88 个产品
[ ] 沙箱下完整跑一遍 下单 → 支付 → 邮件 → 退款
[ ] PayPal live app 凭证已填、回调地址已加白
[ ] webhook 已订阅 5 个事件、ID 已填
[ ] NUXT_PAYPAL_ENV=live 已切换并重启
[ ] live 模式做了 $0.01-0.10 真实小额测试单
[ ] 管理后台密码已改成 32 字符以上随机串
[ ] cron 备份已配置且第一次跑过
[ ] Sentry DSN 已配置、能在面板看到测试事件
[ ] Umami 已建站、首页能看到自己的访问
```

打完这 13 项就可以放心给真实用户用了。
