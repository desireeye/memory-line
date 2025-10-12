'use client';

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DebugUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setStatus(`File selected: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('Starting upload...');

    try {
      // Check Firebase services
      console.log('Firebase services:', { storage: !!storage, db: !!db });
      
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }

      // Create a simple test file
      const fileName = `test-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `test-uploads/${fileName}`);
      
      setStatus('Uploading to Firebase Storage...');
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setStatus(`Uploading... ${progress.toFixed(1)}%`);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          () => {
            setStatus('Upload completed! Getting download URL...');
            resolve();
          }
        );
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      setStatus(`Upload successful! URL: ${downloadURL}`);

      // Save to Firestore
      if (db) {
        await addDoc(collection(db, 'test-uploads'), {
          fileName,
          downloadURL,
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: serverTimestamp(),
        });
        setStatus(`Upload successful! File saved to Firestore. URL: ${downloadURL}`);
      }

    } catch (err) {
      console.error('Upload failed:', err);
      setError(`Upload failed: ${err.message}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Debug Upload Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <button
            onClick={handleUpload}
            disabled={isLoading || !file}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Upload Test File'}
          </button>
        </div>

        {status && (
          <div className="p-3 bg-blue-100 text-blue-700 rounded">
            {status}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Storage: {storage ? '✅ Initialized' : '❌ Not initialized'}</p>
          <p>Database: {db ? '✅ Initialized' : '❌ Not initialized'}</p>
          <p>File selected: {file ? `✅ ${file.name}` : '❌ No file'}</p>
        </div>
      </div>
    </div>
  );
}