'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
// TODO: Replace with Supabase imports
// import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function CommentSection({ memoryId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!memoryId) return;

    // TODO: Replace with Supabase real-time subscription
    // const subscription = supabase
    //   .channel('comments')
    //   .on('postgres_changes', 
    //     { event: '*', schema: 'public', table: 'comments', filter: `memory_id=eq.${memoryId}` },
    //     (payload) => {
    //       // Handle real-time updates
    //     }
    //   )
    //   .subscribe();

    // For now, set empty state
    setComments([]);

    // return () => subscription.unsubscribe();
  }, [memoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with Supabase operation
      // await supabase.from('comments').insert({
      //   memory_id: memoryId,
      //   user_id: user.uid,
      //   user_photo: user.photoURL,
      //   user_name: user.displayName,
      //   text: newComment.trim(),
      //   created_at: new Date().toISOString(),
      // });
      console.log('Add comment:', { memoryId, text: newComment.trim() });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-pastel-blue"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="btn-primary rounded-full"
            >
              {isSubmitting ? '...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 items-start">
            {comment.userPhoto && (
              <img
                src={comment.userPhoto}
                alt={comment.userName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg px-4 py-2">
                <div className="font-medium text-sm">{comment.userName}</div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {comment.createdAt && format(comment.createdAt, 'MMM d, yyyy • h:mm a')}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}