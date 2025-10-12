export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header Skeleton */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-8 w-48 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 mx-auto bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Memories Timeline Skeleton */}
      <div className="relative">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}