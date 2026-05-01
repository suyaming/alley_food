import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { products, getProduct } from '~~/shared/products'

describe('shared/products', () => {
  it('has at least 80 dishes', () => {
    expect(products.length).toBeGreaterThanOrEqual(80)
  })

  it('every product id is unique', () => {
    const ids = new Set<string>()
    for (const p of products) {
      expect(ids.has(p.id)).toBe(false)
      ids.add(p.id)
    }
  })

  it('every product has all required fields populated', () => {
    for (const p of products) {
      expect(p.id, `id missing for ${JSON.stringify(p)}`).toBeTruthy()
      expect(typeof p.id).toBe('string')
      expect(p.name).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(p.category).toBeTruthy()
      expect(p.currency).toBeTruthy()
      expect(p.price).toBeGreaterThan(0)
      expect(p.image).toBeTruthy()
    }
  })

  it('product ids match the slug pattern (lowercase + digits + hyphens)', () => {
    const re = /^[a-z0-9-]+$/
    for (const p of products) {
      expect(p.id, `bad id: ${p.id}`).toMatch(re)
    }
  })

  it('every local product image file exists on disk', () => {
    for (const p of products) {
      if (p.image.startsWith('/')) {
        const abs = resolve(process.cwd(), 'public' + p.image)
        expect(existsSync(abs), `missing image: ${abs}`).toBe(true)
      }
    }
  })

  it('getProduct() returns the same instance by id', () => {
    const first = products[0]!
    expect(getProduct(first.id)).toEqual(first)
    expect(getProduct('this-does-not-exist')).toBeUndefined()
  })

  it('all categories are well-formed strings', () => {
    const cats = new Set(products.map((p) => p.category))
    expect(cats.size).toBeGreaterThan(0)
    for (const c of cats) expect(c.length).toBeGreaterThan(1)
  })
})
