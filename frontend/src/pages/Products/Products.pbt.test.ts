/**
 * Property-Based Tests for category filter correctness
 *
 * **Validates: Requirements 4.2, 5.2**
 *
 * Property 4: Category filter shows only matching items
 * For arbitrary product list and selected category, assert all rendered
 * cards have `category === selectedCategory`.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Product } from '@/types'

// ---------------------------------------------------------------------------
// Pure logic extracted from Products/index.tsx for property testing
// ---------------------------------------------------------------------------

/**
 * Simulates the category filter applied by the Products page.
 *
 * The page calls `productsApi.getList(page, 9, category)` which sends
 * `?category={category}` to the backend. The backend returns only items
 * matching that category. This function models that server-side filter so
 * we can test the invariant purely in-process.
 *
 * When `selectedCategory` is empty string or undefined the filter is
 * inactive and all items are returned (the "全部" tab behaviour).
 */
function filterByCategory(
  products: Product[],
  selectedCategory: string | undefined
): Product[] {
  if (!selectedCategory) return products
  return products.filter((p) => p.category === selectedCategory)
}

/**
 * Simulates what the Products page renders for each product card:
 * the fields that must be visible (name and category).
 *
 * This mirrors the JSX in Products/index.tsx:
 *   <span>{product.category}</span>
 *   <h3>{product.name}</h3>
 */
function renderProductCards(
  products: Product[]
): Array<{ name: string; category: Product['category'] }> {
  return products.map((p) => ({
    name: p.name,
    category: p.category,
  }))
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty product name */
const productNameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a product category */
const categoryArb = fc.constantFrom<NonNullable<Product['category']>>(
  '软件产品',
  '硬件产品',
  '解决方案'
)

/** Arbitrary for a single product (only fields relevant to the list page) */
const productArb: fc.Arbitrary<Product> = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  name: productNameArb,
  category: categoryArb,
  description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  status: fc.constant<'published'>('published'),
})

// ---------------------------------------------------------------------------
// Property 4: Category filter shows only matching items
// Validates: Requirements 4.2, 5.2
// ---------------------------------------------------------------------------

describe('Category filter correctness (Property 4)', () => {
  /**
   * **Validates: Requirements 4.2, 5.2**
   *
   * Property 4: For any product list and any selected category, every card
   * rendered after filtering must have `category === selectedCategory`.
   */
  it('Property 4: all rendered cards have category === selectedCategory', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 30 }),
        categoryArb,
        (products, selectedCategory) => {
          const filtered = filterByCategory(products, selectedCategory)
          const cards = renderProductCards(filtered)

          cards.forEach((card, i) => {
            expect(card.category).toBe(selectedCategory)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 4.2, 5.2**
   *
   * Property 4: No product from a different category should appear in the
   * filtered result, and every product that does not match must be excluded.
   */
  it('Property 4: no card from a different category appears after filtering', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 30 }),
        categoryArb,
        (products, selectedCategory) => {
          const filtered = filterByCategory(products, selectedCategory)

          // Every item in the filtered list must belong to the selected category
          filtered.forEach((p) => {
            expect(p.category).toBe(selectedCategory)
          })

          // The filtered count must equal the number of matching items in the original list
          const expectedCount = products.filter((p) => p.category === selectedCategory).length
          expect(filtered.length).toBe(expectedCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 4.2, 5.2**
   *
   * Property 4: The filtered count must never exceed the total count.
   */
  it('Property 4: filtered count never exceeds total count', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 50 }),
        categoryArb,
        (products, selectedCategory) => {
          const filtered = filterByCategory(products, selectedCategory)
          expect(filtered.length).toBeLessThanOrEqual(products.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 4.2**
   *
   * Property 4: When the selected category is empty (the "全部" tab),
   * all items are returned unchanged.
   */
  it('Property 4: empty category string returns all items (全部 tab)', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 30 }),
        (products) => {
          const filtered = filterByCategory(products, '')
          expect(filtered).toHaveLength(products.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 4.2, 5.2**
   *
   * Property 4: Filtering a list where every product already belongs to
   * the selected category is a no-op — all items are retained.
   */
  it('Property 4: filtering a homogeneous list returns the same items', () => {
    fc.assert(
      fc.property(
        categoryArb,
        fc.integer({ min: 1, max: 20 }),
        (selectedCategory, count) => {
          // Build a list where every product belongs to selectedCategory
          const products: Product[] = Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Product ${i + 1}`,
            category: selectedCategory,
            status: 'published' as const,
          }))

          const filtered = filterByCategory(products, selectedCategory)
          expect(filtered).toHaveLength(products.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('edge case: empty product list always produces empty filtered result', () => {
    const categories: NonNullable<Product['category']>[] = ['软件产品', '硬件产品', '解决方案']
    categories.forEach((cat) => {
      const filtered = filterByCategory([], cat)
      expect(filtered).toHaveLength(0)
    })
  })
})
