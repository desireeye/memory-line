import { useState, useEffect } from 'react';

export default function UploadStatus({ message, progress }) {
  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded shadow-lg z-50">
      <div>{message}</div>
      {progress !== undefined && (
        <div className="w-full h-2 bg-blue-700 rounded mt-2">
          <div 
            className="h-full bg-white rounded transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}