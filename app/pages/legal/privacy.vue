<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

useHead({ title: '隐私政策 Privacy · 巷口 Alley' })

const sections = [
  { id: 'collected', titleEn: 'What we collect', titleCn: '我们收集什么' },
  { id: 'use', titleEn: 'How we use it', titleCn: '我们如何使用' },
  { id: 'cookies', titleEn: 'Cookies & local storage', titleCn: 'Cookie 与本地存储' },
  { id: 'third', titleEn: 'Third parties', titleCn: '第三方' },
  { id: 'retention', titleEn: 'Retention', titleCn: '数据保留' },
  { id: 'rights', titleEn: 'Your rights', titleCn: '您的权利' },
  { id: 'children', titleEn: 'Children', titleCn: '未成年人' },
  { id: 'changes', titleEn: 'Changes', titleCn: '政策变更' },
  { id: 'contact', titleEn: 'Contact', titleCn: '联系' },
]
</script>

<template>
  <PageHero
    eyebrow="№ 06 · 法律 / 隐私"
    title-en="Privacy"
    title-en-italic="policy"
    title-cn="隐私政策"
    subtitle="Plain English, last updated 1 May 2026. We collect as little as we can to deliver food and a receipt."
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
      <!-- TOC -->
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
        <section id="collected">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[0]!.titleCn }}
            </span>
            01 · {{ sections[0]!.titleEn }}
          </h2>
          <p>
            To process an order we collect your name, delivery address,
            email, and phone number. To process a payment we receive a
            tokenised payer id from our payment processor — we never see or
            store your card numbers. If you write to us we keep that
            correspondence.
          </p>
        </section>

        <section id="use">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[1]!.titleCn }}
            </span>
            02 · {{ sections[1]!.titleEn }}
          </h2>
          <p>
            We use your data to deliver food, send receipts, answer support
            requests, and meet our tax and food-safety obligations. We do
            not sell, rent, or trade your information. We do not run
            behavioural advertising.
          </p>
        </section>

        <section id="cookies">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[2]!.titleCn }}
            </span>
            03 · {{ sections[2]!.titleEn }}
          </h2>
          <p>
            The shop uses one first-party local-storage entry to remember
            your cart and one to remember your light / dark theme. No
            tracking cookies, no analytics fingerprinting. Our payment
            processor sets its own session cookies during checkout — those
            are governed by their privacy policy.
          </p>
        </section>

        <section id="third">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[3]!.titleCn }}
            </span>
            04 · {{ sections[3]!.titleEn }}
          </h2>
          <p>
            We share order details with the kitchen, the delivery courier,
            and the payment processor — only as much as each needs to do
            their job. We use a transactional email service to send you
            receipts. None of these parties are allowed to use your data
            for their own marketing.
          </p>
        </section>

        <section id="retention">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[4]!.titleCn }}
            </span>
            05 · {{ sections[4]!.titleEn }}
          </h2>
          <p>
            Order records are kept for seven years to comply with tax law.
            Email correspondence is kept for two years and then deleted.
            You can request earlier deletion at any time.
          </p>
        </section>

        <section id="rights">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[5]!.titleCn }}
            </span>
            06 · {{ sections[5]!.titleEn }}
          </h2>
          <p>
            You have the right to request access to, correction of, or
            deletion of your personal data. EU and UK customers have
            additional rights under GDPR and the Data Protection Act.
            California residents have rights under the CCPA. To exercise any
            of these, write to
            <a class="underline underline-offset-4" href="mailto:privacy@alley.food">privacy@alley.food</a>
            and we will respond within 30 days.
          </p>
        </section>

        <section id="children">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[6]!.titleCn }}
            </span>
            07 · {{ sections[6]!.titleEn }}
          </h2>
          <p>
            Our shop is not directed at children under 13 and we do not
            knowingly collect data from anyone under that age.
          </p>
        </section>

        <section id="changes">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[7]!.titleCn }}
            </span>
            08 · {{ sections[7]!.titleEn }}
          </h2>
          <p>
            We will post any changes to this policy on this page with a new
            "last updated" date. Material changes will be announced on the
            home page for at least 30 days.
          </p>
        </section>

        <section id="contact">
          <h2 class="font-display text-2xl mb-3">
            <span class="font-cn font-bold text-sm text-muted block mb-1">
              {{ sections[8]!.titleCn }}
            </span>
            09 · {{ sections[8]!.titleEn }}
          </h2>
          <p>
            Questions about this policy:
            <a class="underline underline-offset-4" href="mailto:privacy@alley.food">privacy@alley.food</a>.
            Postal mail: 88 Withers St, Brooklyn NY 11211.
          </p>
        </section>
      </div>
    </div>
  </article>
</template>
