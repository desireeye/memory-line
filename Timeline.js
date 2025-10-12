// Timeline.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { motion } from "framer-motion";

export default function Timeline() {
  const { username } = useParams();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserMemories() {
      // Fetch userId for the given username from 'users' collection
      const usersQuery = query(collection(db, "users"), where("name", "==", username));
      const userSnap = await getDocs(usersQuery);
      if (userSnap.empty) {
        setMemories([]);
        setLoading(false);
        return;
      }
      const userId = userSnap.docs[0].data().userId;

      const memoriesRef = collection(db, "memories");
      const q = query(memoriesRef, where("userId", "==", userId), orderBy("date", "desc"));
      const memoriesSnap = await getDocs(q);
      const memoriesList = memoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMemories(memoriesList);
      setLoading(false);
    }
    fetchUserMemories();
  }, [username]);

  if (loading) return <div>Loading timeline...</div>;
  if (memories.length === 0) return <div>No memories found for {username}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">{username}'s Memory Line</h1>
      <div className="space-y-8">
        {memories.map(({ id, title, story, date, mediaUrl, type }) => (
          <motion.div
            key={id}
            className="flex flex-col md:flex-row md:space-x-6 items-center bg-white rounded-lg p-4 shadow-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full md:w-48 mb-4 md:mb-0">
              {type === "image" ? (
                <img src={mediaUrl} alt={title} className="rounded-lg object-cover w-full h-36" />
              ) : (
                <video controls className="rounded-lg w-full h-36">
                  <source src={mediaUrl} />
                </video>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-1 text-gray-700 whitespace-pre-line">{story}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
