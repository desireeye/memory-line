'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

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

    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('memoryId', memoryId);
      if (error) return;
      const reactionCounts = {};
      const userReacts = {};
      (data || []).forEach((r) => {
        reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
        if (r.userId === user?.uid) userReacts[r.type] = r.id;
      });
      setReactions(reactionCounts);
      setUserReactions(userReacts);
    };
    fetchReactions();

    const channel = supabase
      .channel(`reactions-${memoryId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions', filter: `memoryId=eq.${memoryId}` },
        () => fetchReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memoryId, user]);

  const handleReaction = async (emoji) => {
    if (!user) return;

    try {
      const reactionType = REACTIONS[emoji];
      const existingReactionId = userReactions[reactionType];

      if (existingReactionId) {
        const { error } = await supabase.from('reactions').delete().eq('id', existingReactionId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('reactions').insert([
          {
            memoryId,
            userId: user.uid,
            userName: user.displayName,
            type: reactionType,
            emoji,
            createdAt: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
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