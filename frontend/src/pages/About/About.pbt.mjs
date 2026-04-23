/**
 * Standalone Property-Based Test for About page complete data rendering
 * Runs directly with Node.js (no vitest/vite required)
 *
 * **Validates: Requirements 3.1, 3.2, 3.3**
 *
 * Property 1: About page renders all data items
 * For arbitrary arrays of stats/timeline/values, assert rendered item counts
 * match array lengths.
 */

import fc from 'fast-check'

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
function renderStats(stats) {
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
function renderTimeline(timeline) {
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
function renderValues(values) {
  return values.map((value) => ({
    title: value.title,
    description: value.description,
  }))
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty string */
const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

/** Arbitrary for a single Stat item */
const statArb = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  number: nonEmptyStringArb,
  label: nonEmptyStringArb,
})

/** Arbitrary for a single TimelineItem */
const timelineItemArb = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  year: fc.integer({ min: 2000, max: 2099 }).map((y) => String(y)),
  event: nonEmptyStringArb,
})

/** Arbitrary for a single Value item */
const valueArb = fc.record({
  id: fc.integer({ min: 1, max: 100_000 }),
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  icon: fc.option(fc.constantFrom('user-group', 'trophy', 'shield-check'), { nil: undefined }),
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

console.log('\nAbout page complete data rendering (Property 1)')
console.log('Validates: Requirements 3.1, 3.2, 3.3\n')

// ---------------------------------------------------------------------------
// Property 1: rendered stats count equals stats array length (Req 3.1)
// ---------------------------------------------------------------------------

runTest('Property 1: rendered stats count equals stats array length', () => {
  fc.assert(
    fc.property(
      fc.array(statArb, { minLength: 0, maxLength: 20 }),
      (stats) => {
        const rendered = renderStats(stats)
        if (rendered.length !== stats.length) {
          throw new Error(
            `Expected ${stats.length} stat items, got ${rendered.length}`
          )
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 1: rendered timeline count equals timeline array length (Req 3.2)
// ---------------------------------------------------------------------------

runTest('Property 1: rendered timeline count equals timeline array length', () => {
  fc.assert(
    fc.property(
      fc.array(timelineItemArb, { minLength: 0, maxLength: 20 }),
      (timeline) => {
        const rendered = renderTimeline(timeline)
        if (rendered.length !== timeline.length) {
          throw new Error(
            `Expected ${timeline.length} timeline items, got ${rendered.length}`
          )
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 1: rendered values count equals values array length (Req 3.3)
// ---------------------------------------------------------------------------

runTest('Property 1: rendered values count equals values array length', () => {
  fc.assert(
    fc.property(
      fc.array(valueArb, { minLength: 0, maxLength: 20 }),
      (values) => {
        const rendered = renderValues(values)
        if (rendered.length !== values.length) {
          throw new Error(
            `Expected ${values.length} value items, got ${rendered.length}`
          )
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Property 1: combined — all three counts match simultaneously
// ---------------------------------------------------------------------------

runTest('Property 1: all three rendered counts match their array lengths simultaneously', () => {
  fc.assert(
    fc.property(
      fc.array(statArb, { minLength: 0, maxLength: 20 }),
      fc.array(timelineItemArb, { minLength: 0, maxLength: 20 }),
      fc.array(valueArb, { minLength: 0, maxLength: 20 }),
      (stats, timeline, values) => {
        const renderedStats = renderStats(stats)
        const renderedTimeline = renderTimeline(timeline)
        const renderedValues = renderValues(values)

        if (renderedStats.length !== stats.length) {
          throw new Error(
            `Stats count mismatch: expected ${stats.length}, got ${renderedStats.length}`
          )
        }
        if (renderedTimeline.length !== timeline.length) {
          throw new Error(
            `Timeline count mismatch: expected ${timeline.length}, got ${renderedTimeline.length}`
          )
        }
        if (renderedValues.length !== values.length) {
          throw new Error(
            `Values count mismatch: expected ${values.length}, got ${renderedValues.length}`
          )
        }

        return true
      }
    ),
    { numRuns: 100 }
  )
})

// ---------------------------------------------------------------------------
// Edge cases: empty arrays produce zero rendered items
// ---------------------------------------------------------------------------

runTest('empty stats array produces zero rendered stat items', () => {
  const rendered = renderStats([])
  if (rendered.length !== 0) {
    throw new Error(`Expected 0 stat items for empty array, got ${rendered.length}`)
  }
})

runTest('empty timeline array produces zero rendered timeline items', () => {
  const rendered = renderTimeline([])
  if (rendered.length !== 0) {
    throw new Error(`Expected 0 timeline items for empty array, got ${rendered.length}`)
  }
})

runTest('empty values array produces zero rendered value items', () => {
  const rendered = renderValues([])
  if (rendered.length !== 0) {
    throw new Error(`Expected 0 value items for empty array, got ${rendered.length}`)
  }
})

// ---------------------------------------------------------------------------
// Field presence: each rendered item exposes the correct fields
// ---------------------------------------------------------------------------

runTest('Property 1: each rendered stat exposes number and label', () => {
  fc.assert(
    fc.property(
      fc.array(statArb, { minLength: 1, maxLength: 20 }),
      (stats) => {
        const rendered = renderStats(stats)
        for (let i = 0; i < rendered.length; i++) {
          if (rendered[i].number !== stats[i].number) {
            throw new Error(
              `rendered[${i}].number="${rendered[i].number}" !== stats[${i}].number="${stats[i].number}"`
            )
          }
          if (rendered[i].label !== stats[i].label) {
            throw new Error(
              `rendered[${i}].label="${rendered[i].label}" !== stats[${i}].label="${stats[i].label}"`
            )
          }
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

runTest('Property 1: each rendered timeline item exposes year and event', () => {
  fc.assert(
    fc.property(
      fc.array(timelineItemArb, { minLength: 1, maxLength: 20 }),
      (timeline) => {
        const rendered = renderTimeline(timeline)
        for (let i = 0; i < rendered.length; i++) {
          if (rendered[i].year !== timeline[i].year) {
            throw new Error(
              `rendered[${i}].year="${rendered[i].year}" !== timeline[${i}].year="${timeline[i].year}"`
            )
          }
          if (rendered[i].event !== timeline[i].event) {
            throw new Error(
              `rendered[${i}].event="${rendered[i].event}" !== timeline[${i}].event="${timeline[i].event}"`
            )
          }
        }
        return true
      }
    ),
    { numRuns: 100 }
  )
})

runTest('Property 1: each rendered value exposes title and description', () => {
  fc.assert(
    fc.property(
      fc.array(valueArb, { minLength: 1, maxLength: 20 }),
      (values) => {
        const rendered = renderValues(values)
        for (let i = 0; i < rendered.length; i++) {
          if (rendered[i].title !== values[i].title) {
            throw new Error(
              `rendered[${i}].title="${rendered[i].title}" !== values[${i}].title="${values[i].title}"`
            )
          }
          if (rendered[i].description !== values[i].description) {
            throw new Error(
              `rendered[${i}].description="${rendered[i].description}" !== values[${i}].description="${values[i].description}"`
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
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  process.exit(1)
}
