// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

const sharedDir = fileURLToPath(new URL('./shared', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Explicit alias for `shared/` so it resolves identically in Vite (app +
  // SSR) and Rollup (Nitro). Without this, Nuxt 4.4 + Vite 7 occasionally
  // emits unresolved relative imports like `./shared/products.ts` in the
  // SSR bundle that Nitro's Rollup can't follow.
  alias: {
    '~~/shared': sharedDir,
  },
  nitro: {
    alias: {
      '~~/shared': sharedDir,
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@sentry/nuxt/module',
    'nuxt-security',
  ],

  security: {
    headers: {
      // We tighten CSP / HSTS / X-Frame-Options below in `routeRules`.
      // Defaults already cover X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'default-src': ["'self'"],
        'connect-src': [
          "'self'",
          'https://www.paypal.com',
          'https://www.sandbox.paypal.com',
          'https://api-m.paypal.com',
          'https://api-m.sandbox.paypal.com',
          // Sentry ingest (replace with your project's DSN host)
          'https://*.ingest.sentry.io',
          'https://*.ingest.us.sentry.io',
          'https://*.ingest.de.sentry.io',
        ],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'https://www.paypal.com',
          'https://www.paypalobjects.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'frame-src': [
          "'self'",
          'https://www.paypal.com',
          'https://www.sandbox.paypal.com',
        ],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': true,
      },
      strictTransportSecurity: {
        maxAge: 60 * 60 * 24 * 365,
        includeSubdomains: true,
        preload: true,
      },
      xFrameOptions: 'DENY',
      crossOriginEmbedderPolicy: false, // PayPal iframes won't load with COEP=require-corp
    },
    rateLimiter: false, // we configure per-route below
    requestSizeLimiter: {
      maxRequestSizeInBytes: 524288, // 512 KB — enough for cart payloads, blocks abuse
    },
    corsHandler: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    },
  },

  // Per-route security: tight rate limits on PayPal + admin entry points.
  routeRules: {
    '/api/paypal/**': {
      security: {
        rateLimiter: { tokensPerInterval: 10, interval: 60_000 },
      },
    },
    '/api/orders/**': {
      security: {
        rateLimiter: { tokensPerInterval: 60, interval: 60_000 },
      },
    },
    '/api/admin/login': {
      security: {
        rateLimiter: { tokensPerInterval: 5, interval: 60_000 },
      },
    },
    '/api/admin/**': {
      security: {
        rateLimiter: { tokensPerInterval: 120, interval: 60_000 },
      },
    },
  },

  sentry: {
    sourceMapsUploadOptions: {
      // Disabled by default; set SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT
      // env vars in CI to enable uploads.
      enabled: false,
    },
  },

  site: {
    url:
      (globalThis as { process?: { env?: Record<string, string | undefined> } })
        .process?.env?.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: '巷口 Alley',
  },

  sitemap: {
    sources: ['/api/__sitemap__/products'],
    exclude: ['/admin/**', '/checkout', '/success', '/orders/**'],
    autoLastmod: true,
    xsl: false,
  },

  image: {
    format: ['avif', 'webp'],
    quality: 82,
    presets: {
      productCard: {
        modifiers: { format: 'webp', quality: 82, width: 600, height: 750, fit: 'cover' },
      },
      productHero: {
        modifiers: { format: 'webp', quality: 85, width: 1200, height: 1500, fit: 'cover' },
      },
      thumb: {
        modifiers: { format: 'webp', quality: 70, width: 200, height: 250, fit: 'cover' },
      },
    },
    densities: [1, 2],
    screens: {
      xs: 480,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  css: ['~/assets/css/tailwind.css'],

  tailwindcss: {
    configPath: '~~/tailwind.config.ts',
    cssPath: '~/assets/css/tailwind.css',
    viewer: false,
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'paypal_shop_theme',
  },

  googleFonts: {
    families: {
      Fraunces: {
        wght: [400, 500, 600, 700],
        ital: [400],
      },
      Inter: [400, 500, 600, 700],
      'Noto+Serif+SC': [400, 600, 700],
    },
    display: 'swap',
    download: true,
    inject: true,
  },

  app: {
    head: {
      title: '巷口 Alley · 中式街头小吃',
      htmlAttrs: { lang: 'zh-Hans' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            '巷口 Alley — a small editorial Chinese street-food collective. Cooked-to-order and delivered.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', href: '/favicon.ico' },
      ],
    },
  },

  runtimeConfig: {
    paypalClientId: '',
    paypalClientSecret: '',
    paypalEnv: 'sandbox',
    paypalWebhookId: '',
    adminPassword: '',
    adminSessionSecret: '',
    resendApiKey: '',
    mailFromAddress: '',
    mailFromName: 'Alley Shop',
    mailKitchenAddress: '',
    siteUrl: 'http://localhost:3000',
    public: {
      paypalClientId: '',
      paypalCurrency: 'USD',
      siteUrl: 'http://localhost:3000',
      umamiHost: '',       // e.g. https://shop.example.com/umami
      umamiWebsiteId: '',  // UUID from Umami admin panel
      sentry: {
        dsn: '',
        environment: 'production',
      },
    },
  },
})
