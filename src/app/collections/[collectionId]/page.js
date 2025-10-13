'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getCollectionById, 
  getCollectionMemories, 
  getUserMemories,
  addMemoryToCollection,
  removeMemoryFromCollection
} from '@/lib/database';
import { motion } from 'framer-motion';
import Image from 'next/image';
import MemoryCard from '@/components/MemoryCard';

export default function CollectionPage({ params }) {
  const { collectionId } = params;
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [availableMemories, setAvailableMemories] = useState([]);
  const [selectedMemories, setSelectedMemories] = useState([]);

  useEffect(() => {
    fetchCollectionData();
  }, [user, collectionId]);

  const fetchCollectionData = async () => {
    if (!user || !collectionId) return;

    try {
      const collectionData = await getCollectionById(collectionId);
      
      if (!collectionData) {
        setLoading(false);
        return;
      }

      setCollection(collectionData);

      const memoriesData = await getCollectionMemories(collectionId);
      setMemories(memoriesData.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMemories = async () => {
    if (!user) return;

    try {
      const allMemories = await getUserMemories(user.uid, {
        orderBy: { field: 'date', ascending: false }
      });
      
      const currentMemoryIds = memories.map(m => m.id);
      const availableMems = allMemories.filter(mem => !currentMemoryIds.includes(mem.id));
      
      setAvailableMemories(availableMems);
    } catch (error) {
      console.error('Error fetching available memories:', error);
    }
  };

  const handleAddMemories = async () => {
    if (!user || !collectionId || selectedMemories.length === 0) return;

    try {
      for (const memoryId of selectedMemories) {
        await addMemoryToCollection(collectionId, memoryId);
      }

      setShowAddMemory(false);
      setSelectedMemories([]);
      fetchCollectionData();
    } catch (error) {
      console.error('Error adding memories to collection:', error);
    }
  };

  const handleRemoveMemory = async (memoryId) => {
    if (!user || !collectionId) return;

    try {
      await removeMemoryFromCollection(collectionId, memoryId);
      fetchCollectionData();
    } catch (error) {
      console.error('Error removing memory from collection:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Collection not found</h2>
        <p className="text-gray-600">This collection might have been deleted or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
            <p className="text-gray-600">{collection.description}</p>
          </div>
          <button
            onClick={() => {
              setShowAddMemory(true);
              fetchAvailableMemories();
            }}
            className="btn-primary"
          >
            Add Memories
          </button>
        </div>

        {collection.cover_image && (
          <div className="relative h-64 rounded-lg overflow-hidden">
            <Image
              src={collection.cover_image}
              alt={collection.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No memories in this collection yet</p>
          <button
            onClick={() => {
              setShowAddMemory(true);
              fetchAvailableMemories();
            }}
            className="btn-primary"
          >
            Add Your First Memory
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-pastel-blue -z-10" />
          
          {memories.map((memory, index) => (
            <div key={memory.id} className="relative">
              <MemoryCard memory={memory} index={index} />
              <button
                onClick={() => handleRemoveMemory(memory.id)}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-semibold mb-4">Add Memories to Collection</h2>
            
            {availableMemories.length === 0 ? (
              <p className="text-gray-600 py-8 text-center">
                All your memories are already in this collection!
              </p>
            ) : (
              <div className="space-y-2 mb-6">
                {availableMemories.map(memory => (
                  <label
                    key={memory.id}
                    className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemories.includes(memory.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMemories(prev => [...prev, memory.id]);
                        } else {
                          setSelectedMemories(prev => prev.filter(id => id !== memory.id));
                        }
                      }}
                      className="h-4 w-4"
                    />
                    {memory.media_url && (
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={memory.media_url}
                          alt={memory.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{memory.title}</h3>
                      <p className="text-sm text-gray-600">{memory.date}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddMemory(false);
                  setSelectedMemories([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemories}
                disabled={selectedMemories.length === 0}
                className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Selected ({selectedMemories.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
