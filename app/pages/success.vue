<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, AlertTriangle } from 'lucide-vue-next'
import type { OrderRecord } from '~~/shared/types'

const route = useRoute()
const orderId = computed(() => {
  const v = route.query.orderId
  return Array.isArray(v) ? v[0] : v
})

useHead({ title: '谢谢 · 巷口 Alley' })

const { data: order, error } = await useFetch<OrderRecord>(
  () => `/api/orders/${orderId.value ?? ''}`,
  {
    immediate: !!orderId.value,
    server: false,
  },
)
</script>

<template>
  <div class="container-px max-w-5xl mx-auto py-16 lg:py-24">
    <div v-if="!orderId" class="text-center py-20">
      <h1 class="font-display text-display-sm">No order id provided</h1>
      <NuxtLink to="/" class="btn-primary mt-8 inline-flex">
        Back to shop
      </NuxtLink>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <AlertTriangle
        :size="32"
        :stroke-width="1.25"
        class="mx-auto text-accent"
      />
      <h1 class="font-display text-display-sm mt-4">
        We couldn't find that order
      </h1>
      <p class="text-muted mt-2 font-mono text-sm break-all">
        {{ orderId }}
      </p>
      <NuxtLink to="/" class="btn-primary mt-8 inline-flex">
        Back to shop
      </NuxtLink>
    </div>

    <div v-else-if="order">
      <p class="eyebrow text-center">{{ order.status }}</p>
      <h1
        class="font-display font-medium text-display-lg text-center mt-4 leading-[0.95]"
      >
        Thank <span class="italic">you</span>.
      </h1>
      <p class="text-center text-muted mt-6 max-w-md mx-auto">
        Your order has been
        <span class="text-fg">{{ order.status.toLowerCase() }}</span> and a
        receipt is shown below.
      </p>

      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
        <div class="bg-bg p-5">
          <p class="small-caps text-muted">Order id</p>
          <p class="font-mono text-xs text-fg break-all mt-2">{{ order.id }}</p>
        </div>
        <div class="bg-bg p-5">
          <p class="small-caps text-muted">Capture id</p>
          <p class="font-mono text-xs text-fg break-all mt-2">
            {{ order.captureId || '—' }}
          </p>
        </div>
        <div class="bg-bg p-5">
          <p class="small-caps text-muted">Total</p>
          <p class="price text-2xl mt-2">
            ${{ order.amount.toFixed(2) }}
            <span class="text-xs font-sans font-normal text-muted">
              {{ order.currency }}
            </span>
          </p>
        </div>
        <div class="bg-bg p-5">
          <p class="small-caps text-muted">Buyer</p>
          <p class="text-sm text-fg mt-2 truncate">
            {{ order.payerName || order.payerEmail || '—' }}
          </p>
        </div>
      </div>

      <div class="mt-16">
        <p class="small-caps text-muted mb-4">Items</p>
        <ul class="border-t border-line">
          <li
            v-for="li in order.items"
            :key="li.id"
            class="flex items-center justify-between py-4 border-b border-line text-sm"
          >
            <span class="text-fg">
              {{ li.name }}
              <span class="text-muted">× {{ li.quantity }}</span>
            </span>
            <span class="price text-base">
              ${{ li.lineTotal.toFixed(2) }}
            </span>
          </li>
        </ul>
      </div>

      <div class="mt-16 flex justify-center">
        <NuxtLink to="/" class="btn-primary">
          <span>Continue shopping</span>
          <ArrowRight :size="14" :stroke-width="1.75" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
