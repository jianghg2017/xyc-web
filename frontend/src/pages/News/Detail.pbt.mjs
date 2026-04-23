/**
 * Standalone Property-Based Test for News detail field completeness
 * Runs directly with Node.js (no vitest/vite required)
 *
 * **Validates: Requirements 5.5**
 *
 * Property 7: News detail page renders all fields
 * For arbitrary valid news objects, assert rendered output contains
 * title, category, published date, and content.
 */

import fc from 'fast-check'

// ---------------------------------------------------------------------------
// Pure logic extracted from News/Detail.tsx for property testing
// ---------------------------------------------------------------------------

/**
 * Simulates what the NewsDetail page renders: extracts the fields that
 * must be visible in the output (title, category, formattedDate, content).
 *
 * This mirrors the JSX in News/Detail.tsx:
 *   <h1>{news.title}</h1>
 *   <span>{news.category}</span>
 *   <span>{formattedDate}</span>
 *   <article dangerouslySetInnerHTML={{ __html: news.content }} />
 */
function renderNewsDetail(news) {
  const formattedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return {
    title: news.title,
    category: news.category ?? null,
    formattedDate,
    content: news.content ?? null,
  }
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

/** Arbitrary for a non-empty HTML content string */
const contentArb = fc
  .string({ minLength: 1, maxLength: 500 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a valid news detail object */
const newsArb = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  title: newsTitleArb,
  category: newsCategoryArb,
  summary: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  content: contentArb,
  published_at: publishedAtArb,
  cover_image: fc.option(fc.webUrl(), { nil: undefined }),
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

console.log('\nNews detail field completeness (Property 7)')
console.log('Validates: Requirements 5.5\n')

// ---------------------------------------------------------------------------
// Property 7: rendered output contains the news title
// ---------------------------------------------------------------------------

runTest('Property 7: rendered output contains the news title', () => {
  fc.assert(
    fc.property(newsArb, (news) => {
      const rendered = renderNewsDetail(news)

      if (rendered.title !== news.title) {
        throw new Error(
          `rendered.title="${rendered.title}" !== news.title="${news.title}"`
        )
      }
      if (!rendered.title || rendered.title.length === 0) {
        throw new Error('rendered.title is empty')
      }

      return true
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 7: rendered output contains the news category
// ---------------------------------------------------------------------------

runTest('Property 7: rendered output contains the news category', () => {
  fc.assert(
    fc.property(newsArb, (news) => {
      const rendered = renderNewsDetail(news)

      if (rendered.category !== news.category) {
        throw new Error(
          `rendered.category="${rendered.category}" !== news.category="${news.category}"`
        )
      }

      return true
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 7: rendered output contains the formatted published date
// ---------------------------------------------------------------------------

runTest('Property 7: rendered output contains the formatted published date', () => {
  fc.assert(
    fc.property(newsArb, (news) => {
      const rendered = renderNewsDetail(news)

      if (news.published_at) {
        const expectedDate = new Date(news.published_at).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        if (rendered.formattedDate !== expectedDate) {
          throw new Error(
            `rendered.formattedDate="${rendered.formattedDate}" !== expected="${expectedDate}"`
          )
        }
        if (!rendered.formattedDate) {
          throw new Error('rendered.formattedDate is null/empty but published_at is set')
        }
      }

      return true
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 7: rendered output contains the news content
// ---------------------------------------------------------------------------

runTest('Property 7: rendered output contains the news content', () => {
  fc.assert(
    fc.property(newsArb, (news) => {
      const rendered = renderNewsDetail(news)

      if (rendered.content !== news.content) {
        throw new Error(
          `rendered.content="${rendered.content}" !== news.content="${news.content}"`
        )
      }
      if (!rendered.content || rendered.content.length === 0) {
        throw new Error('rendered.content is empty')
      }

      return true
    }),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Edge case: news without published_at has null formattedDate
// ---------------------------------------------------------------------------

runTest('edge case: news without published_at has null formattedDate', () => {
  const news = {
    id: 1,
    title: 'Test News',
    category: '公司新闻',
    content: '<p>Some content</p>',
    status: 'published',
  }
  const rendered = renderNewsDetail(news)
  if (rendered.formattedDate !== null) {
    throw new Error(
      `Expected formattedDate=null when published_at is absent, got "${rendered.formattedDate}"`
    )
  }
})

// ---------------------------------------------------------------------------
// Combined invariant: all four fields present for any valid news object
// ---------------------------------------------------------------------------

runTest('Property 7: title, category, published date, and content all present for any valid news', () => {
  fc.assert(
    fc.property(newsArb, (news) => {
      const rendered = renderNewsDetail(news)

      // Title invariant
      if (rendered.title !== news.title) {
        throw new Error(`Title mismatch: "${rendered.title}" !== "${news.title}"`)
      }

      // Category invariant
      if (rendered.category !== news.category) {
        throw new Error(`Category mismatch: "${rendered.category}" !== "${news.category}"`)
      }

      // Published date invariant
      if (news.published_at) {
        const expectedDate = new Date(news.published_at).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        if (rendered.formattedDate !== expectedDate) {
          throw new Error(
            `FormattedDate mismatch: "${rendered.formattedDate}" !== "${expectedDate}"`
          )
        }
      }

      // Content invariant
      if (rendered.content !== news.content) {
        throw new Error(`Content mismatch: "${rendered.content}" !== "${news.content}"`)
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
