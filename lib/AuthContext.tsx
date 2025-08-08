'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

type UserProfile = User & { role?: string };
type AuthContextType = {
  session: Session | null;
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    async function fetchUserProfile() {
      if (session?.user) {
        const { data } = await supabase.from('users').select('*, role').eq('id', session.user.id).single();
        setUser({ ...session.user, ...data });
      } else {
        setUser(null);
      }
    }
    fetchUserProfile();
  }, [session]);

  const signIn = async (email: string, password: string) => await supabase.auth.signInWithPassword({ email, password });
  const signUp = async (email: string, password: string) => await supabase.auth.signUp({ email, password });
  const signOut = async () => { await supabase.auth.signOut(); setSession(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ session, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
