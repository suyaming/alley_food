<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowRight } from 'lucide-vue-next'
import { products, categories } from '../../shared/products'

useHead({ title: '巷口 Alley · 街头小吃' })

const heroProduct = computed(() => products[0])
const featured = computed(() => products.slice(1, 4))

const ALL = 'All'
const activeCategory = ref<string>(ALL)

const categoryFilters = computed(() => {
  const counts = new Map<string, number>()
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  return [
    { value: ALL, label: 'All', count: products.length },
    ...categories.map((c) => ({ value: c, label: c, count: counts.get(c) ?? 0 })),
  ]
})

const visibleProducts = computed(() =>
  activeCategory.value === ALL
    ? products
    : products.filter((p) => p.category === activeCategory.value),
)
</script>

<template>
  <div class="container-px max-w-7xl mx-auto">
    <!-- HERO -->
    <section
      class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-10 pb-20 lg:py-24 border-b border-line"
    >
      <div class="lg:col-span-7 flex flex-col justify-between">
        <div>
          <p class="eyebrow animate-fadeUp-fast">巷口 № 01 · 春の街吃 · Spring 2026</p>
          <h1
            class="font-display font-medium text-display-lg mt-6 text-fg animate-fadeUp"
            style="animation-delay: 80ms"
          >
            <span class="font-cn">巷口 ·</span>
            Carefully chosen
            <span class="italic font-normal">street food</span>,
            delivered to your door.
          </h1>
          <p
            class="mt-6 max-w-xl text-muted text-base md:text-lg leading-relaxed animate-fadeUp"
            style="animation-delay: 200ms"
          >
            A tiny editorial collective that brings Chinese street food to
            your door — the noodle on the corner, the late-night skewer, the
            jasmine tea your grandmother kept in a tin. Browse, tap checkout,
            and we cook.
          </p>
        </div>
        <div
          class="mt-10 flex flex-wrap items-center gap-4 animate-fadeUp"
          style="animation-delay: 320ms"
        >
          <a href="#catalogue" class="btn-accent group">
            <span>Browse the shop</span>
            <ArrowDown
              :size="16"
              :stroke-width="1.75"
              class="transition-transform duration-300 ease-editorial group-hover:translate-y-0.5"
            />
          </a>
          <NuxtLink
            :to="`/product/${heroProduct.id}`"
            class="btn-ghost text-fg group"
          >
            <span class="underline underline-offset-4">
              Featured: {{ heroProduct.name }}
            </span>
            <ArrowRight
              :size="14"
              :stroke-width="1.75"
              class="transition-transform duration-300 ease-editorial group-hover:translate-x-1"
            />
          </NuxtLink>
        </div>
      </div>

      <div class="lg:col-span-5">
        <NuxtLink
          :to="`/product/${heroProduct.id}`"
          class="group block relative overflow-hidden bg-subtle animate-fadeIn"
          style="animation-delay: 120ms"
        >
          <NuxtImg
            preset="productHero"
            :src="heroProduct.image"
            :alt="heroProduct.name"
            sizes="sm:100vw md:100vw lg:42vw"
            width="1200"
            height="1500"
            class="w-full h-[60vh] lg:h-[640px] object-cover grayscale-card animate-kenBurns transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
          />
          <div
            class="absolute top-4 left-4 bg-bg/90 px-3 py-1.5 small-caps text-fg"
          >
            {{ heroProduct.category }}
          </div>
          <div
            class="absolute bottom-4 left-4 right-4 bg-bg/90 px-4 py-3 flex items-center justify-between"
          >
            <p class="font-display text-lg leading-tight truncate">
              {{ heroProduct.name }}
            </p>
            <p class="price text-base shrink-0 ml-3">
              ${{ heroProduct.price.toFixed(2) }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- FEATURED BENTO -->
    <section class="py-20">
      <div class="flex items-end justify-between mb-10">
        <div v-reveal>
          <p class="eyebrow">№ 02 · 本周精选</p>
          <h2 class="font-display text-display-sm mt-2">
            This week's <span class="italic">selects</span>
          </h2>
        </div>
        <NuxtLink
          v-reveal:120
          to="#catalogue"
          class="hidden md:inline-flex items-center gap-1 text-sm text-muted hover:text-fg group"
        >
          See full catalogue
          <ArrowRight
            :size="14"
            :stroke-width="1.75"
            class="transition-transform duration-300 ease-editorial group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>

      <div
        v-reveal:80
        class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:h-[640px] lg:h-[720px]"
      >
        <ProductCard :product="featured[0]" size="large" />
        <div
          class="md:col-span-2 flex flex-col gap-6 md:grid md:grid-rows-2 md:gap-8 md:min-h-0"
        >
          <ProductCard :product="featured[1]" size="wide" />
          <ProductCard :product="featured[2]" size="wide" />
        </div>
      </div>
    </section>

    <!-- ALL PRODUCTS -->
    <section id="catalogue" class="py-20 border-t border-line">
      <div class="flex items-end justify-between mb-8">
        <div v-reveal>
          <p class="eyebrow">№ 03 · 全部菜单 — Catalogue</p>
          <h2 class="font-display text-display-sm mt-2">
            All <span class="italic">dishes</span>
          </h2>
        </div>
        <p v-reveal:120 class="small-caps text-muted">
          {{ visibleProducts.length }} / {{ products.length }} items
        </p>
      </div>

      <!-- CATEGORY FILTER -->
      <div
        v-reveal:60
        class="flex flex-wrap gap-2 mb-12 pb-6 border-b border-line"
        role="tablist"
        aria-label="Category filter"
      >
        <button
          v-for="f in categoryFilters"
          :key="f.value"
          type="button"
          role="tab"
          :aria-selected="activeCategory === f.value"
          class="px-3 py-1.5 small-caps border transition-colors duration-300 ease-editorial"
          :class="
            activeCategory === f.value
              ? 'bg-fg text-bg border-fg'
              : 'bg-bg text-muted border-line hover:text-fg hover:border-fg'
          "
          @click="activeCategory = f.value"
        >
          {{ f.label }}
          <span
            class="ml-1 text-[10px] tabular-nums"
            :class="
              activeCategory === f.value ? 'text-bg/70' : 'text-muted/70'
            "
          >
            {{ f.count }}
          </span>
        </button>
      </div>

      <TransitionGroup
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
        enter-active-class="transition-[opacity,transform] duration-400 ease-editorial"
        enter-from-class="opacity-0 translate-y-3"
        leave-active-class="transition-[opacity,transform] duration-200 ease-editorial absolute"
        leave-to-class="opacity-0"
        move-class="transition-transform duration-400 ease-editorial"
      >
        <ProductCard
          v-for="(p, idx) in visibleProducts"
          :key="p.id"
          :product="p"
          v-reveal="Math.min(idx * 40, 320)"
        />
      </TransitionGroup>
    </section>
  </div>
</template>
