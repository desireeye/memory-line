// MyMemories.js
import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Link } from "react-router-dom";

export default function MyMemories() {
  const { currentUser } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      const q = query(
        collection(db, "memories"),
        where("userId", "==", currentUser.uid),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMemories(list);
      setLoading(false);
    }
    fetchMemories();
  }, [currentUser]);

  if (loading) return <div>Loading your memories...</div>;
  if (memories.length === 0) return <div>No memories yet. Add one now!</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">My Memories Timeline</h1>
      <Link to="/add-memory" className="btn-primary mb-4 inline-block">
        Add New Memory
      </Link>
      <div className="space-y-6">
        {memories.map(({ id, title, date }) => (
          <div key={id} className="p-4 border rounded shadow-sm bg-white">
            <div className="font-bold text-lg">{title}</div>
            <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
