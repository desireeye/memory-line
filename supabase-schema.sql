-- Supabase Database Schema for Memory Line App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  bio TEXT,
  profile_photo TEXT,
  is_public BOOLEAN DEFAULT false,
  custom_url TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories table
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT,
  date DATE NOT NULL,
  tags TEXT[],
  media_url TEXT,
  type TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection memories junction table (many-to-many)
CREATE TABLE public.collection_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, memory_id)
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_photo TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(memory_id, user_id, type)
);

-- Indexes for better query performance
CREATE INDEX idx_memories_user_id ON public.memories(user_id);
CREATE INDEX idx_memories_date ON public.memories(date);
CREATE INDEX idx_memories_tags ON public.memories USING GIN(tags);
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_collection_memories_collection_id ON public.collection_memories(collection_id);
CREATE INDEX idx_collection_memories_memory_id ON public.collection_memories(memory_id);
CREATE INDEX idx_comments_memory_id ON public.comments(memory_id);
CREATE INDEX idx_reactions_memory_id ON public.reactions(memory_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view public profiles" ON public.users
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Memories policies
CREATE POLICY "Users can view own memories" ON public.memories
  FOR SELECT USING (user_id = auth.uid() OR (is_private = false AND user_id IN (
    SELECT id FROM public.users WHERE is_public = true
  )));

CREATE POLICY "Users can insert own memories" ON public.memories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memories" ON public.memories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own memories" ON public.memories
  FOR DELETE USING (user_id = auth.uid());

-- Collections policies
CREATE POLICY "Users can view own or public collections" ON public.collections
  FOR SELECT USING (user_id = auth.uid() OR is_private = false);

CREATE POLICY "Users can insert own collections" ON public.collections
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own collections" ON public.collections
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own collections" ON public.collections
  FOR DELETE USING (user_id = auth.uid());

-- Collection memories policies
CREATE POLICY "Users can view collection memories" ON public.collection_memories
  FOR SELECT USING (collection_id IN (
    SELECT id FROM public.collections WHERE user_id = auth.uid() OR is_private = false
  ));

CREATE POLICY "Users can manage own collection memories" ON public.collection_memories
  FOR ALL USING (collection_id IN (
    SELECT id FROM public.collections WHERE user_id = auth.uid()
  ));

-- Comments policies
CREATE POLICY "Anyone can view comments on accessible memories" ON public.comments
  FOR SELECT USING (memory_id IN (
    SELECT id FROM public.memories WHERE user_id = auth.uid() OR is_private = false
  ));

CREATE POLICY "Authenticated users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (user_id = auth.uid());

-- Reactions policies
CREATE POLICY "Anyone can view reactions on accessible memories" ON public.reactions
  FOR SELECT USING (memory_id IN (
    SELECT id FROM public.memories WHERE user_id = auth.uid() OR is_private = false
  ));

CREATE POLICY "Authenticated users can add reactions" ON public.reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON public.reactions
  FOR DELETE USING (user_id = auth.uid());

-- Storage buckets (to be created in Supabase Dashboard or via API)
-- 1. memories (for memory media uploads)
-- 2. profiles (for profile photos)
-- 3. collections (for collection cover images)

-- Storage policies (these need to be set in Supabase Dashboard)
-- Allow authenticated users to upload to their own folders
-- Allow public read access for media files
