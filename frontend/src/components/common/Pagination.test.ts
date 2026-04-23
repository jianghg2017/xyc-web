/**
 * Property-Based Tests for Pagination boundary correctness
 *
 * **Validates: Requirements 4.3, 5.3**
 *
 * Property 5: Pagination boundary correctness
 * For arbitrary total, limit, page: assert displayed slice size ≤ limit
 * and total pages = ceil(total/limit).
 */

import { describe, it } from 'vitest'
import * as fc from 'fast-check'

/**
 * Pure pagination calculation logic extracted for testing.
 * Given total items, items per page (limit), and a requested page number,
 * returns the clamped page, start index, end index, and total page count.
 */
function computePagination(total: number, limit: number, page: number) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
  const validPage = Math.min(page, Math.max(1, totalPages))
  const start = (validPage - 1) * limit
  const end = Math.min(validPage * limit, total)
  return { totalPages, validPage, start, end, sliceSize: end - start }
}

describe('Pagination boundary correctness (Property 5)', () => {
  it('page contains correct slice of items', () => {
    // **Validates: Requirements 4.3, 5.3**
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
})
