'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import MemoryCard from '@/components/MemoryCard';

export default function SearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  // Fetch all available tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('memories')
        .select('tags')
        .eq('user_id', user.uid);
      if (error) return;

      const tags = new Set();
      (data || []).forEach(row => {
        (row.tags || []).forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));
    };

    fetchTags();
  }, [user]);

  const handleSearch = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.uid);

      if (dateRange.start && dateRange.end) {
        queryBuilder = queryBuilder
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      // Filter results client-side for text search and tags
      let results = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        story: row.story,
        date: row.date,
        tags: row.tags || [],
        mediaUrl: row.media_url || '',
        type: row.type || '',
        isPrivate: row.is_private || false,
      }));

      // Apply text search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(memory => 
          memory.title.toLowerCase().includes(term) ||
          memory.story.toLowerCase().includes(term)
        );
      }

      // Apply tags filter
      if (selectedTags.length > 0) {
        results = results.filter(memory =>
          selectedTags.every(tag => memory.tags?.includes(tag))
        );
      }

      setMemories(results);
    } catch (error) {
      console.error('Error searching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when filters change
  useEffect(() => {
    if (searchTerm || selectedTags.length > 0 || dateRange.start || dateRange.end) {
      handleSearch();
    }
  }, [searchTerm, selectedTags, dateRange]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Memories</h1>

      <div className="space-y-4 mb-8">
        {/* Text Search */}
        <div>
          <input
            type="text"
            placeholder="Search in titles and stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Date Range */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-pastel-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
        </div>
      ) : memories.length > 0 ? (
        <div className="space-y-6">
          {memories.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || selectedTags.length > 0 || dateRange.start || dateRange.end ? (
            'No memories found matching your search criteria'
          ) : (
            'Start searching by entering text, selecting tags, or choosing dates'
          )}
        </div>
      )}
    </div>
  );
}