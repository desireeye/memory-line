'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    profilePhoto: '',
    isPublic: false,
    customUrl: '',
  });
  const [memoryStats, setMemoryStats] = useState({
    total: 0,
    thisMonth: 0,
    thisYear: 0,
  });
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.uid)
          .single();
        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setProfileData({
            name: data.name || '',
            bio: data.bio || '',
            profilePhoto: data.profile_photo || '',
            isPublic: data.is_public || false,
            customUrl: data.custom_url || '',
          });
        } else {
          // Create default profile if it doesn't exist
          const defaultProfile = {
            id: user.uid,
            name: user.displayName || '',
            bio: '',
            profile_photo: user.photoURL || '',
            is_public: false,
            custom_url: '',
          };
          const { error: upsertErr } = await supabase.from('users').upsert(defaultProfile);
          if (upsertErr) throw upsertErr;
          setProfileData({
            name: defaultProfile.name,
            bio: '',
            profilePhoto: defaultProfile.profile_photo,
            isPublic: false,
            customUrl: '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePhoto(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      let photoUrl = profileData.profilePhoto;

      if (newProfilePhoto) {
        const storagePath = `${user.uid}/${Date.now()}_${newProfilePhoto.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('profiles')
          .upload(storagePath, newProfilePhoto, { contentType: newProfilePhoto.type, upsert: false });
        if (uploadErr) throw uploadErr;
        const { data } = supabase.storage.from('profiles').getPublicUrl(storagePath);
        photoUrl = data?.publicUrl || '';
      }

      const { error: updateErr } = await supabase.from('users').upsert({
        id: user.uid,
        name: profileData.name,
        bio: profileData.bio,
        profile_photo: photoUrl,
        is_public: profileData.isPublic,
        custom_url: profileData.customUrl,
      });
      if (updateErr) throw updateErr;

      setProfileData(prev => ({
        ...prev,
        profilePhoto: photoUrl,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-start gap-8">
          {/* Profile Photo */}
          <div className="relative">
            <div className="relative h-32 w-32 rounded-full overflow-hidden">
              <Image
                src={profileData.profilePhoto || '/default-avatar.png'}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-2 w-full text-sm"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={profileData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-pastel-blue"
                  />
                  <label className="text-sm text-gray-700">Make profile public</label>
                </div>

                {profileData.isPublic && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Custom URL</label>
                    <input
                      type="text"
                      name="customUrl"
                      value={profileData.customUrl}
                      onChange={handleInputChange}
                      placeholder="your-custom-url"
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{profileData.name}</h1>
                    <p className="text-gray-600 mt-2">{profileData.bio || 'No bio yet'}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                  >
                    Edit Profile
                  </button>
                </div>

                {profileData.isPublic && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-2">Public Profile URL</h3>
                    <p className="text-sm text-gray-600">
                      {`${window.location.origin}/${profileData.customUrl || user.uid}`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-pastel-pink bg-opacity-20 p-4 rounded-lg text-center">
            <h3 className="text-2xl font-bold">{memoryStats.total}</h3>
            <p className="text-sm text-gray-600">Total Memories</p>
          </div>
          <div className="bg-pastel-blue bg-opacity-20 p-4 rounded-lg text-center">
            <h3 className="text-2xl font-bold">{memoryStats.thisMonth}</h3>
            <p className="text-sm text-gray-600">This Month</p>
          </div>
          <div className="bg-pastel-pink bg-opacity-20 p-4 rounded-lg text-center">
            <h3 className="text-2xl font-bold">{memoryStats.thisYear}</h3>
            <p className="text-sm text-gray-600">This Year</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}