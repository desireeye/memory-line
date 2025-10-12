import { supabase } from './supabase';

export async function createUserProfile(userId, userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: userId, ...userData }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserByCustomUrl(customUrl) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('custom_url', customUrl)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserMemories(userId, options = {}) {
  let query = supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId);
  
  if (options.isPrivate !== undefined) {
    query = query.eq('is_private', options.isPrivate);
  }
  
  if (options.orderBy) {
    query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending });
  } else {
    query = query.order('date', { ascending: false });
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMemoriesByDateRange(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createMemory(memoryData) {
  const { data, error } = await supabase
    .from('memories')
    .insert([memoryData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getMemoryById(memoryId) {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('id', memoryId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserCollections(userId) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_memories (
        count
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createCollection(collectionData) {
  const { data, error } = await supabase
    .from('collections')
    .insert([collectionData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCollectionById(collectionId) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCollectionMemories(collectionId) {
  const { data, error } = await supabase
    .from('collection_memories')
    .select(`
      memory_id,
      memories (*)
    `)
    .eq('collection_id', collectionId);
  
  if (error) throw error;
  return data.map(item => item.memories);
}

export async function addMemoryToCollection(collectionId, memoryId) {
  const { data, error } = await supabase
    .from('collection_memories')
    .insert([{ collection_id: collectionId, memory_id: memoryId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeMemoryFromCollection(collectionId, memoryId) {
  const { error } = await supabase
    .from('collection_memories')
    .delete()
    .eq('collection_id', collectionId)
    .eq('memory_id', memoryId);
  
  if (error) throw error;
}

export async function getMemoryComments(memoryId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('memory_id', memoryId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export function subscribeToComments(memoryId, callback) {
  const channel = supabase
    .channel(`comments:${memoryId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `memory_id=eq.${memoryId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createComment(commentData) {
  const { data, error } = await supabase
    .from('comments')
    .insert([commentData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  
  if (error) throw error;
}

export async function getMemoryReactions(memoryId) {
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .eq('memory_id', memoryId);
  
  if (error) throw error;
  return data;
}

export function subscribeToReactions(memoryId, callback) {
  const channel = supabase
    .channel(`reactions:${memoryId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `memory_id=eq.${memoryId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function addReaction(reactionData) {
  const { data, error } = await supabase
    .from('reactions')
    .insert([reactionData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteReaction(reactionId) {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('id', reactionId);
  
  if (error) throw error;
}
