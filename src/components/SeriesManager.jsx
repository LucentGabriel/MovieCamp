import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SeriesManager = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [seriesList, setSeriesList] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [savedLinks, setSavedLinks] = useState({});

    // Episode Input State
    const [seasonNum, setSeasonNum] = useState('');
    const [episodeNum, setEpisodeNum] = useState('');
    const [episodeUrl, setEpisodeUrl] = useState('');
    const [message, setMessage] = useState('');

    const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

    useEffect(() => {
        fetchSavedLinks();
    }, []);

    const fetchSavedLinks = async () => {
        const { data, error } = await supabase.from('series_links').select('*');
        if (error) {
            console.error('Error fetching series links:', error);
            return;
        }

        const linksMap = {};
        data.forEach(link => {
            if (!linksMap[link.tmdb_id]) linksMap[link.tmdb_id] = {};
            if (!linksMap[link.tmdb_id][link.season_number]) linksMap[link.tmdb_id][link.season_number] = {};
            linksMap[link.tmdb_id][link.season_number][link.episode_number] = link.video_url;
        });
        setSavedLinks(linksMap);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1`, {
                headers: {
                    Authorization: `Bearer ${TMDB_TOKEN}`,
                    accept: 'application/json',
                },
            });
            const data = await res.json();
            setSeriesList(data.results || []);
            setSelectedSeries(null); // Reset selection on new search
        } catch (err) {
            console.error("Failed to search series", err);
        }
    };

    const handleSaveEpisode = async (e) => {
        e.preventDefault();
        console.log("Attempting to save episode...");

        if (!selectedSeries) {
            setMessage("Error: No series selected.");
            return;
        }
        if (!seasonNum) {
            setMessage("Error: Please enter a Season Number.");
            return;
        }
        if (!episodeNum) {
            setMessage("Error: Please enter an Episode Number.");
            return;
        }
        if (!episodeUrl) {
            setMessage("Error: Please enter a Video URL.");
            return;
        }

        try {
            const seriesId = String(selectedSeries.id);
            const sNum = parseInt(seasonNum);
            const eNum = parseInt(episodeNum);

            console.log(`Saving: ID=${seriesId}, S=${sNum}, E=${eNum}, URL=${episodeUrl}`);

            const { error } = await supabase.from('series_links').upsert({
                tmdb_id: seriesId,
                season_number: sNum,
                episode_number: eNum,
                video_url: episodeUrl
            }, { onConflict: 'tmdb_id, season_number, episode_number' });

            if (error) throw error;

            // Update local state
            const newLinks = { ...savedLinks };
            if (!newLinks[seriesId]) newLinks[seriesId] = {};
            if (!newLinks[seriesId][sNum]) newLinks[seriesId][sNum] = {};
            newLinks[seriesId][sNum][eNum] = episodeUrl;

            setSavedLinks(newLinks);

            setMessage(`Success! Saved: S${sNum} E${eNum}`);
            setEpisodeUrl(''); // Clear URL for next entry
            // Don't clear season/episode numbers immediately as user might want to add next episode
            setEpisodeNum(prev => String(Number(prev) + 1));

            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Save failed:", error);
            setMessage("Error: Failed to save. Check console.");
        }
    };

    const handleRemoveEpisode = async (seriesId, sNum, eNum) => {
        const strId = String(seriesId);
        const intSNum = parseInt(sNum);
        const intENum = parseInt(eNum);

        const { error } = await supabase.from('series_links').delete().match({
            tmdb_id: strId,
            season_number: intSNum,
            episode_number: intENum
        });

        if (error) {
            console.error('Error removing episode:', error);
            return;
        }

        const newLinks = { ...savedLinks };
        if (newLinks[strId] && newLinks[strId][sNum]) {
            delete newLinks[strId][sNum][eNum];
            // Cleanup empty objects
            if (Object.keys(newLinks[strId][sNum]).length === 0) {
                delete newLinks[strId][sNum];
            }
            if (Object.keys(newLinks[strId]).length === 0) {
                delete newLinks[strId];
            }
            setSavedLinks(newLinks);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Search & Select */}
            <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4 text-gray-300">1. Find Series</h3>
                <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search TV Series..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none"
                    />
                    <button type="submit" className="bg-cinema-red hover:bg-red-700 px-6 py-3 rounded font-bold transition">
                        Search
                    </button>
                </form>

                {/* Series List */}
                {seriesList.length > 0 && (
                    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden mb-8 max-h-[400px] overflow-y-auto">
                        {seriesList.map(series => (
                            <div
                                key={series.id}
                                onClick={() => setSelectedSeries(series)}
                                className={`p-4 flex items-center gap-4 cursor-pointer transition ${selectedSeries?.id === series.id ? 'bg-cinema-red/20 border-l-4 border-cinema-red' : 'hover:bg-gray-800'}`}
                            >
                                <img
                                    src={series.poster_path ? `https://image.tmdb.org/t/p/w92${series.poster_path}` : 'https://via.placeholder.com/92x138?text=No+Img'}
                                    alt={series.name}
                                    className="w-12 h-16 object-cover rounded"
                                />
                                <div>
                                    <h4 className="font-bold">{series.name}</h4>
                                    <p className="text-xs text-gray-400">{series.first_air_date?.split('-')[0]} • ID: {series.id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Episode Manager */}
                {selectedSeries && (
                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                        <h3 className="text-xl font-bold mb-4 text-white">2. Add Episode for: <span className="text-cinema-red">{selectedSeries.name}</span></h3>

                        {message && (
                            <div className={`p-3 rounded mb-4 text-sm ${message.startsWith('Error') ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSaveEpisode} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1/4">
                                    <label className="block text-gray-400 text-sm mb-1">Season #</label>
                                    <input
                                        type="number"
                                        value={seasonNum}
                                        onChange={(e) => setSeasonNum(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none"
                                        placeholder="1"
                                        min="1"
                                    />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-gray-400 text-sm mb-1">Episode #</label>
                                    <input
                                        type="number"
                                        value={episodeNum}
                                        onChange={(e) => setEpisodeNum(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none"
                                        placeholder="1"
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Video URL</label>
                                <input
                                    type="text"
                                    value={episodeUrl}
                                    onChange={(e) => setEpisodeUrl(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cinema-red focus:outline-none"
                                    placeholder="https://example.com/episode.mp4"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-cinema-red hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200"
                            >
                                Save Episode
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Right: Saved Episodes for Selected Series */}
            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-300">3. Saved Episodes</h3>
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden h-full max-h-[600px] overflow-y-auto">
                    {!selectedSeries ? (
                        <div className="p-6 text-gray-500 text-center">Select a series to view episodes.</div>
                    ) : !savedLinks[String(selectedSeries.id)] ? (
                        <div className="p-6 text-gray-500 text-center">No episodes saved for this series.</div>
                    ) : (
                        <div className="p-4">
                            {Object.entries(savedLinks[String(selectedSeries.id)]).map(([sNum, episodes]) => (
                                <div key={sNum} className="mb-4">
                                    <h4 className="text-cinema-red font-bold mb-2 border-b border-gray-700 pb-1">Season {sNum}</h4>
                                    <ul className="space-y-2">
                                        {Object.entries(episodes).map(([eNum, url]) => (
                                            <li key={eNum} className="flex justify-between items-center bg-black p-2 rounded">
                                                <div className="overflow-hidden mr-2">
                                                    <span className="font-bold text-white mr-2">Ep {eNum}</span>
                                                    <span className="text-xs text-gray-500 truncate block">{url}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveEpisode(selectedSeries.id, sNum, eNum)}
                                                    className="text-gray-500 hover:text-red-500"
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeriesManager;
