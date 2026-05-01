<script setup lang="ts">
import { onMounted } from 'vue'
import { Cookie } from 'lucide-vue-next'

const consent = useConsent()

onMounted(() => {
  consent.load()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="!consent.choiceMade.value"
        class="fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pointer-events-none"
        role="region"
        aria-label="Cookie consent"
      >
        <div
          class="pointer-events-auto mx-auto max-w-3xl bg-bg/95 backdrop-blur border border-line shadow-lg"
        >
          <div class="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
            <Cookie
              :size="22"
              :stroke-width="1.5"
              class="text-fg shrink-0 mt-0.5 hidden sm:block"
            />
            <div class="flex-1 min-w-0">
              <p class="font-display text-lg leading-snug text-fg">
                A small note about cookies.
              </p>
              <p class="text-sm text-muted mt-1.5 leading-relaxed">
                We use strictly-necessary cookies to keep your cart and order
                lookup working. With your permission, we also use a privacy-friendly,
                self-hosted analytics tool to count anonymous page visits. No
                third-party trackers, ever.
                <NuxtLink
                  to="/legal/privacy"
                  class="underline underline-offset-4 hover:text-fg"
                >
                  Read the privacy note.
                </NuxtLink>
              </p>
            </div>
            <div class="flex flex-row sm:flex-col items-stretch gap-2 sm:gap-2 sm:w-auto shrink-0">
              <button
                type="button"
                class="btn-ghost text-xs sm:text-sm whitespace-nowrap"
                @click="consent.acceptEssentialOnly()"
              >
                Essential only
              </button>
              <button
                type="button"
                class="btn-primary text-xs sm:text-sm whitespace-nowrap"
                @click="consent.acceptAll()"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
