<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="btn-icon"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <ClientOnly>
      <component
        :is="isDark ? Sun : Moon"
        :size="18"
        :stroke-width="1.5"
        aria-hidden="true"
      />
      <template #fallback>
        <Moon :size="18" :stroke-width="1.5" aria-hidden="true" />
      </template>
    </ClientOnly>
  </button>
</template>
