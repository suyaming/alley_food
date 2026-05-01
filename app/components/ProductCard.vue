<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Check } from 'lucide-vue-next'
import type { Product } from '~~/shared/types'

const props = defineProps<{
  product: Product
  size?: 'default' | 'large' | 'wide'
}>()

const { add } = useCart()
const { open } = useCartDrawer()
const justAdded = ref(false)

function quickAdd(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  add(props.product.id, 1)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 1200)
  open()
}
</script>

<template>
  <NuxtLink
    :to="`/product/${product.id}`"
    class="group block"
    :class="(size === 'large' || size === 'wide') && 'md:h-full md:flex md:flex-col'"
  >
    <div
      class="relative overflow-hidden bg-subtle"
      :class="[
        size === 'large' && 'aspect-[4/5] md:aspect-auto md:flex-1 md:min-h-0',
        size === 'wide' && 'aspect-[16/10] md:aspect-auto md:flex-1 md:min-h-0',
        (!size || size === 'default') && 'aspect-[4/5]',
      ]"
    >
      <NuxtImg
        preset="productCard"
        :src="product.image"
        :alt="product.name"
        loading="lazy"
        :sizes="
          size === 'large'
            ? 'sm:100vw md:33vw lg:30vw'
            : size === 'wide'
              ? 'sm:100vw md:66vw lg:60vw'
              : 'sm:50vw md:33vw lg:25vw'
        "
        :width="size === 'wide' ? 1200 : 600"
        :height="size === 'wide' ? 750 : 750"
        class="w-full h-full object-cover grayscale-card transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-fg/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-editorial pointer-events-none"
      />
      <button
        type="button"
        class="absolute bottom-3 right-3 h-10 w-10 inline-flex items-center justify-center bg-bg text-fg border border-line opacity-0 translate-y-1 transition-[opacity,transform,background-color,border-color,color] duration-300 ease-editorial group-hover:opacity-100 group-hover:translate-y-0 hover:bg-accent hover:text-accent-fg hover:border-accent"
        :aria-label="`Add ${product.name} to cart`"
        @click="quickAdd"
      >
        <Transition
          enter-active-class="transition-[opacity,transform] duration-200 ease-editorial"
          leave-active-class="transition-[opacity,transform] duration-200 ease-editorial absolute"
          enter-from-class="opacity-0 scale-50"
          leave-to-class="opacity-0 scale-150"
          mode="out-in"
        >
          <Check v-if="justAdded" key="check" :size="16" :stroke-width="1.75" />
          <Plus v-else key="plus" :size="16" :stroke-width="1.75" />
        </Transition>
      </button>
    </div>
    <div
      class="pt-4 flex items-start justify-between gap-4 transition-transform duration-400 ease-editorial group-hover:-translate-y-0.5"
      :class="(size === 'large' || size === 'wide') && 'shrink-0'"
    >
      <div class="min-w-0">
        <p class="eyebrow">{{ product.category }}</p>
        <h3
          class="font-display text-fg leading-snug mt-1"
          :class="[
            size === 'large' && 'text-3xl md:text-4xl',
            size === 'wide' && 'text-2xl md:text-3xl',
            (!size || size === 'default') && 'text-xl',
          ]"
        >
          {{ product.name }}
        </h3>
      </div>
      <p class="price text-base shrink-0">
        ${{ product.price.toFixed(2) }}
      </p>
    </div>
  </NuxtLink>
</template>
