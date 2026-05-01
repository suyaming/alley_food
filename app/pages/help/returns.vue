<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

useHead({ title: '退换 Returns · 巷口 Alley' })
</script>

<template>
  <PageHero
    eyebrow="№ 05 · 帮助 / 退换"
    title-en="Honest about"
    title-en-italic="perishable food"
    title-cn="退换政策"
    subtitle="Most of what we sell cannot be returned and resold. Here is how we make it fair anyway."
  />

  <article class="container-px max-w-3xl mx-auto py-16 lg:py-20">
    <NuxtLink
      to="/help"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg mb-10"
    >
      <ArrowLeft :size="14" :stroke-width="1.75" />
      Back to Help
    </NuxtLink>

    <section class="space-y-6 text-fg/90 leading-relaxed">
      <p>
        Cooked food is by definition not resaleable. Once a noodle bowl
        leaves our kitchen we cannot put it back on the menu — so our policy
        is built around two things: cancelling early, and replacing fairly.
      </p>
    </section>

    <h2 class="font-display text-2xl mt-14 mb-4">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        提前取消
      </span>
      Before we cook (full refund)
    </h2>
    <p class="text-fg/90 leading-relaxed">
      You can cancel any order for a full refund up until the kitchen starts
      cooking it. For same-day Zone A orders that is roughly 90 minutes
      before your delivery window. For Zone B / C orders it is 18:00 the
      previous day. Cancel by emailing
      <a class="underline underline-offset-4" href="mailto:hello@alley.food">hello@alley.food</a>
      with your order id, or via your <NuxtLink to="/orders" class="underline underline-offset-4">order tracking</NuxtLink> page.
    </p>

    <h2 class="font-display text-2xl mt-14 mb-4">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        出餐之后
      </span>
      After we cook (no refund, but...)
    </h2>
    <p class="text-fg/90 leading-relaxed">
      Once a hot item leaves the kitchen we cannot offer a refund — but if
      something arrives in a state we would not eat ourselves (cold, late
      past the window, container leaked, missing item, wrong dish), we will
      replace it on the next delivery run or credit your account in full.
      Photo helps but is not required. We trust you.
    </p>

    <h2 class="font-display text-2xl mt-14 mb-4">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        干货商品
      </span>
      Shelf-stable items (tea, chilli oil, sauces)
    </h2>
    <p class="text-fg/90 leading-relaxed">
      Unopened, sealed shelf-stable items can be returned within 30 days for
      a full refund minus return shipping. Opened items: only if there is a
      quality issue — get in touch first and we will sort it.
    </p>

    <h2 class="font-display text-2xl mt-14 mb-4">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        过敏 / 误食
      </span>
      Allergens &amp; mislabelling
    </h2>
    <p class="text-fg/90 leading-relaxed">
      We list every allergen we can on each product page. If we mislabelled
      something and you had a reaction, we cover medical and full refund —
      tell us what happened and we will fix the label so it never happens
      again.
    </p>

    <h2 class="font-display text-2xl mt-14 mb-4">
      <span class="font-cn font-bold text-sm text-muted block mb-1">
        退款时间
      </span>
      Refund timing
    </h2>
    <p class="text-fg/90 leading-relaxed">
      Refunds are issued through the original payment method. They typically
      appear in your account within 3 – 5 business days, sometimes sooner if
      your bank is quick.
    </p>
  </article>
</template>
