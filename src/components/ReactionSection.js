'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const REACTIONS = {
  '❤️': 'love',
  '😂': 'laugh',
  '😮': 'wow',
  '😢': 'sad',
  '😡': 'angry',
  '👍': 'like'
};

export default function ReactionSection({ memoryId }) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  useEffect(() => {
    if (!memoryId) return;

    // For now, return empty reactions
    // You can implement reactions API later
    setReactions({});
    setUserReactions({});
  }, [memoryId]);

  const handleReaction = async (emoji) => {
    if (!session?.user) return;

    try {
      const reactionType = REACTIONS[emoji];
      const existingReactionId = userReactions[reactionType];

      if (existingReactionId) {
        // Remove reaction
        setReactions(prev => ({
          ...prev,
          [reactionType]: (prev[reactionType] || 1) - 1
        }));
        setUserReactions(prev => {
          const newReactions = { ...prev };
          delete newReactions[reactionType];
          return newReactions;
        });
      } else {
        // Add reaction
        setReactions(prev => ({
          ...prev,
          [reactionType]: (prev[reactionType] || 0) + 1
        }));
        setUserReactions(prev => ({
          ...prev,
          [reactionType]: Date.now() // Temporary ID
        }));
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          React
        </button>
        
        {Object.entries(reactions).map(([type, count]) => (
          <div
            key={type}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
          >
            <span>{Object.entries(REACTIONS).find(([_, t]) => t === type)?.[0]}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>

      {showReactionPicker && (
        <div className="mt-2 flex space-x-2">
          {Object.entries(REACTIONS).map(([emoji, type]) => (
            <button
              key={emoji}
              onClick={() => {
                handleReaction(emoji);
                setShowReactionPicker(false);
              }}
              className={`text-2xl hover:scale-110 transition-transform ${
                userReactions[type] ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}