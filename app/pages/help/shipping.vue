<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

useHead({ title: '配送 Shipping · 巷口 Alley' })

const zones = [
  {
    label: 'Zone A · 同城',
    body: 'New York City — Brooklyn, Manhattan, Queens, west Bronx.',
    fee: 'Free over $30',
    eta: 'Same-day, 11:00 – 21:00 windows',
  },
  {
    label: 'Zone B · 隔日',
    body: 'Tri-state — NJ, lower CT, Long Island east of Suffolk.',
    fee: '$8 flat',
    eta: 'Next-day, before 18:00',
  },
  {
    label: 'Zone C · 干货',
    body: 'Continental US (shelf-stable items only — tea, sauces, dry noodles).',
    fee: '$12 flat',
    eta: '3 – 5 business days',
  },
]
</script>

<template>
  <PageHero
    eyebrow="№ 05 · 帮助 / 配送"
    title-en="Cooked, then"
    title-en-italic="dispatched"
    title-cn="配送说明"
    subtitle="We cook to order, so the timing of your bag matters more than the price you paid for delivery."
  />

  <article class="container-px max-w-3xl mx-auto py-16 lg:py-20 prose-editorial">
    <NuxtLink
      to="/help"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg mb-10"
    >
      <ArrowLeft :size="14" :stroke-width="1.75" />
      Back to Help
    </NuxtLink>

    <section class="space-y-6 text-fg/90 leading-relaxed">
      <p>
        Most of our menu — noodles, skewers, soup — is cooked the morning of
        dispatch and packed in vented kraft containers that hold heat for
        roughly two hours. Our drivers take orders out in batches of six, so
        your window may shift by 15 minutes when the kitchen is busy.
      </p>
      <p>
        Shelf-stable items (tea, chilli oil, dry noodles) ship by carrier and
        do not need to arrive hot, so we batch those daily and hand them off
        to USPS / UPS Ground.
      </p>
    </section>

    <h2 class="font-display text-2xl mt-14 mb-6">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        三个区域
      </span>
      Three zones
    </h2>
    <div class="grid grid-cols-1 gap-px bg-line border border-line">
      <div
        v-for="z in zones"
        :key="z.label"
        class="bg-bg p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-baseline"
      >
        <div>
          <p class="small-caps text-muted">{{ z.label }}</p>
          <p class="font-display text-lg mt-1">{{ z.body }}</p>
        </div>
        <p class="text-fg text-sm">
          <span class="small-caps text-muted block mb-1">Fee</span>
          {{ z.fee }}
        </p>
        <p class="text-fg text-sm">
          <span class="small-caps text-muted block mb-1">ETA</span>
          {{ z.eta }}
        </p>
      </div>
    </div>

    <h2 class="font-display text-2xl mt-14 mb-4">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        包装与温度
      </span>
      Packaging &amp; temperature
    </h2>
    <ul class="list-disc pl-5 text-fg/90 space-y-2 leading-relaxed">
      <li>Hot items leave the kitchen at 80 °C and arrive at 55 – 65 °C.</li>
      <li>
        We do not use single-use plastics. Containers are PFAS-free, lined
        with vegetable wax paper, and the bag is kraft.
      </li>
      <li>
        We label everything with cooked-at and best-before timestamps. If
        yours is wrong, see <NuxtLink to="/help/returns" class="underline underline-offset-4">Returns</NuxtLink>.
      </li>
    </ul>

    <h2 class="font-display text-2xl mt-14 mb-4">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        国际配送
      </span>
      International
    </h2>
    <p class="text-fg/90 leading-relaxed">
      We ship tea and chilli oil to Canada and the EU. Customs duties are the
      buyer's responsibility. We do not ship perishable food internationally —
      it would not arrive the way we packed it.
    </p>
  </article>
</template>
