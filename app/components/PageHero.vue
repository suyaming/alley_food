<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    titleEn: string
    titleEnItalic?: string
    titleCn?: string
    subtitle?: string
    align?: 'left' | 'center'
  }>(),
  {
    align: 'left',
  },
)
</script>

<template>
  <header
    class="container-px max-w-5xl mx-auto pt-16 pb-12 lg:pt-24 lg:pb-16 border-b border-line"
    :class="align === 'center' ? 'text-center' : ''"
  >
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h1
      class="font-display font-medium text-fg mt-5 leading-[1.05] text-display-sm"
    >
      <span v-if="titleCn" class="font-cn font-bold mr-3">{{ titleCn }}</span>
      <span v-if="titleEnItalic">
        {{ titleEn }}
        <span class="italic font-normal">{{ titleEnItalic }}</span
        >.
      </span>
      <span v-else>{{ titleEn }}</span>
    </h1>
    <p
      v-if="subtitle"
      class="mt-6 max-w-2xl text-muted text-base md:text-lg leading-relaxed"
      :class="align === 'center' ? 'mx-auto' : ''"
    >
      {{ subtitle }}
    </p>
  </header>
</template>
