import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Computes the list of page numbers (and ellipsis markers) to display.
 * Always shows first/last page, current page, and up to 2 neighbours.
 * Inserts '...' where pages are skipped.
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []

  // Always include page 1
  pages.push(1)

  // Left ellipsis: needed when current page is far from the start
  if (currentPage > 4) {
    pages.push('...')
  }

  // Pages around the current page
  const rangeStart = Math.max(2, currentPage - 1)
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1)

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  // Right ellipsis: needed when current page is far from the end
  if (currentPage < totalPages - 3) {
    pages.push('...')
  }

  // Always include last page
  pages.push(totalPages)

  return pages
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  const baseItemClass =
    'inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'

  const activeClass = 'bg-primary-600 text-white shadow-sm'
  const inactiveClass = 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
  const disabledClass = 'text-gray-300 cursor-not-allowed'

  return (
    <nav
      role="navigation"
      aria-label="分页导航"
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      {/* Previous button */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="上一页"
        className={`${baseItemClass} ${currentPage === 1 ? disabledClass : inactiveClass}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 text-sm text-gray-400 select-none"
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`第 ${page} 页`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${baseItemClass} ${page === currentPage ? activeClass : inactiveClass}`}
          >
            {page}
          </button>
        )
      )}

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="下一页"
        className={`${baseItemClass} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}

export default Pagination
