'use client';

import { createContext, useContext, useEffect, useState } from 'react';
// TODO: Replace with Supabase auth imports
// import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with Supabase auth state listener
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   (event, session) => {
    //     if (session?.user) {
    //       setUser({
    //         uid: session.user.id,
    //         email: session.user.email,
    //         displayName: session.user.user_metadata?.full_name,
    //         photoURL: session.user.user_metadata?.avatar_url,
    //       });
    //     } else {
    //       setUser(null);
    //     }
    //     setLoading(false);
    //   }
    // );

    // For now, set no user and stop loading
    setUser(null);
    setLoading(false);

    // return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    try {
      // TODO: Replace with Supabase auth
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      // });
      // if (error) throw error;
      // return { success: true, user: data.user };
      console.log('Sign up:', { email, password });
      return { success: false, error: 'Authentication not implemented yet' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      // TODO: Replace with Supabase auth
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });
      // if (error) throw error;
      // return { success: true, user: data.user };
      console.log('Sign in:', { email, password });
      return { success: false, error: 'Authentication not implemented yet' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGooglePopup = async () => {
    try {
      // TODO: Replace with Supabase auth
      // const { data, error } = await supabase.auth.signInWithOAuth({
      //   provider: 'google',
      // });
      // if (error) throw error;
      // return { success: true, user: data.user };
      console.log('Sign in with Google');
      return { success: false, error: 'Authentication not implemented yet' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      // TODO: Replace with Supabase auth
      // const { error } = await supabase.auth.signOut();
      // if (error) throw error;
      // return { success: true };
      console.log('Sign out');
      return { success: false, error: 'Authentication not implemented yet' };
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