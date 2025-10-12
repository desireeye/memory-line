export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>

      <div className="flex justify-center gap-2 mb-8 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-20 h-10 bg-gray-200 rounded-full"></div>
        ))}
      </div>

      <div className="space-y-8 animate-pulse">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Monthly Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex items-end h-40 gap-2">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gray-200 rounded-t"
                  style={{ height: `${Math.random() * 100}%` }}
                ></div>
                <div className="h-3 w-full bg-gray-200 rounded mt-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>

        {/* Featured Memory */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Memory Timeline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-4 p-4">
                <div className="h-20 w-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}