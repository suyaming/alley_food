import { useRuntimeConfig } from '#imports'

declare global {
  interface Window {
    paypal?: any
  }
}

let loadingPromise: Promise<any> | null = null

export function usePaypal() {
  const config = useRuntimeConfig()

  function loadPaypalSdk(): Promise<any> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Checkout SDK can only load in the browser.'))
    }
    if (window.paypal) {
      return Promise.resolve(window.paypal)
    }
    if (loadingPromise) return loadingPromise

    const clientId = config.public.paypalClientId
    const currency = config.public.paypalCurrency || 'USD'
    if (!clientId) {
      return Promise.reject(
        new Error(
          'Checkout is not configured. Please contact support if this persists.',
        ),
      )
    }

    const url = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`

    loadingPromise = new Promise<any>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-paypal-sdk="true"]',
      )
      if (existing) {
        existing.addEventListener('load', () => resolve(window.paypal))
        existing.addEventListener('error', () =>
          reject(new Error('Failed to load checkout SDK.')),
        )
        return
      }
      const script = document.createElement('script')
      script.src = url
      script.async = true
      script.dataset.paypalSdk = 'true'
      script.onload = () => resolve(window.paypal)
      script.onerror = () => reject(new Error('Failed to load checkout SDK.'))
      document.head.appendChild(script)
    })

    return loadingPromise
  }

  return { loadPaypalSdk }
}
