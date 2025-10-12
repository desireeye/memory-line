'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserMemories } from '@/lib/database';
import { motion } from 'framer-motion';
import MemoryCard from '@/components/MemoryCard';

export default function MemoriesPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      if (!user) return;

      try {
        const memoriesData = await getUserMemories(user.uid);
        setMemories(memoriesData);
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No memories yet</h2>
        <p className="text-gray-600 mb-6">Start adding some memories to see them here!</p>
        <a href="/add-memory" className="btn-primary inline-block">
          Add Your First Memory
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <h1 className="text-3xl font-bold text-center mb-12">Your Memory Timeline</h1>
        
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pastel-blue -z-10" />
          
          {memories.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
