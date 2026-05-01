<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, AlertTriangle } from 'lucide-vue-next'
import type { OrderRecord, OrderStatus } from '~~/shared/types'

definePageMeta({ middleware: 'admin', layout: false })

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CAPTURED: 'New',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  REFUNDED: 'Refunded',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
}

// Mirror server/utils/order-fsm.ts. Edit both together.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CAPTURED', 'CANCELLED', 'FAILED'],
  CAPTURED: ['PREPARING', 'REFUNDED', 'DISPUTED'],
  PREPARING: ['READY', 'CAPTURED', 'REFUNDED'],
  READY: ['OUT_FOR_DELIVERY', 'PREPARING', 'REFUNDED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'READY', 'REFUNDED'],
  DELIVERED: ['REFUNDED', 'DISPUTED'],
  REFUNDED: [],
  DISPUTED: ['CAPTURED', 'REFUNDED'],
  CANCELLED: [],
  FAILED: [],
}

const route = useRoute()
const id = String(route.params.id)

useHead(() => ({ title: `Order ${id.slice(-8)} · Kitchen` }))

const { data, refresh, pending } = await useAsyncData<OrderRecord | null>(
  `admin-order-${id}`,
  () =>
    $fetch<OrderRecord>(`/api/admin/orders/${id}`, {
      headers: useRequestHeaders(['cookie']),
    }).catch(() => null),
)

const order = computed(() => data.value)

const error = ref<string | null>(null)
const busy = ref(false)
const showRefundModal = ref(false)
const refundAmount = ref<number | undefined>(undefined)
const refundReason = ref('')

async function setStatus(next: OrderStatus) {
  if (busy.value || !order.value) return
  busy.value = true
  error.value = null
  try {
    await $fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: { status: next },
    })
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e?.data?.statusMessage || e?.message || 'Update failed.'
  } finally {
    busy.value = false
  }
}

function openRefund() {
  if (!order.value) return
  refundAmount.value = order.value.amount
  showRefundModal.value = true
}

async function refund() {
  if (busy.value || !order.value) return
  busy.value = true
  error.value = null
  try {
    await $fetch(`/api/admin/orders/${id}/refund`, {
      method: 'POST',
      body: {
        amount: refundAmount.value,
        reason: refundReason.value || undefined,
      },
    })
    showRefundModal.value = false
    refundAmount.value = undefined
    refundReason.value = ''
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e?.data?.statusMessage || e?.message || 'Refund failed.'
  } finally {
    busy.value = false
  }
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString()
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
        <NuxtLink
          to="/admin"
          class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft :size="14" :stroke-width="1.75" />
          Kitchen
        </NuxtLink>
        <BrandMark :size="24" />
      </div>
    </header>

    <main class="flex-1 container-px max-w-5xl mx-auto w-full py-10">
      <div v-if="pending && !order" class="py-20 text-center text-muted">
        Loading…
      </div>

      <div v-else-if="!order" class="py-20 text-center">
        <p class="font-display text-2xl">Order not found.</p>
      </div>

      <template v-else>
        <p class="eyebrow">Order</p>
        <h1
          class="font-display font-medium leading-tight mt-2 text-fg text-3xl md:text-4xl break-all"
        >
          {{ order.id }}
        </h1>
        <p class="mt-3 text-sm text-muted">
          Placed {{ fmtTime(order.createdAt) }} · last updated
          {{ fmtTime(order.updatedAt) }}
        </p>

        <p
          class="inline-block mt-6 text-[11px] tracking-[0.18em] uppercase px-3 py-1 border border-fg bg-fg text-bg"
        >
          {{ STATUS_LABEL[order.status] }}
        </p>

        <div v-if="error" class="mt-6 p-4 bg-accent/10 border border-accent/40">
          <div class="flex items-center gap-2 text-sm text-accent">
            <AlertTriangle :size="16" :stroke-width="1.5" />
            {{ error }}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <!-- Items -->
          <div class="md:col-span-2">
            <h2 class="small-caps text-muted">Items</h2>
            <ul class="mt-4 divide-y divide-line border-y border-line">
              <li
                v-for="li in order.items"
                :key="li.id"
                class="flex items-center justify-between py-4"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-display text-base text-fg leading-tight">
                    {{ li.name }}
                  </p>
                  <p class="text-xs text-muted mt-1">
                    {{ li.quantity }} × ${{ li.unitPrice.toFixed(2) }}
                  </p>
                </div>
                <p class="price text-sm tabular-nums">
                  ${{ li.lineTotal.toFixed(2) }}
                </p>
              </li>
              <li class="flex items-center justify-between py-4 font-medium">
                <span class="small-caps text-muted">Total</span>
                <span class="price text-xl tabular-nums">
                  ${{ order.amount.toFixed(2) }}
                  <span class="text-xs font-sans text-muted">{{ order.currency }}</span>
                </span>
              </li>
            </ul>

            <h2 class="small-caps text-muted mt-12">Customer</h2>
            <dl class="mt-3 text-sm space-y-1.5">
              <div class="flex gap-3">
                <dt class="text-muted w-24 shrink-0">Name</dt>
                <dd class="text-fg">{{ order.payerName || '(unknown)' }}</dd>
              </div>
              <div class="flex gap-3">
                <dt class="text-muted w-24 shrink-0">Email</dt>
                <dd class="text-fg break-all">
                  {{ order.payerEmail || '(unknown)' }}
                </dd>
              </div>
              <div class="flex gap-3">
                <dt class="text-muted w-24 shrink-0">PayPal</dt>
                <dd class="text-fg font-mono text-xs break-all">
                  {{ order.captureId || '(no capture)' }}
                </dd>
              </div>
              <div v-if="order.emailSentAt" class="flex gap-3">
                <dt class="text-muted w-24 shrink-0">Email sent</dt>
                <dd class="text-fg">{{ fmtTime(order.emailSentAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Actions -->
          <aside class="md:col-span-1 space-y-6">
            <div>
              <h2 class="small-caps text-muted">Advance status</h2>
              <div class="mt-3 flex flex-col gap-2">
                <button
                  v-for="next in TRANSITIONS[order.status]"
                  :key="next"
                  type="button"
                  class="btn-ghost justify-between w-full"
                  :disabled="busy || next === 'REFUNDED'"
                  @click="next !== 'REFUNDED' ? setStatus(next) : (showRefundModal = true)"
                >
                  <span>{{ STATUS_LABEL[next] }}</span>
                  <span class="text-xs text-muted">→</span>
                </button>
                <p
                  v-if="TRANSITIONS[order.status].length === 0"
                  class="text-xs text-muted italic"
                >
                  Terminal state. No further transitions.
                </p>
              </div>
            </div>

            <div v-if="order.captureId">
              <h2 class="small-caps text-muted">Refund</h2>
              <button
                type="button"
                class="btn-primary w-full mt-3 justify-center"
                :disabled="
                  busy ||
                  order.status === 'REFUNDED' ||
                  order.status === 'CANCELLED' ||
                  order.status === 'FAILED'
                "
                @click="openRefund"
              >
                Issue refund…
              </button>
            </div>
          </aside>
        </div>
      </template>
    </main>

    <!-- Refund confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showRefundModal && order"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div
          class="absolute inset-0 bg-fg/40 backdrop-blur-sm"
          @click="showRefundModal = false"
        />
        <div
          class="relative w-full max-w-md bg-bg border border-line p-6"
        >
          <p class="eyebrow">Refund order</p>
          <h2 class="font-display text-2xl mt-2">
            <span class="italic">Are you sure?</span>
          </h2>
          <p class="text-sm text-muted mt-3 leading-relaxed">
            Issues a refund through PayPal and emails the customer. The order
            moves to <strong class="text-fg">REFUNDED</strong> (terminal).
          </p>

          <label class="block mt-6">
            <span class="small-caps text-muted">Amount (USD)</span>
            <input
              v-model.number="refundAmount"
              type="number"
              step="0.01"
              min="0.01"
              :max="order.amount"
              class="w-full bg-transparent border border-line px-3 py-2.5 mt-2 text-fg outline-none focus:border-fg"
            />
            <span class="text-xs text-muted mt-1 block">
              Up to ${{ order.amount.toFixed(2) }}. Leave blank for full refund.
            </span>
          </label>

          <label class="block mt-4">
            <span class="small-caps text-muted">Reason (optional)</span>
            <input
              v-model="refundReason"
              type="text"
              maxlength="200"
              placeholder="e.g. wrong delivery address"
              class="w-full bg-transparent border border-line px-3 py-2.5 mt-2 text-fg outline-none focus:border-fg"
            />
          </label>

          <div class="mt-8 flex gap-3 justify-end">
            <button
              type="button"
              class="btn-ghost"
              :disabled="busy"
              @click="showRefundModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary"
              :disabled="busy"
              @click="refund"
            >
              {{ busy ? 'Refunding…' : 'Refund now' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
