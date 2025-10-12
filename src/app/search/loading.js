export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
      
      <div className="space-y-4 mb-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}