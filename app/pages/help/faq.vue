<script setup lang="ts">
import { ArrowLeft, Plus } from 'lucide-vue-next'

useHead({ title: '常见问题 FAQ · 巷口 Alley' })

const groups = [
  {
    label: '订单与配送 · Orders &amp; delivery',
    items: [
      {
        q: 'How do I track my order?',
        a: 'Use the order id from your confirmation page on the [order tracking](/orders) page. The status updates as we cook, dispatch, and deliver.',
      },
      {
        q: 'Can I change my order after I place it?',
        a: 'You can edit or cancel up to 90 minutes before the delivery window for Zone A, or 18:00 the day before for Zone B/C. Email us with the order id.',
      },
      {
        q: 'Do you deliver outside NYC?',
        a: 'For shelf-stable items (tea, sauces, dry noodles) we ship anywhere in the continental US, plus Canada and the EU. Hot food is NYC and tri-state only.',
      },
    ],
  },
  {
    label: '食物与过敏 · Food &amp; allergens',
    items: [
      {
        q: 'How spicy is "mala"?',
        a: 'Our default mala is medium — pleasantly numbing, sweat-on-the-forehead but not painful. Each spicy item has a 1 – 4 chilli scale on its product page; you can ask for a milder version in the order notes.',
      },
      {
        q: 'Are your dishes gluten free?',
        a: 'A few are (rice cakes, sweet rice ball soup, smoked plum cooler), but most noodles use wheat. Each product page lists allergens in full. We cannot promise a fully gluten-free kitchen.',
      },
      {
        q: 'Vegetarian / vegan options?',
        a: 'About a third of the menu is vegetarian-by-default, including the scallion oil noodles, mala gluten skewer, and brown-sugar mochi. Vegan tags coming soon.',
      },
    ],
  },
  {
    label: '支付与发票 · Payment &amp; receipts',
    items: [
      {
        q: 'What payment methods do you take?',
        a: 'Cards, Apple Pay, Google Pay, and online checkout via the standard hosted SDK. We do not store card numbers on our servers.',
      },
      {
        q: 'Can I get a tax receipt?',
        a: 'Yes, a receipt is emailed automatically. For an itemised PDF receipt for expensing, email hello@alley.food with the order id.',
      },
    ],
  },
  {
    label: '团体与礼品 · Catering &amp; gifts',
    items: [
      {
        q: 'Do you cater for parties?',
        a: 'For 8+ people in NYC we do family-style trays. Email us at least 48 hours ahead.',
      },
      {
        q: 'Can I send food as a gift?',
        a: 'Yes — at checkout, add a recipient address and a one-line note. We hand-print the note on a kraft card with a vermilion stamp.',
      },
    ],
  },
]
</script>

<template>
  <PageHero
    eyebrow="№ 05 · 帮助 / 常见问题"
    title-en="Quick"
    title-en-italic="answers"
    title-cn="常见问题"
    subtitle="Everything we get asked weekly, organised by topic. If yours is not here, the contact page will reach a real person."
  />

  <article class="container-px max-w-3xl mx-auto py-16 lg:py-20">
    <NuxtLink
      to="/help"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg mb-10"
    >
      <ArrowLeft :size="14" :stroke-width="1.75" />
      Back to Help
    </NuxtLink>

    <section v-for="g in groups" :key="g.label" class="mb-12">
      <h2 class="small-caps text-muted mb-4" v-html="g.label" />
      <ul class="border-t border-line">
        <li
          v-for="item in g.items"
          :key="item.q"
          class="border-b border-line"
        >
          <details class="group">
            <summary
              class="cursor-pointer list-none py-5 flex items-start justify-between gap-6 hover:text-fg text-fg"
            >
              <span class="font-display text-lg leading-snug">
                {{ item.q }}
              </span>
              <Plus
                :size="18"
                :stroke-width="1.5"
                class="shrink-0 mt-1 text-muted transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <div
              class="pb-5 pr-10 text-sm text-muted leading-relaxed"
              v-text="item.a"
            />
          </details>
        </li>
      </ul>
    </section>

    <div
      class="mt-16 pt-10 border-t border-line text-center"
    >
      <p class="text-muted text-sm">
        Did not find what you were looking for?
      </p>
      <NuxtLink to="/help/contact" class="btn-primary mt-4 inline-flex">
        Contact us
      </NuxtLink>
    </div>
  </article>
</template>
