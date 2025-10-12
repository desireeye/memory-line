'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { getOptimizedImageUrl, getVideoThumbnail } from '@/lib/cloudinary';

export default function MemoryCard({ memory }) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

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

  const handleLike = () => {
    if (!session) return;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const isVideo = memory.media_type === 'video';
  const tags = parseTags(memory.tags);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={!session}
              className={`flex items-center space-x-1 text-sm ${
                isLiked ? 'text-red-600' : 'text-gray-500'
              } ${!session ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'}`}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>
            
            <button
              disabled={!session}
              className={`flex items-center space-x-1 text-sm text-gray-500 ${
                !session ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>0</span>
            </button>
          </div>
          
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
    </div>
  );
}