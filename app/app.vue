<script setup lang="ts">
const year = new Date().getFullYear()
const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl || '').replace(/\/$/, '')

useSeoMeta({
  ogSiteName: '巷口 Alley',
  ogLocale: 'zh_Hans',
  ogImage: `${siteUrl}/mockups/01-stamp-on-paper.png`,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg text-fg">
    <SiteHeader />
    <SearchOverlay />
    <CookieBanner />
    <main class="flex-1">
      <NuxtPage
        :transition="{
          name: 'page',
          mode: 'out-in',
        }"
      />
    </main>

    <footer class="border-t border-line mt-24">
      <div
        class="container-px max-w-7xl mx-auto py-14 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-sm"
      >
        <!-- Col 1 — Brand -->
        <div class="col-span-2 md:col-span-1">
          <BrandMark :size="28" />
          <p class="text-muted mt-3 max-w-xs leading-relaxed">
            巷口 Alley · a small Chinese street-food collective. Cooked-to-order
            and delivered to your door.
          </p>
          <a
            href="mailto:hello@alley.food"
            class="mt-4 inline-block text-fg underline underline-offset-4 hover:opacity-70"
          >
            hello@alley.food
          </a>
        </div>

        <!-- Col 2 — Shop -->
        <div>
          <p class="small-caps text-muted">Shop · 菜单</p>
          <ul class="mt-3 space-y-2">
            <li>
              <NuxtLink to="/" class="hover:underline underline-offset-4">
                All dishes
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cart" class="hover:underline underline-offset-4">
                Cart
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/checkout"
                class="hover:underline underline-offset-4"
              >
                Checkout
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/orders"
                class="hover:underline underline-offset-4"
              >
                Order tracking
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3 — Help -->
        <div>
          <p class="small-caps text-muted">Help · 帮助</p>
          <ul class="mt-3 space-y-2">
            <li>
              <NuxtLink
                to="/help/shipping"
                class="hover:underline underline-offset-4"
              >
                Shipping
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/help/returns"
                class="hover:underline underline-offset-4"
              >
                Returns
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/help/faq"
                class="hover:underline underline-offset-4"
              >
                FAQ
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/help/contact"
                class="hover:underline underline-offset-4"
              >
                Contact
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 4 — Brand & Legal -->
        <div>
          <p class="small-caps text-muted">Brand &amp; legal</p>
          <ul class="mt-3 space-y-2">
            <li>
              <NuxtLink
                to="/about"
                class="hover:underline underline-offset-4"
              >
                About
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/legal/privacy"
                class="hover:underline underline-offset-4"
              >
                Privacy
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/legal/terms"
                class="hover:underline underline-offset-4"
              >
                Terms
              </NuxtLink>
            </li>
            <li>
              <a
                href="/showcase.html"
                target="_blank"
                rel="noopener"
                class="hover:underline underline-offset-4"
              >
                Logo showcase ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="border-t border-line container-px max-w-7xl mx-auto py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted"
      >
        <p>© {{ year }} 巷口 Alley · A demo storefront.</p>
        <p>
          Built with Nuxt 4 &amp; Tailwind CSS · Brand by
          <a
            class="underline underline-offset-4"
            href="https://github.com/op7418/logo-generator-skill"
            target="_blank"
            rel="noopener"
          >
            logo-generator-skill
          </a>.
        </p>
      </div>
    </footer>

    <CartDrawer />
  </div>
</template>
