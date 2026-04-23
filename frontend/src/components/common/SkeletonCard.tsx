interface SkeletonCardProps {
  type?: 'news' | 'product' | 'text'
  count?: number
}

function NewsSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 w-full" />
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        {/* Date */}
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        {/* Summary lines */}
        <div className="space-y-2 pt-1">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/5" />
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Image placeholder */}
      <div className="h-52 bg-gray-200 w-full" />
      <div className="p-4 space-y-3">
        {/* Product name */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        {/* Category badge */}
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        {/* Description lines */}
        <div className="space-y-2 pt-1">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

function TextSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
    </div>
  )
}

const skeletonMap = {
  news: NewsSkeleton,
  product: ProductSkeleton,
  text: TextSkeleton,
}

export default function SkeletonCard({ type = 'text', count = 1 }: SkeletonCardProps) {
  const SkeletonItem = skeletonMap[type]

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <SkeletonItem />
        </div>
      ))}
    </>
  )
}
