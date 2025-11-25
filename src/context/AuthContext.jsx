import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Helper to get role
    const getUserWithRole = async (session) => {
        console.log('getUserWithRole called with session:', session ? 'valid' : 'null');
        if (!session?.user) {
            console.log('No session user found');
            return null;
        }

        try {
            // Create a promise that rejects after 5 seconds
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            );

            // Race the supabase query against the timeout
            const profilePromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

            if (error) console.log('Error fetching profile:', error);
            console.log('Profile data:', data);

            const role = data?.role || 'user';
            const finalUser = { ...session.user, role };
            console.log('Final user object:', finalUser);
            return finalUser;
        } catch (error) {
            console.error('Error in getUserWithRole:', error);
            // Fallback to basic user if profile fetch fails or times out
            console.log('Falling back to default user role');
            return { ...session.user, role: 'user' };
        }
    };

    useEffect(() => {
        // Check active session
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                const userWithRole = await getUserWithRole(session);
                setUser(userWithRole);
            } catch (error) {
                console.error('Error initializing session:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change event:', event, 'Session:', session ? 'exists' : 'null');
            try {
                const userWithRole = await getUserWithRole(session);
                console.log('User with role derived:', userWithRole);
                setUser(userWithRole);
            } catch (error) {
                console.error('Error in auth state change:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Starting login attempt...');

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('Supabase login response:', { data, error });

            if (error) {
                console.error('Login error:', error);

                // Fallback: Check if session was actually created despite error (e.g. network flake)
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData?.session) {
                    console.log('Recovered from login error, session exists:', sessionData.session);
                    const userWithRole = await getUserWithRole(sessionData.session);
                    setUser(userWithRole);
                    return { success: true, data: sessionData };
                }

                return { success: false, error: error.message };
            }

            // Manually update state to ensure immediate UI feedback
            if (data.session) {
                const userWithRole = await getUserWithRole(data.session);
                setUser(userWithRole);
            }

            return { success: true, data };
        } catch (error) {
            console.error('Login exception:', error);

            // Fallback for exceptions too
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData?.session) {
                    console.log('Recovered from login exception, session exists');
                    const userWithRole = await getUserWithRole(sessionData.session);
                    setUser(userWithRole);
                    return { success: true, data: sessionData };
                }
            } catch (e) { /* ignore */ }

            return { success: false, error: error.message };
        }
    };

    const signup = async (email, password) => {
        try {
            console.log('Starting signup attempt...');

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            console.log('Supabase signup response:', { data, error });

            if (error) {
                console.error('Signup error:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        } catch (error) {
            console.error('Signup exception:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out:', error.message);
        setUser(null);
    };

    const toggleAuthModal = () => {
        setIsAuthModalOpen(prev => !prev);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, isAuthModalOpen, toggleAuthModal }}>
            {children}
        </AuthContext.Provider>
    );
};
