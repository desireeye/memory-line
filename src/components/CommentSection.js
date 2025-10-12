'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

export default function CommentSection({ memoryId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!memoryId) return;

    let isMounted = true;

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: false });
      if (error) return;
      if (!isMounted) return;
      const commentsData = (data || []).map(row => ({
        id: row.id,
        memoryId: row.memory_id,
        userId: row.user_id,
        userPhoto: row.user_photo,
        userName: row.user_name,
        text: row.text,
        createdAt: row.created_at ? new Date(row.created_at) : null,
      }));
      setComments(commentsData);
    };

    fetchComments();

    const channel = supabase
      .channel('comments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `memory_id=eq.${memoryId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [memoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert([
        {
          memory_id: memoryId,
          user_id: user.uid,
          user_photo: user.photoURL,
          user_name: user.displayName,
          text: newComment.trim(),
        },
      ]);
      if (error) throw error;
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