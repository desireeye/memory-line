'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import MemoryCard from '@/components/MemoryCard';
import { useAuth } from '@/hooks/useAuth';

export default function PublicTimeline({ params }) {
  const { username } = params;
  const [user, setUser] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAndMemories = async () => {
      try {
        // First, find the user by their custom URL or UID
        const { data: byUrl, error: userErr1 } = await supabase
          .from('users')
          .select('*')
          .eq('custom_url', username)
          .limit(1);
        if (userErr1) throw userErr1;

        let foundUser = byUrl?.[0];
        if (!foundUser) {
          const { data: byId, error: userErr2 } = await supabase
            .from('users')
            .select('*')
            .eq('id', username)
            .limit(1);
          if (userErr2) throw userErr2;
          foundUser = byId?.[0];
        }

        if (!foundUser) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          bio: foundUser.bio,
          profilePhoto: foundUser.profile_photo,
          isPublic: foundUser.is_public,
        };

        // Check if profile is public
        if (!userData.isPublic) {
          setError('This profile is private');
          setLoading(false);
          return;
        }

        setUser(userData);

        // Fetch the user's public memories
        const { data: mems, error: memErr } = await supabase
          .from('memories')
          .select('*')
          .eq('user_id', userData.id)
          .eq('is_private', false)
          .order('date', { ascending: false });
        if (memErr) throw memErr;
        const memoriesData = (mems || []).map((row) => ({
          id: row.id,
          title: row.title,
          story: row.story,
          date: row.date,
          tags: row.tags || [],
          mediaUrl: row.media_url || '',
          type: row.type || '',
          isPrivate: row.is_private || false,
        }));

        setMemories(memoriesData);
      } catch (error) {
        console.error('Error fetching timeline:', error);
        setError('Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMemories();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{error}</h1>
        <p className="text-gray-600">
          {error === 'User not found' 
            ? 'The user you\'re looking for doesn\'t exist.'
            : 'This user\'s memories are set to private.'}
        </p>
        <a href="/" className="btn-primary inline-block mt-6">
          Go Home
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* User Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        {user.profilePhoto && (
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
        {user.bio && (
          <p className="text-gray-600 max-w-xl mx-auto">{user.bio}</p>
        )}
      </motion.div>

      {/* Memories Timeline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <h2 className="text-2xl font-bold text-center mb-8">Memory Timeline</h2>
        
        {memories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No memories shared yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pastel-blue -z-10" />
            
            {/* Memory cards */}
            {memories.map((memory, index) => (
              <MemoryCard key={memory.id} memory={memory} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}