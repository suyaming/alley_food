<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { ShoppingBag, Search } from 'lucide-vue-next'

const { totalQty } = useCart()
const { open } = useCartDrawer()
const search = useSearchOverlay()

const isMac = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = (typeof window !== 'undefined' ? window.scrollY : 0) > 24
}

onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.platform)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onScroll)
  }
})

const shortcutLabel = computed(() => (isMac.value ? '⌘K' : 'Ctrl K'))
</script>

<template>
  <header
    class="sticky top-0 z-30 transition-[background-color,backdrop-filter,border-color] duration-400 ease-editorial"
    :class="
      scrolled
        ? 'bg-bg/95 backdrop-blur-md border-b border-line'
        : 'bg-bg/70 backdrop-blur-sm border-b border-transparent'
    "
  >
    <div
      class="container-px max-w-7xl mx-auto h-16 flex items-center justify-between gap-6"
    >
      <NuxtLink
        to="/"
        class="hover:opacity-80"
        aria-label="巷口 Alley — home"
      >
        <BrandMark :size="32" />
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-8 small-caps text-muted">
        <NuxtLink
          to="/"
          class="link-underline hover:text-fg"
          active-class="text-fg"
          exact-active-class="text-fg"
        >
          Shop
        </NuxtLink>
        <NuxtLink to="/about" class="link-underline hover:text-fg" active-class="text-fg">
          About
        </NuxtLink>
        <NuxtLink
          to="/help"
          class="link-underline hover:text-fg"
          active-class="text-fg"
        >
          Help
        </NuxtLink>
        <NuxtLink
          to="/orders"
          class="link-underline hover:text-fg"
          active-class="text-fg"
        >
          Orders
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="btn-icon hidden sm:inline-flex items-center gap-2 px-3"
          aria-label="Search the menu"
          @click="search.open()"
        >
          <Search :size="16" :stroke-width="1.5" />
          <span class="hidden md:inline text-[10px] tracking-[0.16em] uppercase text-muted/80 font-mono">
            {{ shortcutLabel }}
          </span>
        </button>
        <button
          type="button"
          class="btn-icon sm:hidden"
          aria-label="Search the menu"
          @click="search.open()"
        >
          <Search :size="18" :stroke-width="1.5" />
        </button>
        <ThemeToggle />
        <button
          type="button"
          class="btn-icon"
          aria-label="Open cart"
          @click="open()"
        >
          <ShoppingBag :size="18" :stroke-width="1.5" />
          <ClientOnly>
            <span
              v-if="totalQty > 0"
              class="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent"
              aria-hidden="true"
            />
          </ClientOnly>
        </button>
      </div>
    </div>
  </header>
</template>
