<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { X, Plus, Minus, ShoppingBag } from 'lucide-vue-next'

const { isOpen, close } = useCartDrawer()
const { lines, totalAmount, totalQty, updateQty, remove } = useCart()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(
  isOpen,
  (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

function goCheckout() {
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-editorial"
      leave-active-class="transition-opacity duration-200 ease-editorial"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-fg/40 backdrop-blur-[2px]"
        @click="close"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-editorial"
      leave-active-class="transition-transform duration-300 ease-editorial"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="isOpen"
        class="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-bg border-l border-line flex flex-col"
        role="dialog"
        aria-label="Shopping cart"
      >
        <header
          class="flex items-center justify-between h-16 px-6 border-b border-line"
        >
          <p class="small-caps text-muted">
            Cart <span class="text-fg">/ {{ totalQty }} items</span>
          </p>
          <button
            type="button"
            class="btn-icon -mr-2"
            aria-label="Close cart"
            @click="close"
          >
            <X :size="18" :stroke-width="1.5" />
          </button>
        </header>

        <div v-if="lines.length === 0" class="flex-1 grid place-items-center px-6 text-center">
          <div class="flex flex-col items-center gap-4 max-w-xs">
            <ShoppingBag :size="32" :stroke-width="1" class="text-muted" />
            <p class="text-muted text-sm">Your bag is empty.</p>
            <NuxtLink to="/" class="btn-secondary" @click="close">
              Browse the shop
            </NuxtLink>
          </div>
        </div>

        <ul v-else class="flex-1 overflow-y-auto divide-y divide-line">
          <li
            v-for="line in lines"
            :key="line.id"
            class="flex gap-4 p-6"
          >
            <NuxtLink
              :to="`/product/${line.product.id}`"
              class="shrink-0"
              @click="close"
            >
              <NuxtImg
                preset="thumb"
                :src="line.product.image"
                :alt="line.product.name"
                width="200"
                height="250"
                loading="lazy"
                class="w-20 h-24 object-cover bg-subtle"
              />
            </NuxtLink>
            <div class="flex-1 min-w-0 flex flex-col">
              <p class="eyebrow">{{ line.product.category }}</p>
              <NuxtLink
                :to="`/product/${line.product.id}`"
                class="font-display text-lg leading-tight text-fg hover:underline truncate"
                @click="close"
              >
                {{ line.product.name }}
              </NuxtLink>
              <p class="text-xs text-muted mt-1">
                ${{ line.product.price.toFixed(2) }} each
              </p>
              <div class="mt-auto flex items-center justify-between pt-3">
                <div class="stepper">
                  <button
                    type="button"
                    aria-label="Decrease"
                    @click="updateQty(line.id, line.quantity - 1)"
                  >
                    <Minus :size="14" :stroke-width="1.5" />
                  </button>
                  <span>{{ line.quantity }}</span>
                  <button
                    type="button"
                    aria-label="Increase"
                    @click="updateQty(line.id, line.quantity + 1)"
                  >
                    <Plus :size="14" :stroke-width="1.5" />
                  </button>
                </div>
                <button
                  type="button"
                  class="text-xs text-muted hover:text-fg underline-offset-4 hover:underline"
                  @click="remove(line.id)"
                >
                  Remove
                </button>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="price text-base">${{ line.lineTotal.toFixed(2) }}</p>
            </div>
          </li>
        </ul>

        <footer
          v-if="lines.length > 0"
          class="border-t border-line p-6 space-y-4"
        >
          <div class="flex items-baseline justify-between">
            <p class="small-caps text-muted">Subtotal</p>
            <p class="price text-2xl">${{ totalAmount.toFixed(2) }}</p>
          </div>
          <p class="text-[11px] text-muted">
            Shipping and taxes calculated at checkout.
          </p>
          <NuxtLink to="/checkout" class="btn-primary w-full" @click="goCheckout">
            Proceed to checkout
          </NuxtLink>
          <NuxtLink
            to="/cart"
            class="block text-center text-xs text-muted hover:text-fg underline underline-offset-4"
            @click="close"
          >
            View full cart
          </NuxtLink>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>
