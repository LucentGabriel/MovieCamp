import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { SearchContext } from '../context/SearchContext';

// In-memory cache
const apiCache = new Map();

const SearchBar = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { setSearchResults } = useContext(SearchContext);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      console.log('Search query is empty');
      setSearchResults([]);
      return;
    }

    // Navigate to search page to show results
    navigate('/search');

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
        `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
          },
        }
      );
      console.log('Search API response:', response.data);

      const results = response.data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => ({
          id: item.id,
          title: item.title || item.name,
          rating: item.vote_average ?? 0,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster',
          overview: item.overview,
          genre_ids: item.genre_ids,
          release_date: item.release_date || item.first_air_date,
          media_type: item.media_type,
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
      className="relative w-full"
      onSubmit={handleSearch}
    >
      <div className="flex w-full items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies/series/indian/anime..."
          aria-label="Search movies"
          className="flex-1 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinema-red bg-white text-cinema-text placeholder-gray-400 text-sm"
        />
        <motion.button
          type="submit"
          aria-label="Submit search"
          className="ml-2 bg-cinema-red text-white px-3 py-2 rounded-md text-sm"
          whileTap={{ scale: 0.98 }}
        >
          Search
        </motion.button>
      </div>
    </motion.form>
  );
};

export default SearchBar;