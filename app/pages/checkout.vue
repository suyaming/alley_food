<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const { lines, items, totalAmount, totalQty, clear } = useCart()
const { track } = useTrack()
const isSandbox = useRuntimeConfig().public.paypalEnv !== 'live'

useHead({ title: '结账 Checkout · 巷口 Alley' })

const errorMsg = ref<string>('')
const cartItems = computed(() => items.value)

onMounted(() => {
  track('checkout_initiated', {
    items: items.value.length,
    quantity: totalQty.value,
    amount: Number(totalAmount.value.toFixed(2)),
  })
})

function onSuccess(orderId: string) {
  track('purchase', {
    order_id: orderId,
    quantity: totalQty.value,
    amount: Number(totalAmount.value.toFixed(2)),
  })
  clear()
  router.push(`/success?orderId=${encodeURIComponent(orderId)}`)
}

function onError(message: string) {
  errorMsg.value = message
}
</script>

<template>
  <div class="container-px max-w-5xl mx-auto py-10 lg:py-16">
    <NuxtLink
      to="/cart"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg mb-10"
    >
      <ArrowLeft :size="14" :stroke-width="1.75" />
      Back to bag
    </NuxtLink>

    <div class="mb-12">
      <p class="eyebrow">№ 05</p>
      <h1 class="font-display text-display-sm mt-2">Checkout</h1>
    </div>

    <div v-if="lines.length === 0" class="border-t border-line py-24 text-center">
      <p class="font-display text-3xl text-fg">Your bag is empty.</p>
      <p class="text-muted mt-2">Add a few things before checking out.</p>
      <NuxtLink to="/" class="btn-primary mt-8 inline-flex">
        Browse the shop
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <section class="lg:col-span-7">
        <p class="small-caps text-muted mb-4">Order details</p>
        <ul class="border-t border-line">
          <li
            v-for="line in lines"
            :key="line.id"
            class="flex gap-4 py-4 border-b border-line items-center"
          >
            <NuxtImg
              preset="thumb"
              :src="line.product.image"
              :alt="line.product.name"
              width="200"
              height="250"
              loading="lazy"
              class="w-16 h-20 object-cover bg-subtle"
            />
            <div class="flex-1 min-w-0">
              <p class="eyebrow">{{ line.product.category }}</p>
              <p class="font-display text-lg leading-tight text-fg truncate mt-0.5">
                {{ line.product.name }}
              </p>
              <p class="text-xs text-muted mt-1">
                Qty {{ line.quantity }} · ${{ line.product.price.toFixed(2) }}
              </p>
            </div>
            <p class="price text-base">
              ${{ line.lineTotal.toFixed(2) }}
            </p>
          </li>
        </ul>

        <div class="flex items-baseline justify-between mt-6">
          <p class="small-caps text-muted">Total ({{ totalQty }} items)</p>
          <p class="price text-3xl">${{ totalAmount.toFixed(2) }}</p>
        </div>
      </section>

      <aside class="lg:col-span-5 lg:sticky lg:top-24 self-start">
        <PaypalButton
          :items="cartItems"
          @success="onSuccess"
          @error="onError"
        />

        <p
          v-if="errorMsg"
          class="text-xs text-fg bg-subtle border border-line p-3 mt-3"
        >
          {{ errorMsg }}
        </p>

        <div class="mt-6 flex items-start gap-3 text-xs text-muted leading-relaxed">
          <ShieldCheck :size="14" :stroke-width="1.5" class="shrink-0 mt-0.5" />
          <p v-if="isSandbox">
            Secure online checkout. This is a sandbox demo — no real money
            will be charged.
          </p>
          <p v-else>
            Secure online checkout. Encrypted at the payment processor.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
