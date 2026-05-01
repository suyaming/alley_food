<script setup lang="ts">
import { ref } from 'vue'
import { Lock, ArrowRight } from 'lucide-vue-next'

definePageMeta({ layout: false })

useHead({ title: 'Kitchen sign-in · 巷口 Alley' })

const route = useRoute()
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function submit() {
  if (loading.value) return
  loading.value = true
  error.value = null
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value },
    })
    const next = String(route.query.next || '/admin')
    await navigateTo(next.startsWith('/admin') ? next : '/admin')
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e?.data?.statusMessage || e?.message || 'Sign-in failed.'
    password.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg text-fg">
    <header class="container-px max-w-7xl mx-auto w-full pt-8">
      <NuxtLink to="/" class="inline-flex items-center gap-2">
        <BrandMark :size="28" />
      </NuxtLink>
    </header>

    <main
      class="flex-1 container-px max-w-md mx-auto w-full flex flex-col justify-center"
    >
      <p class="eyebrow">Operator only</p>
      <h1
        class="font-display font-medium leading-[1.05] mt-4 text-fg text-4xl md:text-5xl"
      >
        Kitchen <span class="italic">sign-in.</span>
      </h1>
      <p class="text-muted mt-3 leading-relaxed">
        Enter the shared kitchen password to manage orders, mark dishes ready,
        and process refunds.
      </p>

      <form class="mt-10 space-y-5" @submit.prevent="submit">
        <label class="block">
          <span class="small-caps text-muted">Password</span>
          <div class="relative mt-2">
            <Lock
              :size="16"
              :stroke-width="1.5"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full bg-transparent border border-line pl-10 pr-3 py-3 text-fg outline-none focus:border-fg transition-colors"
              autofocus
            />
          </div>
        </label>

        <p v-if="error" class="text-sm text-accent" role="alert">
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn-primary w-full justify-center"
          :disabled="loading || !password"
        >
          <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
          <ArrowRight :size="16" :stroke-width="1.75" />
        </button>
      </form>

      <p class="text-xs text-muted mt-10">
        Sessions last 1 hour. Forgotten password? Update
        <code class="font-mono text-[11px]">NUXT_ADMIN_PASSWORD</code>
        on the VPS and restart.
      </p>
    </main>

    <footer
      class="container-px max-w-7xl mx-auto w-full py-8 text-xs text-muted"
    >
      <NuxtLink to="/" class="hover:text-fg">← Back to shop</NuxtLink>
    </footer>
  </div>
</template>
