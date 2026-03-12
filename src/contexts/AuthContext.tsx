
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: 'admin' | 'user' | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<'admin' | 'user' | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRole = async (userId: string) => {
        console.log(`[Auth] Fetching role for user ${userId}...`);

        // Timeout for the database query
        const rolePromise = supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) =>
            setTimeout(() => {
                console.warn('[Auth] Role fetch timed out after 3s');
                resolve({ data: { role: 'user' }, error: null });
            }, 3000)
        );

        try {
            const { data, error } = await Promise.race([rolePromise, timeoutPromise]);

            if (error) {
                console.error('[Auth] Error fetching role:', error);
                return 'user';
            }
            console.log('[Auth] Role fetched successfully:', data?.role || 'user');
            return (data?.role as 'admin' | 'user') || 'user';
        } catch (err) {
            console.error('[Auth] Exception in fetchRole:', err);
            return 'user';
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            // Set a timeout to prevent infinite loading state
            const timeoutId = setTimeout(() => {
                if (mounted) {
                    console.warn('Auth initialization timed out after 5s');
                    setLoading(false);
                }
            }, 5000);

            try {
                console.log('[Auth] Initializing session...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        const userRole = await fetchRole(session.user.id);
                        setRole(userRole);
                    } else {
                        setRole(null);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                clearTimeout(timeoutId);
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Auth] State changed: ${event}`, session ? 'User present' : 'No session');
            try {
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        const userRole = await fetchRole(session.user.id);
                        setRole(userRole);
                        console.log('[Auth] UI unblocked after state change');
                        setLoading(false); // Unblock UI as soon as we have a user and role
                    } else {
                        setRole(null);
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Auth state change error:', error);
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        role,
        loading,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
