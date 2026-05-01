<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Lock, AlertTriangle } from 'lucide-vue-next'
import type { CartItem } from '../../shared/types'

const props = defineProps<{
  items: CartItem[]
}>()

const emit = defineEmits<{
  success: [orderId: string]
  error: [message: string]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref<string>('')

onMounted(async () => {
  try {
    const { loadPaypalSdk } = usePaypal()
    const paypal = await loadPaypalSdk()
    if (!containerRef.value) return

    paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
        },
        createOrder: async () => {
          if (!props.items.length) {
            throw new Error('Cart is empty.')
          }
          const res = await $fetch<{ id: string }>(
            '/api/paypal/create-order',
            {
              method: 'POST',
              body: { items: props.items },
            },
          )
          return res.id
        },
        onApprove: async (data: { orderID: string }) => {
          const res = await $fetch<{ id: string; status: string }>(
            '/api/paypal/capture-order',
            {
              method: 'POST',
              body: { orderID: data.orderID },
            },
          )
          if (res.status === 'CAPTURED') {
            emit('success', res.id)
          } else {
            errorMessage.value = `Payment status: ${res.status}`
            status.value = 'error'
            emit('error', errorMessage.value)
          }
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Payment failed.'
          errorMessage.value = msg
          status.value = 'error'
          emit('error', msg)
        },
        onCancel: () => {
          // user closed the popup; no-op
        },
      })
      .render(containerRef.value)

    status.value = 'ready'
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Could not load checkout SDK.'
    errorMessage.value = msg
    status.value = 'error'
    emit('error', msg)
  }
})
</script>

<template>
  <div class="border border-line p-5 bg-bg">
    <div class="flex items-center justify-between mb-4">
      <p class="small-caps text-muted flex items-center gap-2">
        <Lock :size="12" :stroke-width="1.75" />
        Secure online checkout
      </p>
      <p class="small-caps text-muted">Encrypted</p>
    </div>

    <div
      v-if="status === 'loading'"
      class="space-y-2"
      aria-hidden="true"
    >
      <div class="h-12 w-full bg-subtle animate-pulse" />
      <div class="h-12 w-full bg-subtle animate-pulse opacity-60" />
    </div>

    <div
      v-if="status === 'error'"
      class="text-sm text-fg bg-subtle border border-line p-3 flex gap-2 items-start"
    >
      <AlertTriangle
        :size="16"
        :stroke-width="1.75"
        class="text-accent shrink-0 mt-0.5"
      />
      <span>{{ errorMessage }}</span>
    </div>

    <div ref="containerRef" />
  </div>
</template>
