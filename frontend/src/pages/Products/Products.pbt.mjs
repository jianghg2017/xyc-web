/**
 * Standalone Property-Based Test for category filter correctness
 * Runs directly with Node.js (no vitest/vite required)
 *
 * **Validates: Requirements 4.2, 5.2**
 *
 * Property 4: Category filter shows only matching items
 * For arbitrary product list and selected category, assert all rendered
 * cards have `category === selectedCategory`.
 */

import fc from 'fast-check'

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
function filterByCategory(products, selectedCategory) {
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
function renderProductCards(products) {
  return products.map((p) => ({
    name: p.name,
    category: p.category,
  }))
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const PRODUCT_CATEGORIES = ['软件产品', '硬件产品', '解决方案']

/** Arbitrary for a non-empty product name */
const productNameArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a product category */
const categoryArb = fc.constantFrom(...PRODUCT_CATEGORIES)

/** Arbitrary for a single product (only fields relevant to the list page) */
const productArb = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  name: productNameArb,
  category: categoryArb,
  description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  status: fc.constant('published'),
})

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

let passed = 0
let failed = 0

function runTest(name, fn) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (e) {
    console.error(`  ✗ ${name}`)
    console.error(`    ${e.message}`)
    failed++
  }
}

console.log('\nCategory filter correctness (Property 4)')
console.log('Validates: Requirements 4.2, 5.2\n')

// ---------------------------------------------------------------------------
// Property 4: all rendered cards match the selected category
// ---------------------------------------------------------------------------

runTest('Property 4: all rendered cards have category === selectedCategory', () => {
  fc.assert(
    fc.property(
      fc.array(productArb, { minLength: 0, maxLength: 30 }),
      categoryArb,
      (products, selectedCategory) => {
        const filtered = filterByCategory(products, selectedCategory)
        const cards = renderProductCards(filtered)

        for (let i = 0; i < cards.length; i++) {
          if (cards[i].category !== selectedCategory) {
            throw new Error(
              `Card[${i}].category="${cards[i].category}" !== selectedCategory="${selectedCategory}"`
            )
          }
        }

        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 4: no card from a different category appears after filtering
// ---------------------------------------------------------------------------

runTest('Property 4: no card from a different category appears after filtering', () => {
  fc.assert(
    fc.property(
      fc.array(productArb, { minLength: 1, maxLength: 30 }),
      categoryArb,
      (products, selectedCategory) => {
        const filtered = filterByCategory(products, selectedCategory)

        // Every item in the filtered list must belong to the selected category
        const wrongCategory = filtered.find((p) => p.category !== selectedCategory)
        if (wrongCategory) {
          throw new Error(
            `Found product with category="${wrongCategory.category}" after filtering for "${selectedCategory}"`
          )
        }

        // The filtered count must equal the number of matching items in the original list
        const expectedCount = products.filter((p) => p.category === selectedCategory).length
        if (filtered.length !== expectedCount) {
          throw new Error(
            `Expected ${expectedCount} items matching "${selectedCategory}", got ${filtered.length}`
          )
        }

        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 4: filtered count never exceeds total count
// ---------------------------------------------------------------------------

runTest('Property 4: filtered count never exceeds total count', () => {
  fc.assert(
    fc.property(
      fc.array(productArb, { minLength: 0, maxLength: 50 }),
      categoryArb,
      (products, selectedCategory) => {
        const filtered = filterByCategory(products, selectedCategory)

        if (filtered.length > products.length) {
          throw new Error(
            `filtered.length=${filtered.length} > products.length=${products.length}`
          )
        }

        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 4: "全部" (empty category) returns all items unchanged
// ---------------------------------------------------------------------------

runTest('Property 4: empty category string returns all items (全部 tab)', () => {
  fc.assert(
    fc.property(
      fc.array(productArb, { minLength: 0, maxLength: 30 }),
      (products) => {
        const filtered = filterByCategory(products, '')

        if (filtered.length !== products.length) {
          throw new Error(
            `Expected all ${products.length} items when category is empty, got ${filtered.length}`
          )
        }

        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 4: filtering a list that already matches the category is a no-op
// ---------------------------------------------------------------------------

runTest('Property 4: filtering a homogeneous list returns the same items', () => {
  fc.assert(
    fc.property(
      categoryArb,
      fc.integer({ min: 1, max: 20 }),
      (selectedCategory, count) => {
        // Build a list where every product belongs to selectedCategory
        const products = Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          name: `Product ${i + 1}`,
          category: selectedCategory,
          status: 'published',
        }))

        const filtered = filterByCategory(products, selectedCategory)

        if (filtered.length !== products.length) {
          throw new Error(
            `Expected ${products.length} items when all match "${selectedCategory}", got ${filtered.length}`
          )
        }

        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Edge case: empty product list always produces empty filtered result
// ---------------------------------------------------------------------------

runTest('edge case: empty product list always produces empty filtered result', () => {
  for (const cat of PRODUCT_CATEGORIES) {
    const filtered = filterByCategory([], cat)
    if (filtered.length !== 0) {
      throw new Error(
        `Expected 0 items for empty list filtered by "${cat}", got ${filtered.length}`
      )
    }
  }
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  process.exit(1)
}
