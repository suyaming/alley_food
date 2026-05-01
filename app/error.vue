<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Mail } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => Number(props.error?.statusCode) || 500)

const is404 = computed(() => statusCode.value === 404)

const headline = computed(() =>
  is404.value
    ? { en: 'Off the menu.', cn: '不在菜单上。' }
    : { en: 'The kitchen tripped.', cn: '厨房出岔子了。' },
)

const body = computed(() =>
  is404.value
    ? 'The dish you were looking for is not in tonight\u2019s rotation. Try the menu, or browse what\u2019s simmering.'
    : 'Something on our side stopped working. The mistake is logged \u2014 we\u2019ll patch it. Please try again in a moment.',
)

function clearAndGoHome(): void {
  // Reset Nuxt's error state and navigate home.
  clearError({ redirect: '/' })
}

useHead(() => ({
  title: () =>
    is404.value
      ? '404 · 巷口 Alley'
      : `${statusCode.value} · 巷口 Alley`,
}))
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-bg text-fg"
  >
    <header class="container-px max-w-7xl mx-auto w-full pt-8 pb-4">
      <NuxtLink to="/" class="inline-flex items-center gap-2" @click.prevent="clearAndGoHome">
        <BrandMark :size="28" />
      </NuxtLink>
    </header>

    <main
      class="flex-1 container-px max-w-3xl mx-auto w-full flex flex-col justify-center text-center py-16"
    >
      <p class="eyebrow">Error · {{ statusCode }}</p>

      <h1
        class="font-display font-medium leading-[1.04] mt-6 text-fg text-5xl md:text-7xl lg:text-8xl"
      >
        {{ headline.en }}
        <span class="block italic mt-2 text-muted">{{ headline.cn }}</span>
      </h1>

      <p class="mt-8 text-lg leading-relaxed text-muted max-w-prose mx-auto">
        {{ body }}
      </p>

      <div class="mt-12 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="btn-primary"
          @click="clearAndGoHome"
        >
          <ArrowLeft :size="16" :stroke-width="1.75" />
          Back to the menu
        </button>
        <a
          href="mailto:hello@alley.food"
          class="btn-ghost inline-flex items-center gap-2"
        >
          <Mail :size="16" :stroke-width="1.75" />
          Tell the kitchen
        </a>
      </div>

      <div class="divider my-16" />

      <p class="small-caps text-muted">A little snack while you wait</p>
      <pre
        class="mt-4 font-mono text-xs text-muted/80 whitespace-pre-wrap text-left max-w-md mx-auto"
      >{{ statusCode }} · {{ error?.statusMessage || (is404 ? 'Page not found' : 'Internal error') }}</pre>
    </main>

    <footer
      class="container-px max-w-7xl mx-auto w-full py-8 text-xs text-muted text-center border-t border-line"
    >
      巷口 Alley · {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>
