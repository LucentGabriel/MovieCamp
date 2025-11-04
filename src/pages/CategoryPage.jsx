import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import MovieCard from '../components/MovieCard';
import { ThemeContext } from '../context/ThemeContext';

const genreMap = {
  action: 28,
  horror: 27,
  comedy: 35,
  anime: 16, // ✅ TMDB genre ID for Animation
};

const CategoryPage = () => {
  const { category } = useParams();
  const { isDarkMode } = useContext(ThemeContext);

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [ref, inView] = useInView({ threshold: 0.1 });

  const fetchMovies = async (reset = false) => {
    if (!category) return;
    if (!hasMore) return;

    setIsLoading(true);
    setError(null);

    let endpoint = '';
    const params = { page };

    // ✅ Choose endpoint based on category
    if (category === 'series') {
      endpoint = 'https://api.themoviedb.org/3/tv/popular';
    } else if (category === 'indian') {
      endpoint = 'https://api.themoviedb.org/3/discover/movie';
      params.with_original_language = 'hi';
    } else if (category === 'anime') {
      endpoint = 'https://api.themoviedb.org/3/discover/movie';
      params.with_genres = 16;
      params.with_keywords = '210024';
    } else if (genreMap[category]) {
      endpoint = 'https://api.themoviedb.org/3/discover/movie';
      params.with_genres = genreMap[category];
    } else if (category === 'new') {
      endpoint = 'https://api.themoviedb.org/3/movie/now_playing';
    } else if (category === 'all') {
      endpoint = 'https://api.themoviedb.org/3/movie/popular';
    } else if (category === 'top-rated') {
      endpoint = 'https://api.themoviedb.org/3/movie/top_rated';
    } else if (category === 'popular') {
      endpoint = 'https://api.themoviedb.org/3/movie/popular';
    } else if (category === 'upcoming') {
      endpoint = 'https://api.themoviedb.org/3/movie/upcoming';
    } else {
      endpoint = `https://api.themoviedb.org/3/movie/${category.replace('-', '_')}`;
    }

    console.log('📡 Fetching from endpoint:', endpoint, params);

    try {
      const response = await axios.get(endpoint, {
        params,
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
        },
      });

      const results = response.data.results || [];

      const newMovies = results.map((movie, index) => ({
        id: movie.id,
        title: movie.title || movie.name,
        rating: movie.vote_average ?? 0,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : 'https://via.placeholder.com/300x450?text=No+Poster',
        overview: movie.overview,
        genre_ids: movie.genre_ids,
        release_date: movie.release_date || movie.first_air_date,
        uniqueKey: `${movie.id}-${page}-${index}`,
      }));

      setMovies((prev) => {
        const filteredNew = newMovies.filter(
          (newMovie) => !prev.some((p) => p.id === newMovie.id)
        );
        return reset ? filteredNew : [...prev, ...filteredNew];
      });

      setHasMore(results.length > 0);
    } catch (err) {
      console.error('❌ Error fetching category movies:', err);
      setError('Failed to load movies. Please check your API token and try again.');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Reset and refetch when category changes
  useEffect(() => {
    if (!category) return;
    setPage(1);
    setMovies([]);
    setHasMore(true);
    fetchMovies(true);
  }, [category]);

  // ✅ Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, isLoading]);

  // ✅ Fetch more pages
  useEffect(() => {
    if (page > 1) {
      fetchMovies();
    }
  }, [page]);

  if (!category) {
    return (
      <div className="text-center py-10 text-gray-400">
        Loading category...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-cinema-red mb-4">{error}</p>
        <button
          onClick={() => fetchMovies(true)}
          className="bg-cinema-red text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <h1
        className={`text-3xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-cinema-text'
        }`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}{' '}
        {category === 'series' ? 'Shows' : 'Movies'}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.uniqueKey} movie={movie} />
        ))}
      </div>

      {isLoading && (
        <div
          className={`text-center py-4 ${
            isDarkMode ? 'text-white' : 'text-cinema-text'
          }`}
        >
          Loading more...
        </div>
      )}

      {!hasMore && (
        <div className="text-center py-4 text-gray-400">No more movies</div>
      )}

      <div ref={ref} className="h-10" />
    </motion.div>
  );
};

export default CategoryPage;
