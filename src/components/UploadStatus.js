import { useState, useEffect } from 'react';

export default function UploadStatus({ message, progress, isError = false }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      // Auto-hide after 5 seconds for errors, 3 seconds for success
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, isError ? 5000 : 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [message, isError]);

  if (!isVisible || !message) return null;

  return (
    <div className={`fixed top-4 right-4 text-white p-4 rounded shadow-lg z-50 max-w-sm ${
      isError ? 'bg-red-500' : 'bg-blue-500'
    }`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="font-medium">
            {isError ? 'Upload Error' : 'Upload Status'}
          </div>
          <div className="text-sm mt-1">{message}</div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 text-xl leading-none"
        >
          ×
        </button>
      </div>
      {progress !== undefined && progress > 0 && (
        <div className="w-full h-2 bg-blue-700 rounded mt-2">
          <div 
            className={`h-full rounded transition-all duration-300 ${
              isError ? 'bg-red-300' : 'bg-white'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}