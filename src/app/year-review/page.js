'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
        const memoriesRef = collection(db, 'memories');
        const q = query(memoriesRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        
        const years = new Set();
        snapshot.docs.forEach(doc => {
          const memory = doc.data();
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
        const memoriesRef = collection(db, 'memories');
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        
        const q = query(
          memoriesRef,
          where('userId', '==', user.uid),
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
        
        const snapshot = await getDocs(q);
        const memories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate statistics
        const stats = {
          totalMemories: memories.length,
          byMonth: Array(12).fill(0),
          topTags: {},
          mostReactedMemory: null,
          photoCount: 0,
          videoCount: 0,
          memories: memories.sort((a, b) => b.date.localeCompare(a.date))
        };

        // Collect reactions for all memories
        const reactionsRef = collection(db, 'reactions');
        const reactionCounts = {};
        
        for (const memory of memories) {
          // Count by month
          const month = parseISO(memory.date).getMonth();
          stats.byMonth[month]++;

          // Count media types
          if (memory.type === 'image') stats.photoCount++;
          if (memory.type === 'video') stats.videoCount++;

          // Count tags
          memory.tags?.forEach(tag => {
            stats.topTags[tag] = (stats.topTags[tag] || 0) + 1;
          });

          // Get reaction count
          const reactionQuery = query(reactionsRef, where('memoryId', '==', memory.id));
          const reactionSnapshot = await getDocs(reactionQuery);
          reactionCounts[memory.id] = reactionSnapshot.size;
        }

        // Find most reacted memory
        const mostReactedId = Object.entries(reactionCounts)
          .sort(([, a], [, b]) => b - a)[0]?.[0];
        
        stats.mostReactedMemory = memories.find(m => m.id === mostReactedId);

        // Sort tags by frequency
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

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Year in Review</h1>

      {/* Year Selector */}
      <div className="flex justify-center gap-2 mb-8">
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-full ${
              year === selectedYear
                ? 'bg-pastel-blue text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
        </div>
      ) : yearStats ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-pastel-blue mb-2">
                {yearStats.totalMemories}
              </div>
              <div className="text-gray-600">Total Memories</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-pastel-blue mb-2">
                {yearStats.photoCount}
              </div>
              <div className="text-gray-600">Photos</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-pastel-blue mb-2">
                {yearStats.videoCount}
              </div>
              <div className="text-gray-600">Videos</div>
            </div>
          </div>

          {/* Monthly Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Memory Distribution</h2>
            <div className="flex items-end h-40 gap-2">
              {yearStats.byMonth.map((count, index) => {
                const height = count ? (count / Math.max(...yearStats.byMonth)) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-pastel-blue rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs mt-2">
                      {format(new Date(selectedYear, index), 'MMM')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Tags */}
          {Object.keys(yearStats.topTags).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Top Tags</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(yearStats.topTags).map(([tag, count]) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-pastel-pink rounded-full text-sm"
                  >
                    {tag} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Most Reacted Memory */}
          {yearStats.mostReactedMemory && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Most Reacted Memory</h2>
              <div className="space-y-4">
                {yearStats.mostReactedMemory.mediaUrl && (
                  <div className="relative h-64 w-full">
                    {yearStats.mostReactedMemory.type === 'image' ? (
                      <Image
                        src={yearStats.mostReactedMemory.mediaUrl}
                        alt={yearStats.mostReactedMemory.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={yearStats.mostReactedMemory.mediaUrl}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
                <h3 className="text-lg font-semibold">
                  {yearStats.mostReactedMemory.title}
                </h3>
                <p className="text-gray-600">
                  {yearStats.mostReactedMemory.story}
                </p>
                <div className="text-sm text-gray-500">
                  {format(parseISO(yearStats.mostReactedMemory.date), 'MMMM d, yyyy')}
                </div>
              </div>
            </div>
          )}

          {/* Memory Timeline */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Memory Timeline</h2>
            <div className="space-y-4">
              {yearStats.memories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {memory.mediaUrl && (
                    <div className="relative h-20 w-20 flex-shrink-0">
                      {memory.type === 'image' ? (
                        <Image
                          src={memory.mediaUrl}
                          alt={memory.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={memory.mediaUrl}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{memory.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{memory.story}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(parseISO(memory.date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No memories found for {selectedYear}
        </div>
      )}
    </div>
  );
}