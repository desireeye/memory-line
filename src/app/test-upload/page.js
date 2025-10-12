'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { compressImage } from '@/utils/imageCompression';

export default function TestUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, message: '', progress: 0 });
  const [uploadError, setUploadError] = useState(null);

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    
    console.log('Starting upload process with file:', {
      name: mediaFile.name,
      type: mediaFile.type,
      size: mediaFile.size,
    });
    
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
          const storagePath = `test-uploads/${fileName}`;
          console.log('Uploading to path:', storagePath);
          
          const storageRef = ref(storage, storagePath);
          
          // Create upload task with resumable upload for better progress tracking
          const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
          
          // Handle upload state with progress tracking
          await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload progress:', progress.toFixed(2) + '%');
                setUploadStatus({ 
                  show: true, 
                  message: `Uploading... ${progress.toFixed(1)}%`, 
                  progress: progress 
                });
              },
              (error) => {
                console.error('Upload error:', error);
                reject(error);
              },
              async () => {
                console.log('Upload completed successfully');
                setUploadStatus({ 
                  show: true, 
                  message: 'Upload completed! Processing...', 
                  progress: 100 
                });
                resolve();
              }
            );
          });
          
          mediaUrl = await getDownloadURL(storageRef);
          console.log('File URL obtained:', mediaUrl);
        } catch (uploadError) {
          console.error('Error during file upload:', uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      }

      // Add memory to Firestore
      const memoryData = {
        title: formData.title,
        story: formData.story,
        date: formData.date,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        mediaUrl,
        type: mediaFile ? mediaFile.type.split('/')[0] : '',
        createdAt: serverTimestamp(),
        testUpload: true, // Mark as test upload
      };

      await addDoc(collection(db, 'test-memories'), memoryData);
      setUploadStatus({ 
        show: true, 
        message: 'Upload completed successfully!', 
        progress: 100 
      });
      
      // Reset form
      setFormData({
        title: '',
        story: '',
        date: new Date().toISOString().split('T')[0],
        tags: '',
      });
      setMediaFile(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Error adding memory:', error);
      let errorMessage = 'Failed to add memory. ';
      
      if (error.message.includes('File upload failed')) {
        errorMessage += 'There was a problem uploading your file. Please try again.';
      } else if (error.code?.includes('storage/')) {
        if (error.code === 'storage/unauthorized') {
          errorMessage += 'You don\'t have permission to upload files. Please check your authentication.';
        } else if (error.code === 'storage/canceled') {
          errorMessage += 'Upload was canceled. Please try again.';
        } else if (error.code === 'storage/unknown') {
          errorMessage += 'An unknown error occurred during upload. Please try again.';
        } else if (error.code === 'storage/invalid-format') {
          errorMessage += 'Invalid file format. Please select a valid image or video file.';
        } else if (error.code === 'storage/invalid-checksum') {
          errorMessage += 'File upload was corrupted. Please try again.';
        } else {
          errorMessage += 'Storage error: ' + error.message;
        }
      } else if (error.code?.includes('permission-denied')) {
        errorMessage += 'You don\'t have permission to upload files.';
      } else if (error.message.includes('quota')) {
        errorMessage += 'Storage quota exceeded. Please contact support.';
      } else if (error.message.includes('network')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += 'Please try again. If the problem persists, contact support.';
      }
      
      setUploadError(errorMessage);
      setUploadStatus({ 
        show: true, 
        message: errorMessage, 
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Test Upload (No Authentication Required)</h1>
      <p className="text-gray-600 mb-6">This page tests the upload functionality without requiring user authentication.</p>

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
            <div className={`mt-2 p-3 rounded ${uploadStatus.message.includes('error') || uploadStatus.message.includes('Error') || uploadStatus.message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
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
                    <div>Processing image...</div>
                  </div>
                </div>
              )}
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-md"
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

        <div className="space-y-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Uploading...' : 'Test Upload'}
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