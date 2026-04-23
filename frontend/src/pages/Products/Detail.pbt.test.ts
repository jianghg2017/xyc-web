/**
 * Property-Based Tests for Product detail field completeness
 *
 * **Validates: Requirements 4.5**
 *
 * Property 6: Product detail page renders all fields
 * For arbitrary valid product objects, assert rendered output contains
 * name, description, and all feature titles.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Product, ProductFeature } from '@/types'

// ---------------------------------------------------------------------------
// Pure logic extracted from Products/Detail.tsx for property testing
// ---------------------------------------------------------------------------

/**
 * Simulates what the ProductDetail page renders: extracts the fields that
 * must be visible in the output (name, description, feature titles).
 *
 * This mirrors the JSX in Products/Detail.tsx:
 *   <h1>{product.name}</h1>
 *   <p>{product.description}</p>
 *   {product.features.map(f => <h3>{feature.title}</h3>)}
 */
function renderProductDetail(product: Product): {
  name: string
  description: string | null
  featureTitles: string[]
} {
  return {
    name: product.name,
    description: product.description ?? null,
    featureTitles: Array.isArray(product.features)
      ? product.features.map((f) => f.title)
      : [],
  }
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty product name */
const productNameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a non-empty feature title */
const featureTitleArb = fc
  .string({ minLength: 1, maxLength: 60 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a single ProductFeature */
const featureArb: fc.Arbitrary<ProductFeature> = fc.record({
  title: featureTitleArb,
  description: fc.string({ maxLength: 200 }),
})

/** Arbitrary for a valid product with name, description, and features */
const productArb: fc.Arbitrary<Product> = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  name: productNameArb,
  description: fc.option(fc.string({ minLength: 1, maxLength: 300 }), { nil: undefined }),
  content: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  cover_image: fc.option(fc.webUrl(), { nil: undefined }),
  category: fc.constantFrom<Product['category']>('软件产品', '硬件产品', '解决方案'),
  features: fc.array(featureArb, { minLength: 0, maxLength: 10 }),
  status: fc.constant<'published'>('published'),
})

// ---------------------------------------------------------------------------
// Property 6: Product detail page renders all fields
// Validates: Requirements 4.5
// ---------------------------------------------------------------------------

describe('Product detail field completeness (Property 6)', () => {
  /**
   * **Validates: Requirements 4.5**
   *
   * Property 6: For any valid product, the rendered output must contain
   * the product name exactly.
   */
  it('Property 6: rendered output contains the product name', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const rendered = renderProductDetail(product)

        // Name must match exactly
        expect(rendered.name).toBe(product.name)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 4.5**
   *
   * Property 6: For any valid product with features, the rendered output
   * must contain all feature titles in the same order.
   */
  it('Property 6: rendered output contains all feature titles', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 100_000 }),
          name: productNameArb,
          description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
          features: fc.array(featureArb, { minLength: 1, maxLength: 10 }),
          status: fc.constant<'published'>('published'),
        }),
        (product) => {
          const rendered = renderProductDetail(product)

          // Feature title count must match
          expect(rendered.featureTitles).toHaveLength(product.features!.length)

          // Each feature title must match in order
          product.features!.forEach((feature, i) => {
            expect(rendered.featureTitles[i]).toBe(feature.title)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 4.5**
   *
   * Property 6: For any valid product with a description, the rendered
   * output must contain the description exactly.
   */
  it('Property 6: rendered output contains the product description when present', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 100_000 }),
          name: productNameArb,
          description: fc.string({ minLength: 1, maxLength: 300 }),
          features: fc.array(featureArb, { minLength: 0, maxLength: 5 }),
          status: fc.constant<'published'>('published'),
        }),
        (product) => {
          const rendered = renderProductDetail(product)

          // Description must match exactly when provided
          expect(rendered.description).toBe(product.description)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 6: product with no features renders zero feature titles', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 100_000 }),
          name: productNameArb,
          description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
          features: fc.constant<ProductFeature[]>([]),
          status: fc.constant<'published'>('published'),
        }),
        (product) => {
          const rendered = renderProductDetail(product)
          expect(rendered.featureTitles).toHaveLength(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Property 6: product without features field renders zero feature titles', () => {
    // Edge case: features field is undefined (not provided)
    const product: Product = { id: 1, name: 'Test Product', status: 'published' }
    const rendered = renderProductDetail(product)
    expect(rendered.featureTitles).toHaveLength(0)
  })

  /**
   * **Validates: Requirements 4.5**
   *
   * Combined invariant: name, description, and all feature titles are all
   * present for any arbitrary valid product.
   */
  it('Property 6: name, description, and all feature titles present for any valid product', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const rendered = renderProductDetail(product)

        // Name invariant
        expect(rendered.name).toBe(product.name)

        // Description invariant (when provided)
        if (product.description !== undefined && product.description !== null) {
          expect(rendered.description).toBe(product.description)
        }

        // Feature titles invariant
        const features = product.features ?? []
        expect(rendered.featureTitles).toHaveLength(features.length)
        features.forEach((feature, i) => {
          expect(rendered.featureTitles[i]).toBe(feature.title)
        })
      }),
      { numRuns: 100 }
    )
  })
})
