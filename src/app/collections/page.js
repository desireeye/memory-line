'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getUserCollections, createCollection } from '@/lib/database';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Collections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    is_private: false,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    if (!user) return;

    try {
      const collectionsData = await getUserCollections(user.uid);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      let coverUrl = '';
      if (coverImage) {
        const filePath = `${user.uid}/${Date.now()}_${coverImage.name}`;
        const { data, error } = await supabase.storage
          .from('collections')
          .upload(filePath, coverImage);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('collections')
          .getPublicUrl(filePath);

        coverUrl = publicUrl;
      }

      await createCollection({
        user_id: user.uid,
        name: newCollection.name,
        description: newCollection.description,
        cover_image: coverUrl,
        is_private: newCollection.is_private,
      });

      setNewCollection({ name: '', description: '', is_private: false });
      setCoverImage(null);
      setPreviewUrl(null);
      setShowCreateModal(false);
      fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Collections</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          Create Collection
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="p-4 bg-white rounded-b-lg shadow">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              href={`/collections/${collection.id}`}
              key={collection.id}
              className="block group"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  {collection.cover_image ? (
                    <Image
                      src={collection.cover_image}
                      alt={collection.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-pastel-blue flex items-center justify-center">
                      <span className="text-4xl">📸</span>
                    </div>
                  )}
                  {collection.is_private && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                      Private
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-pastel-blue transition-colors">
                    {collection.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {collection.description}
                  </p>
                  <div className="text-sm text-gray-500">
                    {collection.collection_memories?.length || 0} memories
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📸</div>
          <h2 className="text-2xl font-semibold mb-2">No Collections Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first collection to organize your memories!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Your First Collection
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">Create New Collection</h2>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border rounded-md p-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
                {previewUrl && (
                  <div className="mt-2 relative h-32 w-full">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={newCollection.is_private}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, is_private: e.target.checked }))}
                  className="h-4 w-4 text-pastel-blue focus:ring-pastel-blue border-gray-300 rounded"
                />
                <label htmlFor="is_private" className="text-sm text-gray-700">
                  Make this collection private
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Collection
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
