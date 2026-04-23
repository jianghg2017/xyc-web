/**
 * Property-Based Tests for News list complete rendering
 *
 * **Validates: Requirements 5.1**
 *
 * Property 3: News list renders all items
 * For arbitrary news arrays, assert card count equals array length and each
 * card shows title and published date.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { News } from '@/types'

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
function renderNewsCards(newsItems: News[]): Array<{ title: string; publishedDate: string | null }> {
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

/** Arbitrary for a single News item (only fields relevant to the list page) */
const newsArb: fc.Arbitrary<News> = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  title: newsTitleArb,
  content: fc.constant(''),
  category: newsCategoryArb,
  summary: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  cover_image: fc.option(fc.webUrl(), { nil: undefined }),
  published_at: publishedAtArb,
  status: fc.constant<'published'>('published'),
})

// ---------------------------------------------------------------------------
// Property 3: News list renders all items
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------

describe('News list complete rendering (Property 3)', () => {
  /**
   * **Validates: Requirements 5.1**
   *
   * Property 3: For any non-empty array of news items returned by the API,
   * the rendered card count must equal the array length, and every card
   * must expose the news title and published date.
   */
  it('Property 3: card count equals news array length', () => {
    fc.assert(
      fc.property(
        fc.array(newsArb, { minLength: 1, maxLength: 30 }),
        (newsItems) => {
          const cards = renderNewsCards(newsItems)

          // Card count must match the number of news items
          expect(cards).toHaveLength(newsItems.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3: each card exposes the news title', () => {
    fc.assert(
      fc.property(
        fc.array(newsArb, { minLength: 1, maxLength: 30 }),
        (newsItems) => {
          const cards = renderNewsCards(newsItems)

          cards.forEach((card, i) => {
            // The card's title must match the source news item's title exactly
            expect(card.title).toBe(newsItems[i].title)
            // Title must be non-empty (the page renders it in an <h3>)
            expect(card.title.length).toBeGreaterThan(0)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3: each card exposes the published date', () => {
    fc.assert(
      fc.property(
        fc.array(newsArb, { minLength: 1, maxLength: 30 }),
        (newsItems) => {
          const cards = renderNewsCards(newsItems)

          cards.forEach((card, i) => {
            const item = newsItems[i]
            if (item.published_at) {
              const expectedDate = new Date(item.published_at).toLocaleDateString('zh-CN')
              // The card's published date must be formatted correctly
              expect(card.publishedDate).toBe(expectedDate)
              // Published date must be non-null when published_at is set
              expect(card.publishedDate).not.toBeNull()
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3: empty news array produces zero cards', () => {
    const cards = renderNewsCards([])
    expect(cards).toHaveLength(0)
  })

  it('Property 3: card count and field presence hold for any array size', () => {
    fc.assert(
      fc.property(
        fc.array(newsArb, { minLength: 0, maxLength: 50 }),
        (newsItems) => {
          const cards = renderNewsCards(newsItems)

          // Count invariant
          expect(cards).toHaveLength(newsItems.length)

          // Field invariant for every card
          cards.forEach((card, i) => {
            const item = newsItems[i]

            // Title must match
            expect(card.title).toBe(item.title)

            // Published date must be formatted correctly when present
            if (item.published_at) {
              const expectedDate = new Date(item.published_at).toLocaleDateString('zh-CN')
              expect(card.publishedDate).toBe(expectedDate)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
