'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { compressImage } from '@/utils/imageCompression';

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      // Create preview URL for images
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

    setIsLoading(true);
    setIsProcessing(true);
    try {
      let mediaUrl = '';
      if (mediaFile) {
        try {
          console.log('Starting file upload process...');
          // Compress image if it's an image file
          const fileToUpload = mediaFile.type.startsWith('image/')
            ? await compressImage(mediaFile)
            : mediaFile;
          
          console.log('File prepared for upload:', {
            name: mediaFile.name,
            type: mediaFile.type,
            size: fileToUpload.size
          });

          // Upload media to Firebase Storage
          const fileName = `${Date.now()}_${mediaFile.name}`;
          const storagePath = `memories/${user.uid}/${fileName}`;
          console.log('Uploading to path:', storagePath);
          
          const storageRef = ref(storage, storagePath);
          
          // Create upload task
          const uploadTask = uploadBytes(storageRef, fileToUpload);
          
          // Handle upload state
          uploadTask.then((snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress:', progress.toFixed(2) + '%');
          });
          
          const uploadResult = await uploadTask;
          console.log('Upload completed:', uploadResult);
          
          mediaUrl = await getDownloadURL(storageRef);
          console.log('File URL obtained:', mediaUrl);
        } catch (uploadError) {
          console.error('Error during file upload:', uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      }

      // Add memory to Firestore
      const memoryData = {
        userId: user.uid,
        title: formData.title,
        story: formData.story,
        date: formData.date,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        mediaUrl,
        type: mediaFile ? mediaFile.type.split('/')[0] : '',
        createdAt: serverTimestamp(),
        isPrivate: formData.isPrivate,
      };

      await addDoc(collection(db, 'memories'), memoryData);
      router.push('/memories');
    } catch (error) {
      console.error('Error adding memory:', error);
      let errorMessage = 'Failed to add memory. ';
      if (error.message.includes('File upload failed')) {
        errorMessage += 'There was a problem uploading your file. Please try again.';
      } else if (error.code?.includes('storage/')) {
        errorMessage += 'Storage error: ' + error.message;
      } else if (error.code?.includes('permission-denied')) {
        errorMessage += 'You don\'t have permission to upload files.';
      } else {
        errorMessage += 'Please try again.';
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
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
                className="object-contain rounded-md"
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
            placeholder="Give your memory a title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Story
          </label>
          <textarea
            name="story"
            value={formData.story}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="Write about this memory..."
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
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="Add tags separated by commas (e.g., family, vacation, beach)"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrivate"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
            Make this memory private (only visible to you)
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Uploading...' : 'Save Memory'}
        </button>
      </form>
    </div>
  );
}