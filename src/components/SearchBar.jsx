import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import { SearchContext } from '../context/SearchContext';

// In-memory cache
const apiCache = new Map();

const SearchBar = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { setSearchResults } = useContext(SearchContext);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      console.log('Search query is empty');
      setSearchResults([]);
      return;
    }

    console.log('Searching for:', query);
    const cacheKey = `search_${query.toLowerCase()}`;

    // Check cache
    if (apiCache.has(cacheKey)) {
      console.log(`Cache hit for ${cacheKey}`);
      setSearchResults(apiCache.get(cacheKey));
      setQuery('');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
          },
        }
      );
      console.log('Search API response:', response.data);
      const results = response.data.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average ?? 0,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster',
        overview: movie.overview,
        genre_ids: movie.genre_ids,
        release_date: movie.release_date,
      }));
      console.log('Mapped search results:', results);
      // Store in cache
      apiCache.set(cacheKey, results);
      console.log(`Cached ${cacheKey}:`, results);
      setSearchResults(results);
      setQuery('');
    } catch (error) {
      console.error('Error searching movies:', error.response || error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-8"
      onSubmit={handleSearch}
    >
      <div className="flex w-full items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Movies…"
          aria-label="Search movies"
          className="flex-1 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinema-red bg-white text-cinema-text placeholder-gray-400"
        />
        <motion.button
          type="submit"
          aria-label="Submit search"
          className="ml-3 bg-cinema-red text-white px-4 py-2 rounded-md"
          whileTap={{ scale: 0.98 }}
        >
          Search
        </motion.button>
      </div>
    </motion.form>
  );
};

export default SearchBar;