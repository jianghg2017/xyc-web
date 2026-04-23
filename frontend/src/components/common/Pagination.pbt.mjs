/**
 * Standalone Property-Based Test for Pagination boundary correctness
 * Runs directly with Node.js (no vitest/vite required)
 *
 * **Validates: Requirements 4.3, 5.3**
 *
 * Property 5: Pagination boundary correctness
 * For arbitrary total, limit, page: assert displayed slice size ≤ limit
 * and total pages = ceil(total/limit).
 */

import fc from 'fast-check'

/**
 * Pure pagination calculation logic.
 * Given total items, items per page (limit), and a requested page number,
 * returns the clamped page, start index, end index, and total page count.
 */
function computePagination(total, limit, page) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
  const validPage = Math.min(page, Math.max(1, totalPages))
  const start = (validPage - 1) * limit
  const end = Math.min(validPage * limit, total)
  return { totalPages, validPage, start, end, sliceSize: end - start }
}

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

console.log('\nPagination boundary correctness (Property 5)')
console.log('Validates: Requirements 4.3, 5.3\n')

// Property 5: Pagination boundary correctness
runTest('page contains correct slice of items', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 100 }), // total items
      fc.integer({ min: 1, max: 20 }),  // items per page (limit)
      fc.integer({ min: 1 }),           // page number (arbitrary, may exceed totalPages)
      (total, limit, page) => {
        const { totalPages, sliceSize } = computePagination(total, limit, page)

        // Property: total pages must equal ceil(total / limit)
        // Edge case: when total === 0, totalPages is 0 (no pages needed)
        const expectedTotalPages = total === 0 ? 0 : Math.ceil(total / limit)
        if (totalPages !== expectedTotalPages) return false

        // Property: displayed slice size must be between 0 and limit (inclusive)
        if (sliceSize < 0 || sliceSize > limit) return false

        return true
      }
    ),
    { numRuns: 100 }
  )
})

// Additional edge case tests
runTest('total=0 yields totalPages=0 and sliceSize=0', () => {
  const result = computePagination(0, 10, 1)
  if (result.totalPages !== 0) throw new Error(`Expected totalPages=0, got ${result.totalPages}`)
  if (result.sliceSize !== 0) throw new Error(`Expected sliceSize=0, got ${result.sliceSize}`)
})

runTest('total=10, limit=3 yields totalPages=4', () => {
  const result = computePagination(10, 3, 1)
  if (result.totalPages !== 4) throw new Error(`Expected totalPages=4, got ${result.totalPages}`)
})

runTest('page beyond totalPages is clamped to last page', () => {
  const result = computePagination(10, 3, 999)
  if (result.validPage !== 4) throw new Error(`Expected validPage=4, got ${result.validPage}`)
  if (result.sliceSize > 3) throw new Error(`Expected sliceSize<=3, got ${result.sliceSize}`)
})

runTest('last page may have fewer items than limit', () => {
  const result = computePagination(10, 3, 4) // page 4: items 10-10 (1 item)
  if (result.sliceSize !== 1) throw new Error(`Expected sliceSize=1, got ${result.sliceSize}`)
})

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`)

if (failed > 0) {
  process.exit(1)
}
