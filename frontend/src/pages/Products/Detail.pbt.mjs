/**
 * Standalone Property-Based Test for Product detail field completeness
 * Runs directly with Node.js (no vitest/vite required)
 *
 * **Validates: Requirements 4.5**
 *
 * Property 6: Product detail page renders all fields
 * For arbitrary valid product objects, assert rendered output contains
 * name, description, and all feature titles.
 */

import fc from 'fast-check'

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
function renderProductDetail(product) {
  const output = {
    name: product.name,
    description: product.description ?? null,
    featureTitles: Array.isArray(product.features)
      ? product.features.map((f) => f.title)
      : [],
  }
  return output
}

/**
 * Checks that the rendered output contains the product name, description,
 * and all feature titles.
 */
function assertDetailContainsAllFields(product, rendered) {
  // Name must be present
  if (rendered.name !== product.name) {
    throw new Error(
      `rendered.name="${rendered.name}" !== product.name="${product.name}"`
    )
  }

  // Description must be present when provided
  if (product.description !== undefined && product.description !== null) {
    if (rendered.description !== product.description) {
      throw new Error(
        `rendered.description="${rendered.description}" !== product.description="${product.description}"`
      )
    }
  }

  // All feature titles must be present
  const features = product.features ?? []
  if (rendered.featureTitles.length !== features.length) {
    throw new Error(
      `rendered.featureTitles.length=${rendered.featureTitles.length} !== features.length=${features.length}`
    )
  }
  for (let i = 0; i < features.length; i++) {
    if (rendered.featureTitles[i] !== features[i].title) {
      throw new Error(
        `featureTitles[${i}]="${rendered.featureTitles[i]}" !== features[${i}].title="${features[i].title}"`
      )
    }
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
const featureArb = fc.record({
  title: featureTitleArb,
  description: fc.string({ maxLength: 200 }),
})

/** Arbitrary for a valid product with name, description, and features */
const productArb = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  name: productNameArb,
  description: fc.option(fc.string({ minLength: 1, maxLength: 300 }), { nil: undefined }),
  content: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  cover_image: fc.option(fc.webUrl(), { nil: undefined }),
  category: fc.constantFrom('软件产品', '硬件产品', '解决方案'),
  features: fc.array(featureArb, { minLength: 0, maxLength: 10 }),
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

console.log('\nProduct detail field completeness (Property 6)')
console.log('Validates: Requirements 4.5\n')

// ---------------------------------------------------------------------------
// Property 6: rendered output contains the product name
// ---------------------------------------------------------------------------

runTest('Property 6: rendered output contains the product name', () => {
  fc.assert(
    fc.property(productArb, (product) => {
      const rendered = renderProductDetail(product)
      assertDetailContainsAllFields(product, rendered)
      return true
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 6: rendered output contains all feature titles
// ---------------------------------------------------------------------------

runTest('Property 6: rendered output contains all feature titles', () => {
  fc.assert(
    fc.property(
      fc.record({
        id: fc.integer({ min: 1, max: 100_000 }),
        name: productNameArb,
        description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
        features: fc.array(featureArb, { minLength: 1, maxLength: 10 }),
        status: fc.constant('published'),
      }),
      (product) => {
        const rendered = renderProductDetail(product)

        if (rendered.featureTitles.length !== product.features.length) {
          throw new Error(
            `Expected ${product.features.length} feature titles, got ${rendered.featureTitles.length}`
          )
        }

        for (let i = 0; i < product.features.length; i++) {
          if (rendered.featureTitles[i] !== product.features[i].title) {
            throw new Error(
              `featureTitles[${i}]="${rendered.featureTitles[i]}" !== "${product.features[i].title}"`
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
// Property 6: product with no features renders zero feature titles
// ---------------------------------------------------------------------------

runTest('Property 6: product with no features renders zero feature titles', () => {
  fc.assert(
    fc.property(
      fc.record({
        id: fc.integer({ min: 1, max: 100_000 }),
        name: productNameArb,
        description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
        features: fc.constant([]),
        status: fc.constant('published'),
      }),
      (product) => {
        const rendered = renderProductDetail(product)
        if (rendered.featureTitles.length !== 0) {
          throw new Error(
            `Expected 0 feature titles for product with no features, got ${rendered.featureTitles.length}`
          )
        }
        return true
      }
    ),
    { numRuns: 50 }
  )
})

// ---------------------------------------------------------------------------
// Edge case: product without features field renders zero feature titles
// ---------------------------------------------------------------------------

runTest('edge case: product without features field renders zero feature titles', () => {
  const product = { id: 1, name: 'Test Product', status: 'published' }
  const rendered = renderProductDetail(product)
  if (rendered.featureTitles.length !== 0) {
    throw new Error(
      `Expected 0 feature titles when features is undefined, got ${rendered.featureTitles.length}`
    )
  }
})

// ---------------------------------------------------------------------------
// Combined invariant: name + description + all feature titles
// ---------------------------------------------------------------------------

runTest('Property 6: name, description, and all feature titles present for any valid product', () => {
  fc.assert(
    fc.property(productArb, (product) => {
      const rendered = renderProductDetail(product)

      // Name invariant
      if (rendered.name !== product.name) {
        throw new Error(`Name mismatch: "${rendered.name}" !== "${product.name}"`)
      }

      // Description invariant (when provided)
      if (product.description !== undefined && product.description !== null) {
        if (rendered.description !== product.description) {
          throw new Error(
            `Description mismatch: "${rendered.description}" !== "${product.description}"`
          )
        }
      }

      // Feature titles invariant
      const features = product.features ?? []
      if (rendered.featureTitles.length !== features.length) {
        throw new Error(
          `Feature count mismatch: expected ${features.length}, got ${rendered.featureTitles.length}`
        )
      }
      for (let i = 0; i < features.length; i++) {
        if (rendered.featureTitles[i] !== features[i].title) {
          throw new Error(
            `featureTitles[${i}] mismatch: "${rendered.featureTitles[i]}" !== "${features[i].title}"`
          )
        }
      }

      return true
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  process.exit(1)
}
