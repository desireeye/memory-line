'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function CommentSection({ memoryId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memoryId) {
      fetchComments();
    }
  }, [memoryId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      // For now, return empty comments
      // You can implement comments API later
      setComments([]);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;

    try {
      // For now, just add to local state
      // You can implement comment creation API later
      const comment = {
        id: Date.now(),
        text: newComment,
        author: session.user.name || session.user.email,
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full border border-gray-300 rounded-md p-2 mb-2"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm mb-4">
          Please sign in to add comments.
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">{comment.author}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}