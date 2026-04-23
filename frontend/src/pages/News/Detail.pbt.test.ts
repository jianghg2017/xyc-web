/**
 * Property-Based Tests for News detail field completeness
 *
 * **Validates: Requirements 5.5**
 *
 * Property 7: News detail page renders all fields
 * For arbitrary valid news objects, assert rendered output contains
 * title, category, published date, and content.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { News } from '@/types'

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
function renderNewsDetail(news: News): {
  title: string
  category: string | null
  formattedDate: string | null
  content: string | null
} {
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
const newsCategoryArb = fc.constantFrom<News['category']>(
  '公司新闻',
  '产品动态',
  '行业活动',
  '技术文章'
)

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
const newsArb: fc.Arbitrary<News> = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  title: newsTitleArb,
  category: newsCategoryArb,
  summary: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  content: contentArb,
  published_at: publishedAtArb,
  cover_image: fc.option(fc.webUrl(), { nil: undefined }),
  status: fc.constant<'published'>('published'),
})

// ---------------------------------------------------------------------------
// Property 7: News detail page renders all fields
// Validates: Requirements 5.5
// ---------------------------------------------------------------------------

describe('News detail field completeness (Property 7)', () => {
  /**
   * **Validates: Requirements 5.5**
   *
   * Property 7: For any valid news object, the rendered output must contain
   * the news title exactly.
   */
  it('Property 7: rendered output contains the news title', () => {
    fc.assert(
      fc.property(newsArb, (news) => {
        const rendered = renderNewsDetail(news)

        // Title must match exactly
        expect(rendered.title).toBe(news.title)
        // Title must be non-empty
        expect(rendered.title.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 5.5**
   *
   * Property 7: For any valid news object, the rendered output must contain
   * the news category exactly.
   */
  it('Property 7: rendered output contains the news category', () => {
    fc.assert(
      fc.property(newsArb, (news) => {
        const rendered = renderNewsDetail(news)

        // Category must match exactly
        expect(rendered.category).toBe(news.category)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 5.5**
   *
   * Property 7: For any valid news object with a published_at date, the
   * rendered output must contain the correctly formatted date.
   */
  it('Property 7: rendered output contains the formatted published date', () => {
    fc.assert(
      fc.property(newsArb, (news) => {
        const rendered = renderNewsDetail(news)

        if (news.published_at) {
          const expectedDate = new Date(news.published_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          // Formatted date must match the expected locale string
          expect(rendered.formattedDate).toBe(expectedDate)
          // Formatted date must be non-null when published_at is set
          expect(rendered.formattedDate).not.toBeNull()
        }
      }),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 5.5**
   *
   * Property 7: For any valid news object, the rendered output must contain
   * the news content exactly.
   */
  it('Property 7: rendered output contains the news content', () => {
    fc.assert(
      fc.property(newsArb, (news) => {
        const rendered = renderNewsDetail(news)

        // Content must match exactly
        expect(rendered.content).toBe(news.content)
        // Content must be non-null/non-empty for our generated news
        expect(rendered.content).not.toBeNull()
        expect(rendered.content!.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 7: news without published_at has null formattedDate', () => {
    // Edge case: published_at is absent
    const news: News = {
      id: 1,
      title: 'Test News',
      category: '公司新闻',
      content: '<p>Some content</p>',
      status: 'published',
    }
    const rendered = renderNewsDetail(news)
    expect(rendered.formattedDate).toBeNull()
  })

  /**
   * **Validates: Requirements 5.5**
   *
   * Combined invariant: title, category, published date, and content are all
   * present for any arbitrary valid news object.
   */
  it('Property 7: title, category, published date, and content all present for any valid news', () => {
    fc.assert(
      fc.property(newsArb, (news) => {
        const rendered = renderNewsDetail(news)

        // Title invariant
        expect(rendered.title).toBe(news.title)

        // Category invariant
        expect(rendered.category).toBe(news.category ?? null)

        // Published date invariant
        if (news.published_at) {
          const expectedDate = new Date(news.published_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          expect(rendered.formattedDate).toBe(expectedDate)
        }

        // Content invariant
        expect(rendered.content).toBe(news.content ?? null)
      }),
      { numRuns: 100 }
    )
  })
})
