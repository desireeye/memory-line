'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { createMemory } from '@/lib/database';
import Image from 'next/image';
import { compressImage } from '@/utils/imageCompression';
import UploadStatus from '@/components/UploadStatus';

export default function AddMemory() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    isPrivate: false,
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, message: '', progress: 0 });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (isLoading || isProcessing) {
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setUploadStatus({ show: true, message: 'Starting upload process...', progress: 0 });
    
    try {
      let mediaUrl = '';
      if (mediaFile) {
        try {
          console.log('Starting file upload process...');
          const fileToUpload = mediaFile.type.startsWith('image/')
            ? await compressImage(mediaFile)
            : mediaFile;
          
          const fileName = `${Date.now()}_${mediaFile.name}`;
          const filePath = `${user.uid}/${fileName}`;
          
          const { data, error } = await supabase.storage
            .from('memories')
            .upload(filePath, fileToUpload);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('memories')
            .getPublicUrl(filePath);

          mediaUrl = publicUrl;
          console.log('File URL obtained:', mediaUrl);
        } catch (uploadError) {
          console.error('Error during file upload:', uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      }

      const memoryData = {
        user_id: user.uid,
        title: formData.title,
        story: formData.story,
        date: formData.date,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        media_url: mediaUrl,
        type: mediaFile ? mediaFile.type.split('/')[0] : '',
        is_private: formData.isPrivate,
      };

      await createMemory(memoryData);
      router.push('/memories');
    } catch (error) {
      console.error('Error adding memory:', error);
      let errorMessage = 'Failed to add memory. ';
      if (error.message.includes('File upload failed')) {
        errorMessage += 'There was a problem uploading your file. Please try again.';
      } else if (error.message?.includes('storage')) {
        errorMessage += 'Storage error: ' + error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
      setTimeout(() => {
        setUploadStatus({ show: false, message: '', progress: 0 });
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Add New Memory</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo/Video
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
          {uploadStatus.show && (
            <UploadStatus message={uploadStatus.message} progress={uploadStatus.progress} />
          )}
          {previewUrl && (
            <div className="mt-2 relative h-48 w-full">
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full mb-2"></div>
                    <div>Optimizing image...</div>
                    <div className="text-sm opacity-75">(Large images may take a moment)</div>
                  </div>
                </div>
              )}
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story
          </label>
          <textarea
            name="story"
            value={formData.story}
            onChange={handleInputChange}
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="family, vacation, birthday"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
            className="mr-2"
          />
          <label className="text-sm text-gray-700">Make this memory private</label>
        </div>

        <button
          type="submit"
          disabled={isLoading || isProcessing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding Memory...' : 'Add Memory'}
        </button>
      </form>
    </div>
  );
}
