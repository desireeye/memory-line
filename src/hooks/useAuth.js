'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const supaUser = session?.user || null;
      setUser(supaUser ? mapSupabaseUser(supaUser) : null);
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const supaUser = session?.user || null;
      setUser(supaUser ? mapSupabaseUser(supaUser) : null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { success: true, user: data.user ? mapSupabaseUser(data.user) : null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, user: data.user ? mapSupabaseUser(data.user) : null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGooglePopup = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // On web, this redirects; we won't have user immediately.
      return { success: true, user: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  function mapSupabaseUser(supaUser) {
    const metadata = supaUser.user_metadata || {};
    return {
      uid: supaUser.id,
      email: supaUser.email,
      displayName: metadata.full_name || metadata.name || '',
      photoURL: metadata.avatar_url || '',
    };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGooglePopup,
        signOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};