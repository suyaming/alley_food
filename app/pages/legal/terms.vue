<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

useHead({ title: '服务条款 Terms · 巷口 Alley' })

const sections = [
  { id: 'acceptance', titleEn: 'Acceptance', titleCn: '接受条款' },
  { id: 'orders', titleEn: 'Orders & pricing', titleCn: '订单与价格' },
  { id: 'payment', titleEn: 'Payment', titleCn: '支付' },
  { id: 'delivery', titleEn: 'Delivery & risk', titleCn: '配送与风险转移' },
  { id: 'cancellation', titleEn: 'Cancellation & refunds', titleCn: '取消与退款' },
  { id: 'food-safety', titleEn: 'Food safety & allergens', titleCn: '食品安全与过敏' },
  { id: 'ip', titleEn: 'Intellectual property', titleCn: '知识产权' },
  { id: 'liability', titleEn: 'Liability', titleCn: '责任限制' },
  { id: 'law', titleEn: 'Governing law', titleCn: '适用法律' },
  { id: 'contact', titleEn: 'Contact', titleCn: '联系' },
]
</script>

<template>
  <PageHero
    eyebrow="№ 06 · 法律 / 条款"
    title-en="Terms of"
    title-en-italic="service"
    title-cn="服务条款"
    subtitle="The rules of the road for ordering food from Alley. Last updated 1 May 2026."
  />

  <article class="container-px max-w-5xl mx-auto py-16 lg:py-20">
    <NuxtLink
      to="/help"
      class="inline-flex items-center gap-2 text-sm text-muted hover:text-fg mb-10"
    >
      <ArrowLeft :size="14" :stroke-width="1.75" />
      Back to Help
    </NuxtLink>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <aside class="lg:col-span-3 lg:sticky lg:top-24 self-start">
        <p class="small-caps text-muted mb-3">Index</p>
        <ul class="space-y-2 text-sm">
          <li v-for="(s, i) in sections" :key="s.id">
            <a
              :href="`#${s.id}`"
              class="flex gap-3 text-muted hover:text-fg"
            >
              <span class="font-mono tabular-nums">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <span>{{ s.titleEn }}</span>
            </a>
          </li>
        </ul>
      </aside>

      <div class="lg:col-span-9 text-fg/90 leading-relaxed space-y-12">
        <section id="acceptance">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[0]!.titleCn }}
            </span>
            01 · {{ sections[0]!.titleEn }}
          </h2>
          <p>
            By placing an order with Alley you agree to these terms. If you
            do not agree, please do not order. We may update these terms;
            material changes will be announced on the home page for at
            least 30 days.
          </p>
        </section>

        <section id="orders">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[1]!.titleCn }}
            </span>
            02 · {{ sections[1]!.titleEn }}
          </h2>
          <p>
            All prices are in USD and exclude applicable sales tax shown at
            checkout. We reserve the right to refuse or cancel an order
            (rare; usually a sold-out item or a delivery address we cannot
            serve). We will refund you in full if we do.
          </p>
        </section>

        <section id="payment">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[2]!.titleCn }}
            </span>
            03 · {{ sections[2]!.titleEn }}
          </h2>
          <p>
            Payment is processed at checkout via a third-party payment
            processor. We never see or store your card details. By placing
            an order you authorise the charge for the order total shown.
          </p>
        </section>

        <section id="delivery">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[3]!.titleCn }}
            </span>
            04 · {{ sections[3]!.titleEn }}
          </h2>
          <p>
            Delivery windows are estimates. Risk of loss for shelf-stable
            shipments transfers to you on hand-off to the carrier; for
            same-day food delivery, risk transfers on hand-off to you or
            your designated recipient. See
            <NuxtLink to="/help/shipping" class="underline underline-offset-4">Shipping</NuxtLink>
            for zone details.
          </p>
        </section>

        <section id="cancellation">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[4]!.titleCn }}
            </span>
            05 · {{ sections[4]!.titleEn }}
          </h2>
          <p>
            Hot food orders can be cancelled before the kitchen begins
            cooking; after that, no refund — but if delivery quality fails,
            we replace or credit. Shelf-stable items: 30-day return on
            unopened goods. Full policy on the
            <NuxtLink to="/help/returns" class="underline underline-offset-4">Returns</NuxtLink>
            page.
          </p>
        </section>

        <section id="food-safety">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[5]!.titleCn }}
            </span>
            06 · {{ sections[5]!.titleEn }}
          </h2>
          <p>
            We list every allergen we can identify on each product page,
            but our kitchen handles wheat, soy, peanuts, tree nuts,
            sesame, shellfish and dairy. We cannot guarantee a fully
            allergen-free dish. If you have a severe allergy, please
            contact us before ordering.
          </p>
        </section>

        <section id="ip">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[6]!.titleCn }}
            </span>
            07 · {{ sections[6]!.titleEn }}
          </h2>
          <p>
            The Alley brand, the vermilion stamp logo, photography, and
            site copy are the property of Alley LLC. You may reference us
            in editorial coverage; please do not reuse our marks for
            commercial purposes without written permission.
          </p>
        </section>

        <section id="liability">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[7]!.titleCn }}
            </span>
            08 · {{ sections[7]!.titleEn }}
          </h2>
          <p>
            To the maximum extent permitted by law, our liability for any
            claim arising from your order is limited to a refund of the
            order total. Nothing in these terms limits liability for
            personal injury caused by negligence, fraud, or any other
            liability that cannot be limited by law.
          </p>
        </section>

        <section id="law">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[8]!.titleCn }}
            </span>
            09 · {{ sections[8]!.titleEn }}
          </h2>
          <p>
            These terms are governed by the laws of the State of New York.
            Disputes will be resolved in the state or federal courts
            sitting in Kings County, New York.
          </p>
        </section>

        <section id="contact">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[9]!.titleCn }}
            </span>
            10 · {{ sections[9]!.titleEn }}
          </h2>
          <p>
            Legal questions:
            <a class="underline underline-offset-4" href="mailto:legal@alley.food">legal@alley.food</a>.
            Postal mail: Alley LLC, 88 Withers St, Brooklyn NY 11211.
          </p>
        </section>
      </div>
    </div>
  </article>
</template>
