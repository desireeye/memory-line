'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const { collectionId } = params;
  const [collection, setCollection] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchCollection();
    }
  }, [session, collectionId]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      // For now, return empty data
      // You can implement collection API later
      setCollection(null);
      setMemories([]);
    } catch (err) {
      setError('Failed to fetch collection');
      console.error('Error fetching collection:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Collection</h1>
        <p className="text-gray-600">Please sign in to view this collection.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Collection</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Collection</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <a href="/collections" className="text-blue-600 hover:text-blue-700 text-sm">
          ← Back to Collections
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6">Collection Details</h1>
      
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📁</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Collection not found</h2>
        <p className="text-gray-500 mb-4">This collection doesn't exist or you don't have access to it.</p>
        <a href="/collections" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Collections
        </a>
      </div>
    </div>
  );
}