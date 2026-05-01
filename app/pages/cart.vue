<script setup lang="ts">
import { Plus, Minus, X, ArrowRight } from 'lucide-vue-next'

const { lines, totalAmount, totalQty, updateQty, remove, clear } = useCart()
const isSandbox = useRuntimeConfig().public.paypalEnv !== 'live'

useHead({ title: '购物袋 Cart · 巷口 Alley' })
</script>

<template>
  <div class="container-px max-w-7xl mx-auto py-10 lg:py-16">
    <div class="flex items-baseline justify-between mb-10">
      <div>
        <p class="eyebrow">№ 04</p>
        <h1 class="font-display text-display-sm mt-2">Your bag</h1>
      </div>
      <ClientOnly>
        <p class="small-caps text-muted">{{ totalQty }} items</p>
      </ClientOnly>
    </div>

    <div v-if="lines.length === 0" class="border-t border-line py-24 text-center">
      <p class="font-display text-3xl text-fg">Your bag is empty.</p>
      <p class="text-muted mt-2">Browse the shop and pick something nice.</p>
      <NuxtLink to="/" class="btn-primary mt-8 inline-flex">
        Browse the shop
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <section class="lg:col-span-8">
        <ul class="border-t border-line">
          <li
            v-for="line in lines"
            :key="line.id"
            class="grid grid-cols-12 gap-4 py-6 border-b border-line items-center"
          >
            <NuxtLink
              :to="`/product/${line.product.id}`"
              class="col-span-3 sm:col-span-2"
            >
              <NuxtImg
                preset="thumb"
                :src="line.product.image"
                :alt="line.product.name"
                width="200"
                height="250"
                sizes="sm:25vw md:16vw"
                loading="lazy"
                class="w-full aspect-[4/5] object-cover bg-subtle"
              />
            </NuxtLink>
            <div class="col-span-9 sm:col-span-5 min-w-0">
              <p class="eyebrow">{{ line.product.category }}</p>
              <NuxtLink
                :to="`/product/${line.product.id}`"
                class="font-display text-xl md:text-2xl text-fg hover:underline underline-offset-4 block leading-tight mt-1"
              >
                {{ line.product.name }}
              </NuxtLink>
              <p class="text-xs text-muted mt-2">
                ${{ line.product.price.toFixed(2) }} each
              </p>
              <button
                type="button"
                class="mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-fg sm:hidden"
                @click="remove(line.id)"
              >
                <X :size="12" :stroke-width="1.75" />
                Remove
              </button>
            </div>
            <div class="col-span-7 sm:col-span-3 flex items-center sm:justify-center">
              <div class="stepper">
                <button
                  type="button"
                  aria-label="Decrease"
                  @click="updateQty(line.id, line.quantity - 1)"
                >
                  <Minus :size="14" :stroke-width="1.75" />
                </button>
                <span>{{ line.quantity }}</span>
                <button
                  type="button"
                  aria-label="Increase"
                  @click="updateQty(line.id, line.quantity + 1)"
                >
                  <Plus :size="14" :stroke-width="1.75" />
                </button>
              </div>
            </div>
            <div class="col-span-5 sm:col-span-2 text-right flex flex-col items-end gap-2">
              <p class="price text-base md:text-lg">
                ${{ line.lineTotal.toFixed(2) }}
              </p>
              <button
                type="button"
                class="hidden sm:inline-flex items-center gap-1 text-xs text-muted hover:text-fg"
                @click="remove(line.id)"
              >
                <X :size="12" :stroke-width="1.75" />
                Remove
              </button>
            </div>
          </li>
        </ul>

        <div class="flex justify-end mt-6">
          <button
            type="button"
            class="text-xs text-muted hover:text-fg underline underline-offset-4"
            @click="clear"
          >
            Clear bag
          </button>
        </div>
      </section>

      <aside class="lg:col-span-4 lg:sticky lg:top-24 self-start">
        <div class="border border-line p-6 md:p-8 bg-bg space-y-5">
          <p class="small-caps text-muted">Summary</p>
          <div class="flex justify-between text-sm text-muted">
            <span>Items</span>
            <span class="text-fg tabular-nums">{{ totalQty }}</span>
          </div>
          <div class="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span class="text-fg tabular-nums">
              ${{ totalAmount.toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between text-sm text-muted">
            <span>Shipping</span>
            <span class="text-fg">Free</span>
          </div>
          <div class="divider" />
          <div class="flex items-baseline justify-between">
            <span class="small-caps text-muted">Total</span>
            <span class="price text-3xl">
              ${{ totalAmount.toFixed(2) }}
            </span>
          </div>
          <NuxtLink to="/checkout" class="btn-primary w-full mt-2">
            <span>Proceed to checkout</span>
            <ArrowRight :size="14" :stroke-width="1.75" />
          </NuxtLink>
          <p class="text-[11px] text-muted leading-relaxed">
            <span v-if="isSandbox">
              Secure online checkout. Demo store — sandbox payments only.
            </span>
            <span v-else>
              Secure online checkout. Encrypted at the payment processor.
            </span>
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
