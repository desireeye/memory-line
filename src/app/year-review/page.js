'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getMemoriesByDateRange, getUserMemories, getMemoryReactions } from '@/lib/database';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format, getYear, parseISO } from 'date-fns';

export default function YearInReview() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearStats, setYearStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      if (!user) return;

      try {
        const allMemories = await getUserMemories(user.uid);
        
        const years = new Set();
        allMemories.forEach(memory => {
          const year = getYear(parseISO(memory.date));
          years.add(year);
        });

        setAvailableYears(Array.from(years).sort((a, b) => b - a));
        if (years.size > 0 && !years.has(selectedYear)) {
          setSelectedYear(Math.max(...years));
        }
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };

    fetchAvailableYears();
  }, [user]);

  useEffect(() => {
    const fetchYearStats = async () => {
      if (!user || !selectedYear) return;
      
      setLoading(true);
      try {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        
        const memories = await getMemoriesByDateRange(user.uid, startDate, endDate);

        const stats = {
          totalMemories: memories.length,
          byMonth: Array(12).fill(0),
          topTags: {},
          mostReactedMemory: null,
          photoCount: 0,
          videoCount: 0,
          memories: memories.sort((a, b) => b.date.localeCompare(a.date))
        };

        const reactionCounts = {};
        
        for (const memory of memories) {
          const month = parseISO(memory.date).getMonth();
          stats.byMonth[month]++;

          if (memory.type === 'image') stats.photoCount++;
          if (memory.type === 'video') stats.videoCount++;

          memory.tags?.forEach(tag => {
            stats.topTags[tag] = (stats.topTags[tag] || 0) + 1;
          });

          const reactions = await getMemoryReactions(memory.id);
          reactionCounts[memory.id] = reactions.length;
        }

        const mostReactedId = Object.entries(reactionCounts)
          .sort(([, a], [, b]) => b - a)[0]?.[0];
        
        stats.mostReactedMemory = memories.find(m => m.id === mostReactedId);

        stats.topTags = Object.entries(stats.topTags)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .reduce((obj, [key, value]) => ({...obj, [key]: value}), {});

        setYearStats(stats);
      } catch (error) {
        console.error('Error fetching year stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYearStats();
  }, [user, selectedYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  if (!yearStats || yearStats.totalMemories === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Year in Review</h1>
        <p className="text-gray-600">No memories found for {selectedYear}</p>
        {availableYears.length > 0 && (
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border rounded-md"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your {selectedYear} in Review</h1>
        {availableYears.length > 0 && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border rounded-md"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-pastel-blue bg-opacity-20 p-6 rounded-lg text-center"
        >
          <h3 className="text-4xl font-bold mb-2">{yearStats.totalMemories}</h3>
          <p className="text-gray-700">Memories Created</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-pastel-pink bg-opacity-20 p-6 rounded-lg text-center"
        >
          <h3 className="text-4xl font-bold mb-2">{yearStats.photoCount}</h3>
          <p className="text-gray-700">Photos Shared</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-pastel-blue bg-opacity-20 p-6 rounded-lg text-center"
        >
          <h3 className="text-4xl font-bold mb-2">{yearStats.videoCount}</h3>
          <p className="text-gray-700">Videos Captured</p>
        </motion.div>
      </div>

      {Object.keys(yearStats.topTags).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Top Tags</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(yearStats.topTags).map(([tag, count]) => (
              <span
                key={tag}
                className="px-4 py-2 bg-pastel-blue bg-opacity-20 rounded-full text-sm"
              >
                {tag} ({count})
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {yearStats.mostReactedMemory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Most Loved Memory</h2>
          <div className="flex gap-4">
            {yearStats.mostReactedMemory.media_url && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={yearStats.mostReactedMemory.media_url}
                  alt={yearStats.mostReactedMemory.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold mb-2">{yearStats.mostReactedMemory.title}</h3>
              <p className="text-gray-600">{yearStats.mostReactedMemory.story}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
