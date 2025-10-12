export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-8">
          {/* Profile Photo Skeleton */}
          <div className="h-32 w-32 rounded-full bg-gray-200 animate-pulse" />

          {/* Profile Info Skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Stats Section Skeleton */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}