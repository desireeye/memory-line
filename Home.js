// Home.js
import React from "react";
import { useAuth } from "./AuthContext";
import { signInWithGoogle, logout } from "./firebase";
import { Link } from "react-router-dom";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pastel-pink p-6">
      <h1 className="text-4xl font-bold mb-6">Memory Line</h1>
      {currentUser ? (
        <>
          <div className="mb-4">Hello, {currentUser.displayName || currentUser.email}!</div>
          <div className="space-x-4">
            <Link to="/my-memories" className="btn-primary">
              My Memories
            </Link>
            <Link to="/add-memory" className="btn-primary">
              Add Memory
            </Link>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </>
      ) : (
        <button onClick={signInWithGoogle} className="btn-primary">
          Sign in with Google
        </button>
      )}
    </div>
  );
}
