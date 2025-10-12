export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 w-full bg-gray-200 rounded-lg"></div>
        </div>

        {/* Memory Cards */}
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-8">
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}