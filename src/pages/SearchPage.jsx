import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';
import { SearchContext } from '../context/SearchContext';
import MovieCard from '../components/MovieCard';

const SearchPage = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const { searchResults } = useContext(SearchContext);
    const navigate = useNavigate();

    const handleCardClick = (movie) => {
        if (!movie) return;

        const isTV =
            movie.media_type === 'tv' ||
            movie.media_type === 'series' ||
            Boolean(movie.first_air_date) ||
            (movie.origin_country?.includes('JP') || movie.genre_ids?.includes(16));

        const mediaType = isTV ? 'tv' : 'movie';
        const path = isTV ? `/series/${movie.id}` : `/movie/${movie.id}`;

        navigate(path, {
            state: {
                movie: { ...movie, media_type: mediaType },
                mediaType,
            },
        });
    };

    return (
        <div
            className={`min-h-screen pt-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDarkMode ? 'bg-cinema-black text-white' : 'bg-white text-cinema-text'
                }`}
        >
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Search Results</h1>

                {searchResults.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {searchResults.map((movie) => (
                            <motion.div
                                key={movie.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCardClick(movie)}
                            >
                                <MovieCard movie={movie} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400">
                            No results found. Try searching for something else.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
