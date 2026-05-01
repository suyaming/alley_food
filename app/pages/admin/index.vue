<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { LogOut, RefreshCw, Filter } from 'lucide-vue-next'
import type { OrderRecord, OrderStatus } from '../../../shared/types'

definePageMeta({ middleware: 'admin', layout: false })
useHead({ title: 'Kitchen · 巷口 Alley' })

const STATUSES: OrderStatus[] = [
  'PENDING',
  'CAPTURED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REFUNDED',
  'DISPUTED',
  'CANCELLED',
  'FAILED',
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CAPTURED: 'New',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out',
  DELIVERED: 'Delivered',
  REFUNDED: 'Refunded',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
}

const STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: 'bg-subtle text-muted',
  CAPTURED: 'bg-accent/15 text-accent border-accent/30',
  PREPARING: 'bg-fg text-bg',
  READY: 'bg-fg/85 text-bg',
  OUT_FOR_DELIVERY: 'bg-fg/70 text-bg',
  DELIVERED: 'bg-subtle text-muted line-through',
  REFUNDED: 'bg-subtle text-muted',
  DISPUTED: 'bg-accent text-accent-fg',
  CANCELLED: 'bg-subtle text-muted',
  FAILED: 'bg-subtle text-muted',
}

const filter = ref<OrderStatus | 'ALL'>('ALL')
const orders = ref<OrderRecord[]>([])
const loading = ref(false)
const lastRefresh = ref<Date | null>(null)

async function load() {
  loading.value = true
  try {
    const q = filter.value === 'ALL' ? '' : `?status=${filter.value}`
    const res = await $fetch<{ orders: OrderRecord[] }>(
      `/api/admin/orders${q}`,
    )
    orders.value = res.orders
    lastRefresh.value = new Date()
  } catch (err) {
    console.error('[admin] failed to load orders:', err)
  } finally {
    loading.value = false
  }
}

let pollHandle: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  load()
  pollHandle = setInterval(load, 30_000)
})
onBeforeUnmount(() => {
  if (pollHandle) clearInterval(pollHandle)
})

watch(filter, () => load())

async function logout() {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
  } catch {
    // ignore
  }
  await navigateTo('/admin/login')
}

const statusCounts = computed<Record<OrderStatus | 'ALL', number>>(() => {
  const tally: Record<string, number> = { ALL: orders.value.length }
  for (const s of STATUSES) tally[s] = 0
  for (const o of orders.value) tally[o.status] = (tally[o.status] ?? 0) + 1
  return tally as Record<OrderStatus | 'ALL', number>
})

function fmtTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg text-fg">
    <header
      class="border-b border-line bg-bg/85 backdrop-blur sticky top-0 z-20"
    >
      <div
        class="container-px max-w-7xl mx-auto h-16 flex items-center justify-between gap-6"
      >
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="hover:opacity-80">
            <BrandMark :size="28" />
          </NuxtLink>
          <span class="hidden sm:inline-block w-px h-6 bg-line" />
          <p class="small-caps text-muted">Kitchen</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-icon"
            :class="loading ? 'animate-spin' : ''"
            aria-label="Refresh orders"
            @click="load"
          >
            <RefreshCw :size="16" :stroke-width="1.5" />
          </button>
          <button
            type="button"
            class="btn-icon"
            aria-label="Sign out"
            @click="logout"
          >
            <LogOut :size="16" :stroke-width="1.5" />
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 container-px max-w-7xl mx-auto w-full py-8">
      <div class="flex items-end justify-between gap-6 mb-8">
        <div>
          <h1 class="font-display text-3xl md:text-4xl text-fg leading-tight">
            Today's <span class="italic">orders.</span>
          </h1>
          <p class="text-sm text-muted mt-2">
            <span v-if="lastRefresh">
              Last refreshed {{ lastRefresh.toLocaleTimeString() }} · auto-refreshes every 30 s
            </span>
            <span v-else>Loading…</span>
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 mb-8 -mx-1">
        <button
          type="button"
          class="px-3 py-1.5 text-xs tracking-[0.16em] uppercase border transition-colors"
          :class="
            filter === 'ALL'
              ? 'bg-fg text-bg border-fg'
              : 'bg-bg text-muted border-line hover:text-fg'
          "
          @click="filter = 'ALL'"
        >
          All <span class="ml-1 opacity-60">{{ statusCounts.ALL ?? 0 }}</span>
        </button>
        <button
          v-for="s in STATUSES"
          :key="s"
          type="button"
          class="px-3 py-1.5 text-xs tracking-[0.16em] uppercase border transition-colors"
          :class="
            filter === s
              ? 'bg-fg text-bg border-fg'
              : 'bg-bg text-muted border-line hover:text-fg'
          "
          @click="filter = s"
        >
          {{ STATUS_LABEL[s] }}
          <span v-if="statusCounts[s]" class="ml-1 opacity-60">
            {{ statusCounts[s] }}
          </span>
        </button>
      </div>

      <div v-if="orders.length === 0 && !loading" class="py-20 text-center">
        <Filter
          :size="22"
          :stroke-width="1.25"
          class="mx-auto text-muted/60"
        />
        <p class="font-display text-xl mt-4 text-fg">No orders here.</p>
        <p class="text-sm text-muted mt-1">
          Try a different filter, or wait for the kitchen bell.
        </p>
      </div>

      <ul v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <li
          v-for="o in orders"
          :key="o.id"
          class="bg-bg border border-line p-5 hover:border-fg transition-colors"
        >
          <NuxtLink :to="`/admin/orders/${o.id}`" class="block">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <p class="font-mono text-xs text-muted">
                  {{ o.id.slice(-10) }}
                </p>
                <p class="font-display text-lg text-fg leading-tight mt-1">
                  ${{ o.amount.toFixed(2) }}
                  <span class="text-xs text-muted font-sans">{{ o.currency }}</span>
                </p>
              </div>
              <span
                class="text-[10px] tracking-[0.16em] uppercase px-2 py-1 border"
                :class="STATUS_TONE[o.status]"
              >
                {{ STATUS_LABEL[o.status] }}
              </span>
            </div>

            <ul class="text-sm text-muted space-y-0.5 max-h-24 overflow-hidden">
              <li
                v-for="li in o.items.slice(0, 3)"
                :key="li.id"
                class="truncate"
              >
                {{ li.quantity }}× {{ li.name }}
              </li>
              <li v-if="o.items.length > 3" class="text-xs italic">
                +{{ o.items.length - 3 }} more
              </li>
            </ul>

            <div
              class="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-muted"
            >
              <span>{{ o.payerEmail || '(no email)' }}</span>
              <span>{{ fmtTime(o.createdAt) }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </main>
  </div>
</template>
