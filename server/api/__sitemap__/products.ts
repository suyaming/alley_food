import { defineSitemapEventHandler } from '#imports'
import { products } from '~~/shared/products'

/**
 * Dynamic sitemap source: emits a URL entry for every product.
 * Static routes are auto-discovered by @nuxtjs/sitemap from app/pages/**.
 */
export default defineSitemapEventHandler(() => {
  return products.map((p) => ({
    loc: `/product/${p.id}`,
    images: [{ loc: p.image }],
    changefreq: 'weekly' as const,
    priority: 0.8,
  }))
})
