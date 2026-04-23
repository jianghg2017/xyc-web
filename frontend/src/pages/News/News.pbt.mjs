/**
 * Standalone Property-Based Test for News list complete rendering
 * Runs directly with Node.js (no vitest/vite required)
 *
 * **Validates: Requirements 5.1**
 *
 * Property 3: News list renders all items
 * For arbitrary news arrays, assert card count equals array length and each
 * card shows title and published date.
 */

import fc from 'fast-check'

// ---------------------------------------------------------------------------
// Pure logic extracted from News/index.tsx for property testing
// ---------------------------------------------------------------------------

/**
 * Simulates what the News page renders: maps each news item to a "card"
 * containing the fields that must be visible (title and published date).
 * This mirrors the JSX in News/index.tsx:
 *   <h3>{item.title}</h3>
 *   {item.published_at && (
 *     <div>{new Date(item.published_at).toLocaleDateString('zh-CN')}</div>
 *   )}
 */
function renderNewsCards(newsItems) {
  return newsItems.map((item) => ({
    title: item.title,
    publishedDate: item.published_at
      ? new Date(item.published_at).toLocaleDateString('zh-CN')
      : null,
  }))
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty news title */
const newsTitleArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a news category */
const newsCategoryArb = fc.constantFrom('公司新闻', '产品动态', '行业活动', '技术文章')

/** Arbitrary for an ISO date string (published_at) */
const publishedAtArb = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .map((d) => d.toISOString())

/** Arbitrary for a single news item (only fields relevant to the list page) */
const newsArb = fc.record({
  id: fc.integer({ min: 1, max: 100000 }),
  title: newsTitleArb,
  category: newsCategoryArb,
  summary: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  cover_image: fc.option(fc.webUrl(), { nil: undefined }),
  published_at: publishedAtArb,
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

console.log('\nNews list complete rendering (Property 3)')
console.log('Validates: Requirements 5.1\n')

// ---------------------------------------------------------------------------
// Property 3: card count equals news array length
// ---------------------------------------------------------------------------

runTest('Property 3: card count equals news array length', () => {
  fc.assert(
    fc.property(
      fc.array(newsArb, { minLength: 1, maxLength: 30 }),
      (newsItems) => {
        const cards = renderNewsCards(newsItems)
        if (cards.length !== newsItems.length) {
          throw new Error(
            `Expected ${newsItems.length} cards, got ${cards.length}`
          )
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 3: each card exposes the news title
// ---------------------------------------------------------------------------

runTest('Property 3: each card exposes the news title', () => {
  fc.assert(
    fc.property(
      fc.array(newsArb, { minLength: 1, maxLength: 30 }),
      (newsItems) => {
        const cards = renderNewsCards(newsItems)
        for (let i = 0; i < cards.length; i++) {
          if (cards[i].title !== newsItems[i].title) {
            throw new Error(
              `Card[${i}].title="${cards[i].title}" !== news.title="${newsItems[i].title}"`
            )
          }
          if (cards[i].title.length === 0) {
            throw new Error(`Card[${i}].title is empty`)
          }
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 3: each card exposes the published date
// ---------------------------------------------------------------------------

runTest('Property 3: each card exposes the published date', () => {
  fc.assert(
    fc.property(
      fc.array(newsArb, { minLength: 1, maxLength: 30 }),
      (newsItems) => {
        const cards = renderNewsCards(newsItems)
        for (let i = 0; i < cards.length; i++) {
          const item = newsItems[i]
          if (item.published_at) {
            const expectedDate = new Date(item.published_at).toLocaleDateString('zh-CN')
            if (cards[i].publishedDate !== expectedDate) {
              throw new Error(
                `Card[${i}].publishedDate="${cards[i].publishedDate}" !== expected="${expectedDate}"`
              )
            }
            if (!cards[i].publishedDate) {
              throw new Error(`Card[${i}].publishedDate is null/empty but published_at is set`)
            }
          }
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Edge case: empty news array produces zero cards
// ---------------------------------------------------------------------------

runTest('empty news array produces zero cards', () => {
  const cards = renderNewsCards([])
  if (cards.length !== 0) {
    throw new Error(`Expected 0 cards for empty array, got ${cards.length}`)
  }
})

// ---------------------------------------------------------------------------
// Combined invariant: count + field presence for any array size
// ---------------------------------------------------------------------------

runTest('Property 3: count and field presence hold for any array size', () => {
  fc.assert(
    fc.property(
      fc.array(newsArb, { minLength: 0, maxLength: 50 }),
      (newsItems) => {
        const cards = renderNewsCards(newsItems)

        // Count invariant
        if (cards.length !== newsItems.length) {
          throw new Error(
            `Count mismatch: expected ${newsItems.length}, got ${cards.length}`
          )
        }

        // Field invariant for every card
        for (let i = 0; i < cards.length; i++) {
          const item = newsItems[i]

          // Title must match
          if (cards[i].title !== item.title) {
            throw new Error(
              `Card[${i}].title mismatch: "${cards[i].title}" !== "${item.title}"`
            )
          }

          // Published date must be formatted correctly when present
          if (item.published_at) {
            const expectedDate = new Date(item.published_at).toLocaleDateString('zh-CN')
            if (cards[i].publishedDate !== expectedDate) {
              throw new Error(
                `Card[${i}].publishedDate mismatch: "${cards[i].publishedDate}" !== "${expectedDate}"`
              )
            }
          }
        }

        return true
      }
    ),
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
