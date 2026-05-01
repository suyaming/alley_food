<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, Plus, Minus, Check, ShieldCheck, Truck } from 'lucide-vue-next'
import { getProduct, products } from '../../../shared/products'

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id))
const product = computed(() => getProduct(id.value))

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found.' })
}

const config = useRuntimeConfig()
const siteUrl = computed(
  () => (config.public.siteUrl || '').replace(/\/$/, ''),
)

const productUrl = computed(
  () => `${siteUrl.value}/product/${product.value!.id}`,
)
const productImageUrl = computed(
  () =>
    product.value!.image.startsWith('http')
      ? product.value!.image
      : `${siteUrl.value}${product.value!.image}`,
)

useSeoMeta({
  title: () => `${product.value!.name} · 巷口 Alley`,
  description: () => product.value!.description,
  ogTitle: () => `${product.value!.name} · 巷口 Alley`,
  ogDescription: () => product.value!.description,
  ogType: 'website',
  ogUrl: () => productUrl.value,
  ogImage: () => productImageUrl.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${product.value!.name} · 巷口 Alley`,
  twitterDescription: () => product.value!.description,
  twitterImage: () => productImageUrl.value,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: productUrl.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.value!.name,
        description: product.value!.description,
        image: productImageUrl.value,
        sku: product.value!.id,
        category: product.value!.category,
        brand: { '@type': 'Brand', name: '巷口 Alley' },
        offers: {
          '@type': 'Offer',
          url: productUrl.value,
          priceCurrency: product.value!.currency,
          price: product.value!.price.toFixed(2),
          availability: 'https://schema.org/InStock',
        },
      }),
    },
  ],
}))

const { add } = useCart()
const { open } = useCartDrawer()
const qty = ref(1)
const justAdded = ref(false)

function addToCart() {
  add(product.value!.id, qty.value)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 1400)
  open()
}

function buyNow() {
  add(product.value!.id, qty.value)
  router.push('/checkout')
}

// Phase 2.6: same-category, deterministic-per-product random sample.
// Falls back to other categories when not enough siblings exist.
function hashStringToInt(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function shuffleStable<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    // simple LCG → 0..1 deterministic per seed
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[out[i]!, out[j]!] = [out[j]!, out[i]!]
  }
  return out
}

const related = computed(() => {
  const me = product.value!
  const seed = hashStringToInt(me.id)
  const sameCat = products.filter(
    (p) => p.id !== me.id && p.category === me.category,
  )
  const others = products.filter(
    (p) => p.id !== me.id && p.category !== me.category,
  )
  const picked = shuffleStable(sameCat, seed).slice(0, 4)
  if (picked.length < 4) {
    picked.push(...shuffleStable(others, seed).slice(0, 4 - picked.length))
  }
  return picked
})
</script>

<template>
  <div v-if="product" class="container-px max-w-7xl mx-auto py-10 lg:py-16">
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg mb-10"
    >
      <ArrowLeft :size="14" :stroke-width="1.75" />
      Back to shop
    </NuxtLink>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <div class="lg:col-span-7">
        <div class="bg-subtle overflow-hidden">
          <NuxtImg
            preset="productHero"
            :src="product.image"
            :alt="product.name"
            sizes="sm:100vw md:100vw lg:60vw"
            width="1200"
            height="1500"
            class="w-full h-auto max-h-[80vh] object-cover"
          />
        </div>
      </div>

      <div class="lg:col-span-5 lg:sticky lg:top-24 self-start">
        <p class="eyebrow">{{ product.category }}</p>
        <h1
          class="font-display font-medium text-fg mt-3 leading-[1.05] text-4xl md:text-5xl lg:text-6xl"
        >
          {{ product.name }}
        </h1>
        <p class="price text-3xl mt-6 text-fg">
          ${{ product.price.toFixed(2) }}
          <span class="text-xs font-sans font-normal text-muted ml-1">
            {{ product.currency }}
          </span>
        </p>

        <div class="divider my-8" />

        <p class="text-fg/90 leading-relaxed">{{ product.description }}</p>

        <div class="mt-10 flex items-center gap-4">
          <p class="small-caps text-muted">Quantity</p>
          <div class="stepper">
            <button
              type="button"
              aria-label="Decrease quantity"
              @click="qty = Math.max(1, qty - 1)"
            >
              <Minus :size="14" :stroke-width="1.75" />
            </button>
            <span>{{ qty }}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              @click="qty = qty + 1"
            >
              <Plus :size="14" :stroke-width="1.75" />
            </button>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button
            class="btn-primary flex-1 min-w-[180px]"
            @click="addToCart"
          >
            <Check v-if="justAdded" :size="16" :stroke-width="1.75" />
            <span>{{ justAdded ? 'Added to bag' : 'Add to bag' }}</span>
          </button>
          <button class="btn-accent flex-1 min-w-[180px]" @click="buyNow">
            Buy now
          </button>
        </div>

        <ul class="mt-10 space-y-3 text-sm text-muted">
          <li class="flex items-center gap-3">
            <ShieldCheck :size="16" :stroke-width="1.5" />
            Secure online checkout — encrypted at the payment processor.
          </li>
          <li class="flex items-center gap-3">
            <Truck :size="16" :stroke-width="1.5" />
            Demo store — no real shipping.
          </li>
        </ul>
      </div>
    </div>

    <section v-if="related.length > 0" class="mt-24 pt-16 border-t border-line">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="eyebrow">From the same {{ product.category.toLowerCase() }} stall</p>
          <h2 class="font-display text-display-sm mt-2">
            You may also <span class="italic">like</span>
          </h2>
        </div>
        <NuxtLink
          to="/"
          class="hidden sm:inline-flex text-sm text-muted hover:text-fg underline-offset-4 hover:underline"
        >
          See all dishes →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        <ProductCard v-for="p in related" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>
