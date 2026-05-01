<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    variant?: 'mark' | 'mark-only'
  }>(),
  {
    size: 32,
    variant: 'mark',
  },
)
</script>

<template>
  <span
    class="inline-flex items-center gap-2 leading-none align-middle select-none"
    :style="{ height: `${size}px` }"
  >
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 1024 1024"
      role="img"
      aria-label="巷口 Alley"
      class="block shrink-0"
    >
      <defs>
        <clipPath :id="`brandmark-notch-${size}`">
          <path d="M 200 200 H 824 V 760 L 760 824 H 200 Z" />
        </clipPath>
      </defs>
      <g :clip-path="`url(#brandmark-notch-${size})`">
        <rect
          x="200"
          y="200"
          width="624"
          height="624"
          rx="24"
          fill="var(--accent)"
        />
      </g>
      <text
        x="380"
        y="640"
        text-anchor="middle"
        font-size="320"
        font-weight="700"
        font-family="'Noto Serif SC', 'Songti SC', 'STSong', serif"
        fill="var(--accent-fg)"
      >
        巷
      </text>
      <text
        x="644"
        y="640"
        text-anchor="middle"
        font-size="320"
        font-weight="700"
        font-family="'Noto Serif SC', 'Songti SC', 'STSong', serif"
        fill="var(--accent-fg)"
      >
        口
      </text>
    </svg>
    <span
      v-if="variant === 'mark'"
      class="font-display text-fg leading-none tracking-tight"
      :style="{ fontSize: `${Math.round(size * 0.66)}px` }"
    >
      <span class="font-cn font-bold">巷口</span>
      <span class="italic font-normal text-muted ml-2">Alley</span>
    </span>
  </span>
</template>
