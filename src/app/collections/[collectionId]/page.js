'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
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
      // Get collection details
      const collectionRef = doc(db, 'collections', collectionId);
      const collectionSnap = await getDoc(collectionRef);
      
      if (!collectionSnap.exists()) {
        setLoading(false);
        return;
      }

      setCollection({ id: collectionSnap.id, ...collectionSnap.data() });

      // Get memories in this collection
      const memoryQuery = query(
        collection(db, 'collection_memories'),
        where('collectionId', '==', collectionId)
      );
      const memorySnapshot = await getDocs(memoryQuery);
      const memoryIds = memorySnapshot.docs.map(doc => doc.data().memoryId);

      // Fetch actual memory data
      const memoriesData = [];
      for (const memoryId of memoryIds) {
        const memoryDoc = await getDoc(doc(db, 'memories', memoryId));
        if (memoryDoc.exists()) {
          memoriesData.push({ id: memoryDoc.id, ...memoryDoc.data() });
        }
      }

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
      // Get all user's memories
      const memoriesRef = collection(db, 'memories');
      const q = query(
        memoriesRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      // Filter out memories already in collection
      const currentMemoryIds = memories.map(m => m.id);
      const availableMems = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(mem => !currentMemoryIds.includes(mem.id));
      
      setAvailableMemories(availableMems);
    } catch (error) {
      console.error('Error fetching available memories:', error);
    }
  };

  const handleAddMemories = async () => {
    if (!user || !collectionId || selectedMemories.length === 0) return;

    try {
      for (const memoryId of selectedMemories) {
        await addDoc(collection(db, 'collection_memories'), {
          collectionId,
          memoryId,
          addedAt: new Date().toISOString(),
        });
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
      const q = query(
        collection(db, 'collection_memories'),
        where('collectionId', '==', collectionId),
        where('memoryId', '==', memoryId)
      );
      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }

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
      {/* Collection Header */}
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
        {collection.coverImage && (
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={collection.coverImage}
              alt={collection.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Memories Grid */}
      {memories.length > 0 ? (
        <div className="space-y-8">
          {memories.map((memory, index) => (
            <div key={memory.id} className="relative group">
              <button
                onClick={() => handleRemoveMemory(memory.id)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                Remove
              </button>
              <MemoryCard memory={memory} index={index} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📸</div>
          <h2 className="text-2xl font-semibold mb-2">No Memories Yet</h2>
          <p className="text-gray-600 mb-6">
            Add some memories to this collection to get started!
          </p>
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
      )}

      {/* Add Memories Modal */}
      {showAddMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Add Memories</h2>
              <button
                onClick={() => setShowAddMemory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {availableMemories.map(memory => (
                <div
                  key={memory.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMemories.includes(memory.id)
                      ? 'border-pastel-blue bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedMemories(prev =>
                      prev.includes(memory.id)
                        ? prev.filter(id => id !== memory.id)
                        : [...prev, memory.id]
                    );
                  }}
                >
                  <div className="flex items-start gap-4">
                    {memory.mediaUrl && (
                      <div className="relative h-20 w-20 flex-shrink-0">
                        {memory.type === 'image' ? (
                          <Image
                            src={memory.mediaUrl}
                            alt={memory.title}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <video
                            src={memory.mediaUrl}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{memory.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {memory.story}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(memory.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddMemory(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemories}
                disabled={selectedMemories.length === 0}
                className={`btn-primary ${
                  selectedMemories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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