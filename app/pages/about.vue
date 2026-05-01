<script setup lang="ts">
useHead({ title: '关于巷口 About · 巷口 Alley' })

const values = [
  {
    eyebrow: '01',
    titleEn: 'One alley',
    titleCn: '一条巷子',
    body: 'Everything we sell is the food you would find at a single street corner — the noodle stand, the late-night skewer cart, the tea shop two doors down. No fusion, no novelty.',
  },
  {
    eyebrow: '02',
    titleEn: 'Small batch',
    titleCn: '小份现做',
    body: 'Cooked to order in our kitchen the morning of dispatch. Our chilli oil is rendered in 4-litre pots, our jasmine tea ages in tin canisters, and we will tell you when something is sold out.',
  },
  {
    eyebrow: '03',
    titleEn: 'Honest price',
    titleCn: '老实价格',
    body: 'Street-food prices in a polished package. We make a fair margin and put it back into ingredients — single-origin Fujian tea, hand-pulled wheat noodles, properly aged Zhenjiang vinegar.',
  },
  {
    eyebrow: '04',
    titleEn: 'No theatre',
    titleCn: '不喧闹',
    body: 'No emoji on our menus, no dragons on our packaging, no influencer dance for a free dumpling. Just a stamp, two characters, and the food on the plate.',
  },
]
</script>

<template>
  <PageHero
    eyebrow="№ 04 · 关于"
    title-en="A small lane"
    title-en-italic="on a quiet street"
    title-cn="巷口"
    subtitle="A tiny editorial collective bringing Chinese street food to your door — the noodle on the corner, the late-night skewer, the jasmine tea your grandmother kept in a tin."
  />

  <article class="container-px max-w-5xl mx-auto py-16 lg:py-24">
    <!-- STORY -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <aside class="lg:col-span-4">
        <p class="small-caps text-muted">Our story · 我们</p>
      </aside>
      <div class="lg:col-span-8 space-y-6 text-fg/90 leading-relaxed">
        <p>
          巷口 (xiàng kǒu) means "the mouth of the alley" — that small opening
          between two old apartment blocks where a stall has stood for thirty
          years, the woman behind it knows your order, and the smell of star
          anise and chilli oil reaches the bus stop two streets over.
        </p>
        <p>
          We started Alley because most "Chinese" food sold abroad is either a
          buffet or a banquet. The truth is most Chinese cooking happens
          standing up, on a plastic stool, for less than the price of a coffee
          — and it is some of the best food in the world. We wanted to put
          that food in front of people who have never been to that alley.
        </p>
        <p>
          Each dish on our menu has been eaten by one of us at the stall it
          comes from. We pay royalties to a few of the original families when
          we can, and the rest we cook ourselves from recipes that took ten
          tries to get right. The kitchen is in Brooklyn. The recipes are not.
        </p>
      </div>
    </section>

    <div class="divider my-16 lg:my-24" />

    <!-- VALUES -->
    <section>
      <div class="mb-10">
        <p class="eyebrow">№ 02 · 我们相信</p>
        <h2 class="font-display text-display-sm mt-2">
          What we <span class="italic">believe</span>
        </h2>
      </div>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line"
      >
        <div
          v-for="v in values"
          :key="v.eyebrow"
          class="bg-bg p-6 md:p-8 flex flex-col gap-3"
        >
          <p class="eyebrow">{{ v.eyebrow }}</p>
          <h3 class="font-display text-2xl leading-tight">
            <span class="font-cn font-bold block text-base text-muted mb-1">
              {{ v.titleCn }}
            </span>
            {{ v.titleEn }}
          </h3>
          <p class="text-sm text-muted leading-relaxed mt-1">
            {{ v.body }}
          </p>
        </div>
      </div>
    </section>

    <!-- BRAND MARK CODA -->
    <section
      class="mt-16 lg:mt-24 pt-16 border-t border-line flex flex-col items-center text-center"
    >
      <BrandMark :size="64" variant="mark-only" />
      <p class="font-display italic text-2xl mt-8 text-fg">
        “The mouth of the alley.”
      </p>
      <p class="text-muted text-sm mt-3">
        巷口 · Alley · est. 2026
      </p>
      <NuxtLink to="/" class="btn-primary mt-10">
        Browse the menu
      </NuxtLink>
    </section>
  </article>
</template>
