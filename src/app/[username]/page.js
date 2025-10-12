'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PublicTimeline({ params }) {
  const { username } = useParams();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicMemories();
  }, [username]);

  const fetchPublicMemories = async () => {
    try {
      setLoading(true);
      // For now, return empty data
      // You can implement public memories API later
      setMemories([]);
    } catch (err) {
      setError('Failed to fetch memories');
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">@{username}</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">@{username}</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">@{username}</h1>
      
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👤</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Profile not found</h2>
        <p className="text-gray-500 mb-4">This user doesn't exist or their profile is private.</p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Go Home
        </a>
      </div>
    </div>
  );
}