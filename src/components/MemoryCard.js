'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import CommentSection from './CommentSection';
import ReactionSection from './ReactionSection';

export default function MemoryCard({ memory, index }) {
  const isEven = index % 2 === 0;
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative flex ${isEven ? 'flex-row' : 'flex-row-reverse'} items-center gap-8 mb-8`}
    >
      {/* Timeline connector */}
      <div className="absolute left-1/2 h-full w-px bg-pastel-blue -z-10" />
      <div className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-pastel-blue -ml-2" />

      {/* Memory content */}
      <div className={`flex-1 ${isEven ? 'text-right pr-8' : 'pl-8'}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {memory.mediaUrl && (
            <div className="relative h-48 w-full">
              {memory.type === 'image' ? (
                <Image
                  src={memory.mediaUrl}
                  alt={memory.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <video
                  src={memory.mediaUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500">
                {format(new Date(memory.date), 'MMMM d, yyyy')}
              </div>
              {memory.isPrivate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
            <p className="text-gray-600 mb-3">{memory.story}</p>
            
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-pastel-pink px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <ReactionSection memoryId={memory.id} />
              
              <div className="mt-4">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-pastel-blue hover:text-blue-600 transition-colors"
                >
                  {showComments ? 'Hide Comments' : 'Show Comments'}
                </button>
              </div>

              {showComments && (
                <CommentSection memoryId={memory.id} />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Empty div for layout balance */}
      <div className="flex-1" />
    </motion.div>
  );
}