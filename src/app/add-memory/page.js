'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function AddMemory() {
  const { data: session, status } = useSession();
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
  const [uploadError, setUploadError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image or video file (JPEG, PNG, GIF, WebP, MP4, WebM, QuickTime)');
        e.target.value = '';
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('File size must be less than 50MB');
        e.target.value = '';
        return;
      }

      setMediaFile(file);
      setUploadError(null);
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user) {
      alert('Please sign in to add memories');
      return;
    }

    if (isLoading || isProcessing) {
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a title for your memory');
      return;
    }

    if (!formData.date) {
      alert('Please select a date for your memory');
      return;
    }

    if (!mediaFile) {
      alert('Please select a photo or video to upload');
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setUploadError(null);
    setUploadStatus({ show: true, message: 'Starting upload process...', progress: 0 });
    
    try {
      // Step 1: Upload file to Cloudinary
      setUploadStatus({ show: true, message: 'Uploading file to Cloudinary...', progress: 20 });
      
      const formData_upload = new FormData();
      formData_upload.append('file', mediaFile);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData_upload,
      });
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      setUploadStatus({ show: true, message: 'File uploaded! Saving memory...', progress: 80 });
      
      // Step 2: Save memory to database
      const memoryData = {
        userId: session.user.id,
        title: formData.title,
        story: formData.story,
        date: formData.date,
        mediaUrl: uploadResult.url,
        mediaPublicId: uploadResult.publicId,
        mediaType: uploadResult.format.startsWith('video') ? 'video' : 'image',
        mediaWidth: uploadResult.width,
        mediaHeight: uploadResult.height,
        mediaDuration: uploadResult.duration,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPrivate: formData.isPrivate,
      };
      
      const memoryResponse = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoryData),
      });
      
      const memoryResult = await memoryResponse.json();
      
      if (!memoryResult.success) {
        throw new Error(memoryResult.error || 'Failed to save memory');
      }
      
      setUploadStatus({ show: true, message: 'Memory saved successfully!', progress: 100 });
      
      // Reset form
      setFormData({
        title: '',
        story: '',
        date: new Date().toISOString().split('T')[0],
        tags: '',
        isPrivate: false,
      });
      setMediaFile(null);
      setPreviewUrl(null);
      
      // Redirect to memories page after a short delay
      setTimeout(() => {
        router.push('/memories');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding memory:', error);
      setUploadError(error.message);
      setUploadStatus({ 
        show: true, 
        message: `Error: ${error.message}`, 
        progress: 0 
      });
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

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
            <div className={`mt-2 p-3 rounded ${
              uploadStatus.message.includes('Error') || uploadStatus.message.includes('failed') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <div>{uploadStatus.message}</div>
              {uploadStatus.progress > 0 && (
                <div className="w-full h-2 bg-gray-200 rounded mt-2">
                  <div 
                    className="h-full bg-blue-500 rounded transition-all duration-300" 
                    style={{ width: `${Math.min(uploadStatus.progress, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
          {previewUrl && (
            <div className="mt-2 relative h-48 w-full">
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full mb-2"></div>
                    <div>Processing...</div>
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
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
            Make this memory private (only visible to you)
          </label>
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Saving Memory...' : 'Save Memory'}
          </button>
          
          {uploadError && (
            <div className="text-center">
              <p className="text-red-600 text-sm mb-2">{uploadError}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}