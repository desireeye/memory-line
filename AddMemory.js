// AddMemory.js
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function AddMemory() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !date) {
      alert("Title, date and media file are required");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `memories/${currentUser.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        alert("Upload failed: " + error.message);
        setUploading(false);
      },
      async () => {
        const mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await addDoc(collection(db, "memories"), {
            userId: currentUser.uid,
            title,
            story,
            date,
            mediaUrl,
            type: file.type.startsWith("video") ? "video" : "image",
            tags: tags.split(",").map((tag) => tag.trim()),
            createdAt: serverTimestamp(),
          });
          setUploading(false);
          navigate("/my-memories");
        } catch (err) {
          alert("Error saving memory: " + err.message);
          setUploading(false);
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Add New Memory</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Story / Description"
          className="w-full p-2 border rounded"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={4}
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full p-2 border rounded"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Add Memory"}
        </button>
      </form>
    </div>
  );
}
