<script setup lang="ts">
import { ArrowLeft, Mail, Clock, MapPin, MessageCircle } from 'lucide-vue-next'

useHead({ title: '联系我们 Contact · 巷口 Alley' })

const channels = [
  {
    icon: Mail,
    eyebrow: '邮箱 · Email',
    primary: 'hello@alley.food',
    secondary: 'A real person replies within one business day.',
    href: 'mailto:hello@alley.food',
  },
  {
    icon: MessageCircle,
    eyebrow: '订单查询 · Orders',
    primary: 'orders@alley.food',
    secondary: 'Use this address with your order id for fastest help.',
    href: 'mailto:orders@alley.food',
  },
  {
    icon: Clock,
    eyebrow: '工作时间 · Hours',
    primary: 'Mon — Sat · 10:00 – 22:00',
    secondary: 'Closed Sundays. Holidays announced on the home page.',
  },
  {
    icon: MapPin,
    eyebrow: '厨房地址 · Kitchen',
    primary: '88 Withers St, Brooklyn NY 11211',
    secondary: 'Pickup window inside the kitchen door, second from the right.',
  },
]
</script>

<template>
  <PageHero
    eyebrow="№ 05 · 帮助 / 联系"
    title-en="A real person"
    title-en-italic="answers"
    title-cn="联系我们"
    subtitle="We do not have a phone tree, an AI agent, or a contact form. Just a few real email addresses and the kitchen door."
  />

  <section class="container-px max-w-3xl mx-auto py-16 lg:py-20">
    <NuxtLink
      to="/help"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg mb-10"
    >
      <ArrowLeft :size="14" :stroke-width="1.75" />
      Back to Help
    </NuxtLink>

    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line"
    >
      <component
        :is="c.href ? 'a' : 'div'"
        v-for="c in channels"
        :key="c.primary"
        :href="c.href"
        class="bg-bg p-6 md:p-8 flex flex-col gap-3"
        :class="c.href ? 'transition-colors hover:bg-subtle group' : ''"
      >
        <div class="flex items-center justify-between">
          <p class="eyebrow">{{ c.eyebrow }}</p>
          <component
            :is="c.icon"
            :size="18"
            :stroke-width="1.5"
            class="text-muted"
            :class="c.href ? 'group-hover:text-fg transition-colors' : ''"
          />
        </div>
        <p class="font-display text-xl leading-snug text-fg">
          {{ c.primary }}
        </p>
        <p class="text-sm text-muted leading-relaxed mt-auto">
          {{ c.secondary }}
        </p>
      </component>
    </div>

    <p class="mt-12 text-sm text-muted leading-relaxed text-center">
      For press and partnerships:
      <a class="underline underline-offset-4" href="mailto:press@alley.food">
        press@alley.food
      </a>
    </p>
  </section>
</template>
