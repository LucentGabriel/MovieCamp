import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const MovieManager = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savedLinks, setSavedLinks] = useState({});
    const [message, setMessage] = useState('');
    const [urlInputs, setUrlInputs] = useState({});

    const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

    useEffect(() => {
        fetchSavedLinks();
        fetchNowPlaying();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSavedLinks = async () => {
        const { data, error } = await supabase.from('movie_links').select('*');
        if (error) {
            console.error('Error fetching links:', error);
            return;
        }
        const linksMap = {};
        data.forEach(link => {
            linksMap[link.tmdb_id] = link.video_url;
        });
        setSavedLinks(linksMap);
    };

    const fetchNowPlaying = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1', {
                headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: 'application/json' },
            });
            const data = await res.json();
            setMovies(data.results || []);
        } catch (err) {
            console.error("Failed to fetch movies", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1`, {
                headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: 'application/json' },
            });
            const data = await res.json();
            setMovies(data.results || []);
        } catch (err) {
            console.error("Failed to search movies", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUrlChange = (movieId, url) => {
        setUrlInputs(prev => ({ ...prev, [movieId]: url }));
    };

    const handleSaveLink = async (movie) => {
        const url = urlInputs[movie.id];
        console.log('Save button clicked for movie:', movie.title, 'ID:', movie.id);
        console.log('URL to save:', url);

        if (!url) {
            console.warn('No URL provided');
            setMessage('Please enter a URL first');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        console.log('Attempting to save to Supabase...');

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database timeout - check RLS policies in Supabase')), 10000)
            );

            const savePromise = supabase.from('movie_links').upsert({
                tmdb_id: String(movie.id),
                video_url: url
            });

            const { data, error } = await Promise.race([savePromise, timeoutPromise]);

            console.log('Supabase response:', { data, error });

            if (error) {
                console.error('Error saving link:', error);
                setMessage(`Error: ${error.message}`);
                setTimeout(() => setMessage(''), 5000);
                return;
            }

            console.log('Link saved successfully!');
            setSavedLinks(prev => ({ ...prev, [movie.id]: url }));
            setMessage(`Link saved for "${movie.title}"`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Save exception:', error);
            setMessage(`Error: ${error.message}`);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleRemoveLink = async (movieId) => {
        const { error } = await supabase.from('movie_links').delete().eq('tmdb_id', String(movieId));

        if (error) {
            console.error('Error removing link:', error);
            return;
        }

        const newLinks = { ...savedLinks };
        delete newLinks[movieId];
        setSavedLinks(newLinks);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a movie..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none"
                    />
                    <button type="submit" className="bg-cinema-red hover:bg-red-700 px-6 py-3 rounded font-bold transition">
                        Search
                    </button>
                </form>

                {message && (
                    <div className="bg-green-500/20 text-green-500 p-3 rounded mb-4 text-sm">{message}</div>
                )}

                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading movies...</div>
                    ) : movies.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No movies found.</div>
                    ) : (
                        <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                            {movies.map(movie => (
                                <div key={movie.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-gray-800/50 transition">
                                    <img
                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/92x138?text=No+Img'}
                                        alt={movie.title}
                                        className="w-16 h-24 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate">{movie.title}</h3>
                                        <p className="text-gray-400 text-sm">ID: {movie.id} • {movie.release_date?.split('-')[0]}</p>

                                        <div className="mt-2 flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Paste Video URL here..."
                                                value={urlInputs[movie.id] || savedLinks[movie.id] || ''}
                                                onChange={(e) => handleUrlChange(movie.id, e.target.value)}
                                                className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:border-cinema-red focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleSaveLink(movie)}
                                                className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded text-sm font-bold transition"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                    {savedLinks[movie.id] && (
                                        <div className="text-green-500 text-xl" title="Link Saved">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-300">Active Links</h3>
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    {Object.keys(savedLinks).length === 0 ? (
                        <div className="p-6 text-gray-500 text-center">No movies linked yet.</div>
                    ) : (
                        <ul className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
                            {Object.entries(savedLinks).map(([id, url]) => (
                                <li key={id} className="p-4 hover:bg-gray-800 transition">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-cinema-red font-bold text-sm">ID: {id}</span>
                                        <button
                                            onClick={() => handleRemoveLink(id)}
                                            className="text-gray-500 hover:text-red-500 text-xs uppercase font-bold"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-xs break-all">{url}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieManager;
