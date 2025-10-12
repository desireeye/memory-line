'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { getOptimizedImageUrl, getVideoThumbnail } from '@/lib/cloudinary';

export default function MemoriesPage() {
  const { data: session, status } = useSession();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchMemories();
    }
  }, [session]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/memories?userId=${session.user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setMemories(data.memories);
      } else {
        setError(data.error || 'Failed to fetch memories');
      }
    } catch (err) {
      setError('Failed to fetch memories');
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseTags = (tagsJson) => {
    try {
      return JSON.parse(tagsJson || '[]');
    } catch {
      return [];
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
        <h1 className="text-3xl font-bold mb-6">My Memories</h1>
        <p className="text-gray-600">Please sign in to view your memories.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Memories</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Memories</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Memories</h1>
        <a
          href="/add-memory"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Memory
        </a>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📸</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No memories yet</h2>
          <p className="text-gray-500 mb-4">Start building your memory timeline by adding your first memory!</p>
          <a
            href="/add-memory"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Memory
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => {
            const tags = parseTags(memory.tags);
            const isVideo = memory.media_type === 'video';
            
            return (
              <div key={memory.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 w-full">
                  {isVideo ? (
                    <Image
                      src={getVideoThumbnail(memory.media_public_id)}
                      alt={memory.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={getOptimizedImageUrl(memory.media_public_id, {
                        width: 400,
                        height: 300,
                        crop: 'fill'
                      })}
                      alt={memory.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5-8-5z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{memory.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-3">{memory.story}</p>
                  <p className="text-gray-500 text-xs mb-3">{formatDate(memory.date)}</p>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {memory.is_private && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                      Private
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}