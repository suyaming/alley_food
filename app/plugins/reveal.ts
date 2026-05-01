// v-reveal — fade-up element when it enters the viewport.
//
// Usage:
//   <h2 v-reveal>...</h2>            → default 0ms delay
//   <p v-reveal:80>...</p>           → 80ms delay (number after colon)
//   <div v-reveal="120">...</div>    → same, via value binding (more flexible)
//
// The directive sets data-reveal="" while waiting and toggles it to "in" once
// at least 12 % of the element is visible. We unobserve after first fire so the
// animation never re-runs on subsequent scrolls.

import type { DirectiveBinding, ObjectDirective } from 'vue'

interface RevealEl extends HTMLElement {
  __reveal_obs?: IntersectionObserver
}

function parseDelay(binding: DirectiveBinding): number {
  if (typeof binding.value === 'number') return binding.value
  if (typeof binding.value === 'string') {
    const n = Number(binding.value)
    if (!Number.isNaN(n)) return n
  }
  if (binding.arg) {
    const n = Number(binding.arg)
    if (!Number.isNaN(n)) return n
  }
  return 0
}

const reveal: ObjectDirective<RevealEl> = {
  // Emit data-reveal="" during SSR so the element renders hidden from the
  // first paint; the client mounted hook then takes over and sets "in".
  getSSRProps(binding) {
    const delay = parseDelay(binding)
    const props: Record<string, string> = { 'data-reveal': '' }
    if (delay > 0) {
      props.style = `--reveal-delay:${delay}ms`
    }
    return props
  },
  mounted(el, binding) {
    if (typeof window === 'undefined') return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.setAttribute('data-reveal', 'in')
      return
    }

    const delay = parseDelay(binding)
    if (delay > 0) {
      el.style.setProperty('--reveal-delay', `${delay}ms`)
    }
    el.setAttribute('data-reveal', '')

    if (!('IntersectionObserver' in window)) {
      el.setAttribute('data-reveal', 'in')
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-reveal', 'in')
            obs.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(el)
    el.__reveal_obs = obs
  },
  unmounted(el) {
    el.__reveal_obs?.disconnect()
    delete el.__reveal_obs
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal)
})
