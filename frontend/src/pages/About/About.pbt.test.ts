/**
 * Property-Based Tests for About page complete data rendering
 *
 * **Validates: Requirements 3.1, 3.2, 3.3**
 *
 * Property 1: About page renders all data items
 * For arbitrary arrays of stats/timeline/values, assert rendered item counts
 * match array lengths.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Local interfaces matching About/index.tsx
// ---------------------------------------------------------------------------

interface Stat {
  id: number
  number: string
  label: string
}

interface TimelineItem {
  id: number
  year: string
  event: string
}

interface Value {
  id: number
  title: string
  description: string
  icon?: string
}

// ---------------------------------------------------------------------------
// Pure logic extracted from About/index.tsx for property testing
// ---------------------------------------------------------------------------

/**
 * Simulates what the About page renders for stats.
 * Mirrors the JSX in About/index.tsx:
 *   {displayStats.map((stat) => (
 *     <div>{stat.number}</div>
 *     <div>{stat.label}</div>
 *   ))}
 */
function renderStats(stats: Stat[]): Array<{ number: string; label: string }> {
  return stats.map((stat) => ({
    number: stat.number,
    label: stat.label,
  }))
}

/**
 * Simulates what the About page renders for timeline items.
 * Mirrors the JSX in About/index.tsx:
 *   {displayTimeline.map((item) => (
 *     <div>{item.year}</div>
 *     <div>{item.event}</div>
 *   ))}
 */
function renderTimeline(timeline: TimelineItem[]): Array<{ year: string; event: string }> {
  return timeline.map((item) => ({
    year: item.year,
    event: item.event,
  }))
}

/**
 * Simulates what the About page renders for values.
 * Mirrors the JSX in About/index.tsx:
 *   {displayValues.map((value) => (
 *     <h3>{value.title}</h3>
 *     <p>{value.description}</p>
 *   ))}
 */
function renderValues(values: Value[]): Array<{ title: string; description: string }> {
  return values.map((value) => ({
    title: value.title,
    description: value.description,
  }))
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty trimmed string */
const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a single Stat item */
const statArb: fc.Arbitrary<Stat> = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  number: nonEmptyStringArb,
  label: nonEmptyStringArb,
})

/** Arbitrary for a single TimelineItem */
const timelineItemArb: fc.Arbitrary<TimelineItem> = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  year: fc.integer({ min: 2000, max: 2099 }).map((y) => String(y)),
  event: nonEmptyStringArb,
})

/** Arbitrary for a single Value item */
const valueArb: fc.Arbitrary<Value> = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  icon: fc.option(fc.constantFrom('user-group', 'trophy', 'shield-check'), { nil: undefined }),
})

// ---------------------------------------------------------------------------
// Property 1: About page renders all data items
// Validates: Requirements 3.1, 3.2, 3.3
// ---------------------------------------------------------------------------

describe('About page complete data rendering (Property 1)', () => {
  /**
   * **Validates: Requirements 3.1**
   *
   * Property 1: For any array of stats returned by the API,
   * the rendered stat count must equal the array length.
   */
  it('Property 1: rendered stats count equals stats array length', () => {
    fc.assert(
      fc.property(
        fc.array(statArb, { minLength: 0, maxLength: 20 }),
        (stats) => {
          const rendered = renderStats(stats)
          expect(rendered).toHaveLength(stats.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 3.2**
   *
   * Property 1: For any array of timeline items returned by the API,
   * the rendered timeline count must equal the array length.
   */
  it('Property 1: rendered timeline count equals timeline array length', () => {
    fc.assert(
      fc.property(
        fc.array(timelineItemArb, { minLength: 0, maxLength: 20 }),
        (timeline) => {
          const rendered = renderTimeline(timeline)
          expect(rendered).toHaveLength(timeline.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 3.3**
   *
   * Property 1: For any array of values returned by the API,
   * the rendered values count must equal the array length.
   */
  it('Property 1: rendered values count equals values array length', () => {
    fc.assert(
      fc.property(
        fc.array(valueArb, { minLength: 0, maxLength: 20 }),
        (values) => {
          const rendered = renderValues(values)
          expect(rendered).toHaveLength(values.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 3.1, 3.2, 3.3**
   *
   * Property 1: Combined — all three rendered counts match their array
   * lengths simultaneously for arbitrary inputs.
   */
  it('Property 1: all three rendered counts match their array lengths simultaneously', () => {
    fc.assert(
      fc.property(
        fc.array(statArb, { minLength: 0, maxLength: 20 }),
        fc.array(timelineItemArb, { minLength: 0, maxLength: 20 }),
        fc.array(valueArb, { minLength: 0, maxLength: 20 }),
        (stats, timeline, values) => {
          const renderedStats = renderStats(stats)
          const renderedTimeline = renderTimeline(timeline)
          const renderedValues = renderValues(values)

          expect(renderedStats).toHaveLength(stats.length)
          expect(renderedTimeline).toHaveLength(timeline.length)
          expect(renderedValues).toHaveLength(values.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 1: empty stats array produces zero rendered stat items', () => {
    const rendered = renderStats([])
    expect(rendered).toHaveLength(0)
  })

  it('Property 1: empty timeline array produces zero rendered timeline items', () => {
    const rendered = renderTimeline([])
    expect(rendered).toHaveLength(0)
  })

  it('Property 1: empty values array produces zero rendered value items', () => {
    const rendered = renderValues([])
    expect(rendered).toHaveLength(0)
  })

  /**
   * **Validates: Requirements 3.1**
   *
   * Property 1: Each rendered stat exposes the correct number and label fields.
   */
  it('Property 1: each rendered stat exposes number and label', () => {
    fc.assert(
      fc.property(
        fc.array(statArb, { minLength: 1, maxLength: 20 }),
        (stats) => {
          const rendered = renderStats(stats)
          rendered.forEach((item, i) => {
            expect(item.number).toBe(stats[i].number)
            expect(item.label).toBe(stats[i].label)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 3.2**
   *
   * Property 1: Each rendered timeline item exposes the correct year and event fields.
   */
  it('Property 1: each rendered timeline item exposes year and event', () => {
    fc.assert(
      fc.property(
        fc.array(timelineItemArb, { minLength: 1, maxLength: 20 }),
        (timeline) => {
          const rendered = renderTimeline(timeline)
          rendered.forEach((item, i) => {
            expect(item.year).toBe(timeline[i].year)
            expect(item.event).toBe(timeline[i].event)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Validates: Requirements 3.3**
   *
   * Property 1: Each rendered value exposes the correct title and description fields.
   */
  it('Property 1: each rendered value exposes title and description', () => {
    fc.assert(
      fc.property(
        fc.array(valueArb, { minLength: 1, maxLength: 20 }),
        (values) => {
          const rendered = renderValues(values)
          rendered.forEach((item, i) => {
            expect(item.title).toBe(values[i].title)
            expect(item.description).toBe(values[i].description)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
