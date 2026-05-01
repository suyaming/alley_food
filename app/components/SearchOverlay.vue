<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Fuse from 'fuse.js'
import { Search, X, ArrowRight, Command } from 'lucide-vue-next'
import { products } from '~~/shared/products'
import type { Product } from '~~/shared/types'

const { isOpen, close, toggle } = useSearchOverlay()
const router = useRouter()

const fuse = new Fuse(products, {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'description', weight: 1 },
    { name: 'category', weight: 0.6 },
  ],
  threshold: 0.36,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 1,
})

const query = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const activeIndex = ref(0)

const results = computed<Product[]>(() => {
  const q = query.value.trim()
  if (!q) {
    return products.slice(0, 8)
  }
  return fuse.search(q, { limit: 8 }).map((r) => r.item)
})

watch(results, () => {
  activeIndex.value = 0
})

function go(p: Product) {
  close()
  query.value = ''
  router.push(`/product/${p.id}`)
}

function onKeyDown(e: KeyboardEvent) {
  // Cmd/Ctrl + K toggles overlay anywhere on page
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    toggle()
    return
  }
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  const list = results.value
  if (list.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % list.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + list.length) % list.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = list[activeIndex.value]
    if (item) go(item)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  } else {
    query.value = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Search the menu"
      >
        <div
          class="absolute inset-0 bg-fg/40 backdrop-blur-sm"
          @click="close"
        />
        <div
          class="relative w-full max-w-2xl mx-4 mt-[12vh] bg-bg border border-line shadow-xl"
        >
          <div class="flex items-center gap-3 px-5 py-4 border-b border-line">
            <Search :size="18" :stroke-width="1.75" class="text-muted shrink-0" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Search dishes — 老坛酸辣粉, baozi, dumplings..."
              class="flex-1 bg-transparent outline-none text-fg placeholder:text-muted/70 text-lg"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              type="button"
              class="text-muted hover:text-fg p-1 -m-1"
              aria-label="Close search"
              @click="close"
            >
              <X :size="18" :stroke-width="1.75" />
            </button>
          </div>

          <div class="max-h-[60vh] overflow-y-auto">
            <ul v-if="results.length > 0" class="py-2">
              <li
                v-for="(p, i) in results"
                :key="p.id"
                class="px-5 py-3 cursor-pointer flex items-center gap-4 transition-colors"
                :class="i === activeIndex ? 'bg-subtle' : 'hover:bg-subtle/60'"
                @mouseenter="activeIndex = i"
                @click="go(p)"
              >
                <NuxtImg
                  preset="thumb"
                  :src="p.image"
                  :alt="p.name"
                  width="56"
                  height="70"
                  loading="lazy"
                  class="w-14 h-[70px] object-cover bg-subtle shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="font-display text-base text-fg leading-tight truncate">
                    {{ p.name }}
                  </p>
                  <p class="text-xs text-muted mt-1 truncate">
                    {{ p.category }} · ${{ p.price.toFixed(2) }}
                  </p>
                </div>
                <ArrowRight
                  :size="16"
                  :stroke-width="1.5"
                  class="text-muted shrink-0"
                />
              </li>
            </ul>
            <div v-else class="px-5 py-12 text-center">
              <p class="font-display text-lg text-fg">No matches.</p>
              <p class="text-sm text-muted mt-1">
                Try a different word or browse the
                <NuxtLink
                  to="/"
                  class="underline underline-offset-4 hover:text-fg"
                  @click="close"
                >
                  full menu
                </NuxtLink>
                .
              </p>
            </div>
          </div>

          <div
            class="flex items-center justify-between gap-4 px-5 py-2.5 border-t border-line text-[11px] tracking-[0.16em] uppercase text-muted/80"
          >
            <span class="flex items-center gap-2">
              <kbd class="kbd">↑</kbd>
              <kbd class="kbd">↓</kbd>
              navigate
              <kbd class="kbd ml-3">↵</kbd>
              open
            </span>
            <span class="hidden sm:flex items-center gap-1.5">
              <kbd class="kbd">Esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.4rem;
  padding: 0 0.35rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  line-height: 1.4rem;
  letter-spacing: 0;
  border: 1px solid var(--color-line, #E5DFD3);
  border-bottom-width: 2px;
  background: var(--color-bg, #FBFAF7);
  color: var(--color-fg, #171715);
  border-radius: 3px;
  text-transform: none;
}
</style>
