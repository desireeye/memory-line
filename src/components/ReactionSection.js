'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
// TODO: Replace with Supabase imports
// import { supabase } from '@/lib/supabase';

const REACTIONS = {
  '❤️': 'heart',
  '👍': 'thumbsup',
  '🎉': 'celebrate',
  '😊': 'smile',
  '🤗': 'hug',
};

export default function ReactionSection({ memoryId }) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  useEffect(() => {
    if (!memoryId) return;

    // TODO: Replace with Supabase real-time subscription
    // const subscription = supabase
    //   .channel('reactions')
    //   .on('postgres_changes', 
    //     { event: '*', schema: 'public', table: 'reactions', filter: `memory_id=eq.${memoryId}` },
    //     (payload) => {
    //       // Handle real-time updates
    //     }
    //   )
    //   .subscribe();

    // For now, set empty state
    setReactions({});
    setUserReactions({});

    // return () => subscription.unsubscribe();
  }, [memoryId, user]);

  const handleReaction = async (emoji) => {
    if (!user) return;

    try {
      const reactionType = REACTIONS[emoji];
      const existingReactionId = userReactions[reactionType];

      // TODO: Replace with Supabase operations
      if (existingReactionId) {
        // Remove reaction
        // await supabase.from('reactions').delete().eq('id', existingReactionId);
        console.log('Remove reaction:', existingReactionId);
      } else {
        // Add reaction
        // await supabase.from('reactions').insert({
        //   memory_id: memoryId,
        //   user_id: user.uid,
        //   user_name: user.displayName,
        //   type: reactionType,
        //   emoji,
        //   created_at: new Date().toISOString(),
        // });
        console.log('Add reaction:', { memoryId, reactionType, emoji });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span className="text-xl">😊</span>
          <span className="ml-1 text-sm">React</span>
        </button>

        {showReactionPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 flex gap-2 border">
            {Object.entries(REACTIONS).map(([emoji, type]) => (
              <button
                key={type}
                onClick={() => {
                  handleReaction(emoji);
                  setShowReactionPicker(false);
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {Object.entries(reactions).map(([type, count]) => (
          <div
            key={type}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
              userReactions[type] ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            <span>{Object.entries(REACTIONS).find(([_, t]) => t === type)?.[0]}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}