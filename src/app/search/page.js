'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserMemories } from '@/lib/database';
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

  useEffect(() => {
    const fetchTags = async () => {
      if (!user) return;
      
      const allMemories = await getUserMemories(user.uid);
      const tags = new Set();
      allMemories.forEach(memory => {
        memory.tags?.forEach(tag => tags.add(tag));
      });
      
      setAvailableTags(Array.from(tags));
    };

    fetchTags();
  }, [user]);

  const handleSearch = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let results = await getUserMemories(user.uid);

      if (dateRange.start && dateRange.end) {
        results = results.filter(memory => 
          memory.date >= dateRange.start && memory.date <= dateRange.end
        );
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(memory => 
          memory.title.toLowerCase().includes(term) ||
          memory.story.toLowerCase().includes(term)
        );
      }

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
        <div>
          <input
            type="text"
            placeholder="Search in titles and stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {availableTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-pastel-blue text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
        </div>
      ) : memories.length > 0 ? (
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pastel-blue -z-10" />
          {memories.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || selectedTags.length > 0 || dateRange.start || dateRange.end
            ? 'No memories found matching your search criteria.'
            : 'Enter search criteria to find memories.'}
        </div>
      )}
    </div>
  );
}
