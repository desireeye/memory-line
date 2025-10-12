'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mapUser = (u) =>
      u
        ? {
            uid: u.id,
            email: u.email,
            displayName:
              u.user_metadata?.name ||
              u.user_metadata?.full_name ||
              u.user_metadata?.user_name ||
              '',
            photoURL: u.user_metadata?.avatar_url || '',
          }
        : null;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(mapUser(data?.user ?? null));
      setLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(mapUser(session?.user ?? null));
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGooglePopup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: typeof window !== 'undefined' ? window.location.origin + '/memories' : undefined },
      });
      if (error) throw error;
      // This will redirect; return success to satisfy caller
      return { success: true };
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