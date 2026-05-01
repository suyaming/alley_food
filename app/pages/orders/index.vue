<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, AlertTriangle, ArrowRight, Loader2 } from 'lucide-vue-next'
import type { OrderRecord } from '~~/shared/types'

useHead({ title: '订单查询 Orders · 巷口 Alley' })

const route = useRoute()
const router = useRouter()

const initial = (() => {
  const v = route.query.id
  return Array.isArray(v) ? v[0] ?? '' : v ?? ''
})()

const input = ref<string>(initial)
const order = ref<OrderRecord | null>(null)
const status = ref<'idle' | 'loading' | 'error' | 'found'>('idle')
const errorMsg = ref<string>('')

async function lookup(id: string) {
  const trimmed = id.trim()
  if (!trimmed) {
    status.value = 'idle'
    order.value = null
    errorMsg.value = ''
    return
  }
  status.value = 'loading'
  errorMsg.value = ''
  order.value = null
  try {
    const res = await $fetch<OrderRecord>(
      `/api/orders/${encodeURIComponent(trimmed)}`,
    )
    order.value = res
    status.value = 'found'
  } catch (err: unknown) {
    const e = err as { statusCode?: number; statusMessage?: string }
    if (e?.statusCode === 404) {
      errorMsg.value = 'No order with that id. Double-check the spelling — order ids are case-sensitive.'
    } else {
      errorMsg.value = e?.statusMessage || 'Could not fetch the order. Please try again.'
    }
    status.value = 'error'
  }
}

function onSubmit(e: Event) {
  e.preventDefault()
  router.replace({ query: { ...route.query, id: input.value.trim() || undefined } })
  lookup(input.value)
}

watch(
  () => route.query.id,
  (v) => {
    const id = Array.isArray(v) ? v[0] ?? '' : v ?? ''
    if (id && id !== input.value) input.value = id
    if (id) lookup(id)
  },
  { immediate: true },
)
</script>

<template>
  <PageHero
    eyebrow="№ 07 · 订单"
    title-en="Order"
    title-en-italic="tracking"
    title-cn="订单查询"
    subtitle="Paste the order id from your confirmation email or success page to see the latest status."
  />

  <section class="container-px max-w-3xl mx-auto py-16 lg:py-20">
    <form
      class="border border-line bg-bg p-5 md:p-6 flex flex-col sm:flex-row gap-3 sm:items-stretch"
      @submit="onSubmit"
    >
      <div class="flex-1 flex items-center gap-3 px-1">
        <Search :size="16" :stroke-width="1.5" class="text-muted shrink-0" />
        <input
          v-model="input"
          type="text"
          name="orderId"
          autocomplete="off"
          spellcheck="false"
          placeholder="e.g. 8XJ12345AB678901C"
          class="flex-1 bg-transparent outline-none border-0 text-fg placeholder:text-muted/70 font-mono text-sm py-2"
          aria-label="Order id"
        />
      </div>
      <button type="submit" class="btn-primary justify-center" :disabled="status === 'loading'">
        <Loader2
          v-if="status === 'loading'"
          :size="14"
          :stroke-width="1.75"
          class="animate-spin"
        />
        <span>{{ status === 'loading' ? 'Looking up' : 'Track order' }}</span>
      </button>
    </form>

    <p class="text-xs text-muted mt-3 leading-relaxed">
      Tip — order ids look like <span class="font-mono">8XJ12345AB678901C</span>.
      They are returned at checkout and emailed to you. Lost it?
      <NuxtLink to="/help/contact" class="underline underline-offset-4">
        Get in touch
      </NuxtLink>.
    </p>

    <!-- ERROR -->
    <div
      v-if="status === 'error'"
      class="mt-12 border border-line p-6 md:p-8 flex gap-4 items-start"
    >
      <AlertTriangle
        :size="20"
        :stroke-width="1.5"
        class="text-accent shrink-0 mt-1"
      />
      <div>
        <p class="font-display text-xl">We couldn't find that order</p>
        <p class="text-sm text-muted mt-2 leading-relaxed">{{ errorMsg }}</p>
      </div>
    </div>

    <!-- FOUND -->
    <div v-else-if="status === 'found' && order" class="mt-12">
      <div
        class="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line"
      >
        <div class="bg-bg p-5">
          <p class="small-caps text-muted">Status</p>
          <p class="font-display text-lg mt-2 text-fg">
            {{ order.status }}
          </p>
        </div>
        <div class="bg-bg p-5">
          <p class="small-caps text-muted">Order id</p>
          <p class="font-mono text-xs text-fg break-all mt-2">{{ order.id }}</p>
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

      <div class="mt-12">
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

      <div class="mt-10 text-xs text-muted leading-relaxed flex flex-wrap gap-x-6 gap-y-1">
        <span>
          Created
          <span class="text-fg ml-1">
            {{ new Date(order.createdAt).toLocaleString() }}
          </span>
        </span>
        <span>
          Updated
          <span class="text-fg ml-1">
            {{ new Date(order.updatedAt).toLocaleString() }}
          </span>
        </span>
      </div>

      <div class="mt-10 flex flex-wrap gap-3">
        <NuxtLink to="/" class="btn-primary">
          <span>Continue shopping</span>
          <ArrowRight :size="14" :stroke-width="1.75" />
        </NuxtLink>
        <NuxtLink to="/help/contact" class="btn-ghost text-fg">
          Something looks wrong?
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
