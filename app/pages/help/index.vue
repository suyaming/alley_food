<script setup lang="ts">
import { Truck, Undo2, MessageCircle, HelpCircle, ArrowRight } from 'lucide-vue-next'

useHead({ title: '帮助中心 Help · 巷口 Alley' })

const cards = [
  {
    to: '/help/shipping',
    icon: Truck,
    eyebrow: '01 · 配送',
    titleEn: 'Shipping',
    titleCn: '配送说明',
    body: 'Cooked-to-order windows, delivery zones, fees and what arrives chilled vs. hot.',
  },
  {
    to: '/help/returns',
    icon: Undo2,
    eyebrow: '02 · 退换',
    titleEn: 'Returns',
    titleCn: '退换政策',
    body: 'How perishable food works: cancel before we cook, refund if we miss the mark.',
  },
  {
    to: '/help/faq',
    icon: HelpCircle,
    eyebrow: '03 · 常见问题',
    titleEn: 'FAQ',
    titleCn: '常见问题',
    body: 'Allergens, spice levels, gift orders, packaging, and the small details.',
  },
  {
    to: '/help/contact',
    icon: MessageCircle,
    eyebrow: '04 · 联系',
    titleEn: 'Contact',
    titleCn: '联系我们',
    body: 'Email, hours, kitchen address. A real person answers within one business day.',
  },
]
</script>

<template>
  <PageHero
    eyebrow="№ 05 · 帮助中心"
    title-en="How can we"
    title-en-italic="help"
    title-cn="我们能帮上什么"
    subtitle="Shipping windows, returns on perishable food, frequently asked questions, and how to reach a person."
  />

  <section class="container-px max-w-5xl mx-auto py-16 lg:py-24">
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line"
    >
      <NuxtLink
        v-for="c in cards"
        :key="c.to"
        :to="c.to"
        class="group bg-bg p-6 md:p-10 flex flex-col gap-4 transition-colors hover:bg-subtle"
      >
        <div class="flex items-center justify-between">
          <p class="eyebrow">{{ c.eyebrow }}</p>
          <component
            :is="c.icon"
            :size="20"
            :stroke-width="1.5"
            class="text-muted group-hover:text-fg transition-colors"
          />
        </div>
        <h3 class="font-display text-3xl leading-tight">
          <span class="font-cn font-bold block text-sm text-muted mb-1">
            {{ c.titleCn }}
          </span>
          {{ c.titleEn }}
        </h3>
        <p class="text-sm text-muted leading-relaxed">
          {{ c.body }}
        </p>
        <span
          class="mt-auto pt-6 inline-flex items-center gap-1 text-sm text-fg"
        >
          <span class="underline underline-offset-4">Read</span>
          <ArrowRight
            :size="14"
            :stroke-width="1.75"
            class="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </NuxtLink>
    </div>

    <div
      class="mt-16 lg:mt-20 pt-10 border-t border-line flex flex-col md:flex-row md:items-end md:justify-between gap-6"
    >
      <div>
        <p class="eyebrow">Looking for an order?</p>
        <h2 class="font-display text-3xl mt-2">
          Track an <span class="italic">order</span>.
        </h2>
        <p class="text-muted text-sm mt-2 max-w-md leading-relaxed">
          Paste the order id you received after checkout to see the status of
          your bag.
        </p>
      </div>
      <NuxtLink to="/orders" class="btn-primary self-start md:self-auto">
        <span>Order tracking</span>
        <ArrowRight :size="14" :stroke-width="1.75" />
      </NuxtLink>
    </div>
  </section>
</template>
