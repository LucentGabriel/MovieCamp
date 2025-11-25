import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { FaTimes } from 'react-icons/fa';

const AuthModal = () => {
    const { isAuthModalOpen, toggleAuthModal, login, signup } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isAuthModalOpen) {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setMessage('');
            setLoading(false);
            setIsLogin(true);
        }
    }, [isAuthModalOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        console.log('Attempting auth...', { isLogin, email });

        try {
            if (isLogin) {
                const res = await login(email, password);
                console.log('Login response:', res);

                if (res.success) {
                    toggleAuthModal();
                } else {
                    if (res.error?.includes('Email not confirmed')) {
                        setError('Please confirm your email address before logging in.');
                    } else {
                        setError(res.error || 'Login failed');
                    }
                }
            } else {
                if (password !== confirmPassword) {
                    setError("Passwords don't match");
                    setLoading(false);
                    return;
                }
                const res = await signup(email, password);
                if (res.success) {
                    setMessage('Signup successful! Please check your email to confirm your account.');
                    setIsLogin(true);
                } else {
                    setError(res.error);
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthModalOpen) return null;

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleAuthModal}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-gray-900 w-full max-w-md p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-800 z-10 mx-4"
                    >
                        {/* Close Button */}
                        <button
                            onClick={toggleAuthModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>

                        <h2 className="text-3xl font-bold mb-6 text-center text-cinema-red">
                            {isLogin ? 'Welcome Back' : 'Join MovieCamp'}
                        </h2>

                        {error && (
                            <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-sm text-center border border-red-500/30">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-500/20 text-green-500 p-3 rounded mb-4 text-sm text-center border border-green-500/30">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none transition-colors"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none transition-colors"
                                    placeholder={isLogin ? "Enter password" : "Create a password"}
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <label className="block text-gray-400 text-sm mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none transition-colors"
                                        placeholder="Confirm password"
                                        required
                                    />
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cinema-red hover:bg-red-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <span className="text-gray-400">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white hover:text-cinema-red underline font-semibold transition-colors"
                            >
                                {isLogin ? 'Sign up now' : 'Sign in'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
