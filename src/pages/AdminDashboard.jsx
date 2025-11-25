import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import MovieManager from '../components/MovieManager';
import SeriesManager from '../components/SeriesManager';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [stats, setStats] = useState({
        totalVisits: 0,
        activeUsers: 0,
        totalSignups: 0,
        visitsToday: 0
    });
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        fetchUsers();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Get total visits
            const { count: totalVisits } = await supabase
                .from('analytics')
                .select('*', { count: 'exact', head: true });

            // Get visits today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: visitsToday } = await supabase
                .from('analytics')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            // Get total signups (profiles)
            const { count: totalSignups } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setStats({
                totalVisits: totalVisits || 0,
                activeUsers: 0, // Real-time active not implemented yet
                totalSignups: totalSignups || 0,
                visitsToday: visitsToday || 0
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data);
        setLoadingUsers(false);
    };

    const toggleAdminRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) {
            fetchUsers(); // Refresh list
        } else {
            alert('Error updating role: ' + error.message);
        }
    };

    const tabs = [
        { id: 'movies', label: 'Movies' },
        { id: 'series', label: 'Series' },
        { id: 'anime', label: 'Anime' },
        { id: 'indian', label: 'Indian' },
        { id: 'users', label: 'Users' },
    ];

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-cinema-red">Admin Dashboard</h1>

                {/* Analytics Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2">Analytics Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Visits" value={stats.totalVisits.toLocaleString()} color="bg-blue-600" />
                        <StatCard title="Visits Today" value={stats.visitsToday} color="bg-orange-600" />
                        <StatCard title="Total Signups" value={stats.totalSignups} color="bg-purple-600" />
                        <StatCard title="Active Users" value="-" color="bg-green-600" />
                    </div>
                </section>

                {/* Content Management Section */}
                <section>
                    <div className="flex gap-4 mb-8 border-b border-gray-800 pb-1 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-bold text-lg transition-colors relative ${activeTab === tab.id ? 'text-cinema-red' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-cinema-red"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[500px]">
                        {activeTab === 'movies' && <MovieManager />}
                        {activeTab === 'series' && <SeriesManager type="tv" />}
                        {activeTab === 'anime' && <SeriesManager type="anime" />}
                        {activeTab === 'indian' && <MovieManager />}
                        {activeTab === 'users' && (
                            <div className="bg-gray-900 rounded-lg p-6">
                                <h3 className="text-xl font-bold mb-4">User Management</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-800 text-gray-400">
                                                <th className="pb-3">Email</th>
                                                <th className="pb-3">Role</th>
                                                <th className="pb-3">Joined</th>
                                                <th className="pb-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                                    <td className="py-4">{user.email}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                            {user.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-gray-400 text-sm">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4">
                                                        <button
                                                            onClick={() => toggleAdminRole(user.id, user.role)}
                                                            className="text-sm underline hover:text-white text-gray-400"
                                                        >
                                                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`${color} p-6 rounded-lg shadow-lg`}
    >
        <h3 className="text-gray-200 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-4xl font-bold text-white mt-2">{value}</p>
    </motion.div>
);

export default AdminDashboard;
