import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { NavLink } from "react-router-dom";
import MovieCard from "./MovieCard";
import { ThemeContext } from "../context/ThemeContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ✅ Shared cache across rows to avoid redundant API calls
const apiCache = new Map();

const MovieRow = ({
  title,
  movies: providedMovies = [],
  fetchType,
  genreIds = [],
  mediaType = "movie",
  discoverParams = {},
  onCardClick,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [movies, setMovies] = useState(providedMovies);
  const [isLoading, setIsLoading] = useState(false);
  const rowRef = useRef(null);

  // ✅ Fetch Movies or Series from TMDB
  useEffect(() => {
    if (providedMovies.length > 0) {
      setMovies(providedMovies);
      return;
    }

    const fetchMoviesData = async () => {
      const cacheKey = `row_${mediaType}_${fetchType}_${genreIds.join(
        "_"
      )}_${JSON.stringify(discoverParams)}`;
      let url = "";

      // Build TMDB URL dynamically
      if (genreIds.length > 0) {
        url = `https://api.themoviedb.org/3/discover/${mediaType}?with_genres=${genreIds.join(
          ","
        )}&language=en-US`;
      } else if (Object.keys(discoverParams).length > 0) {
        const params = new URLSearchParams({
          ...discoverParams,
          language: "en-US",
        }).toString();
        url = `https://api.themoviedb.org/3/discover/${mediaType}?${params}`;
      } else if (fetchType) {
        url = `https://api.themoviedb.org/3/${mediaType}/${fetchType}?language=en-US`;
      } else {
        console.warn(`No valid fetch parameters for ${title}`);
        return;
      }

      // ✅ Use cached data if available
      if (apiCache.has(cacheKey)) {
        setMovies(apiCache.get(cacheKey));
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
          },
        });

        const results = response.data.results || [];

        // ✅ Map data consistently
        const movieData = results.map((item) => {
          const imageBase = "https://image.tmdb.org/t/p/w500";
          const image =
            item.poster_path || item.backdrop_path
              ? `${imageBase}${item.poster_path || item.backdrop_path}`
              : "https://via.placeholder.com/300x450?text=No+Image";

          // ✅ Infer media type if missing
          const inferredType =
            item.media_type ||
            (item.first_air_date ? "tv" : "movie");

          return {
            id: item.id,
            title: item.title || item.name || "Untitled",
            rating: item.vote_average ?? 0,
            poster: image,
            overview: item.overview || "No description available.",
            genre_ids: item.genre_ids || [],
            release_date: item.release_date || item.first_air_date || "N/A",
            media_type: inferredType,
            origin_country: item.origin_country || [],
          };
        });

        apiCache.set(cacheKey, movieData);
        setMovies(movieData.slice(0, 10));
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoviesData();
  }, [title, providedMovies, fetchType, genreIds, mediaType, discoverParams]);

  // ✅ Scroll handlers
  const scrollLeft = () => {
    if (!rowRef.current) return;
    const width = rowRef.current.clientWidth || 800;
    rowRef.current.scrollBy({
      left: -Math.floor(width * 0.7),
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!rowRef.current) return;
    const width = rowRef.current.clientWidth || 800;
    rowRef.current.scrollBy({
      left: Math.floor(width * 0.7),
      behavior: "smooth",
    });
  };

  const handleClick = (movie) => onCardClick?.(movie);

  return (
    <div className="mb-10">
      {/* Header Title */}
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 lg:px-8">
        <h2
          className={`text-2xl md:text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-cinema-text"
          }`}
        >
          {title}
        </h2>

        {/* Optional "See All" link */}
        {!genreIds.length &&
          !Object.keys(discoverParams).length &&
          fetchType && (
            <NavLink
              to={`/${fetchType}`}
              className="text-cinema-red text-sm md:text-base hover:underline"
            >
              See All
            </NavLink>
          )}
      </div>

      {/* Loading Placeholder */}
      {isLoading ? (
        <div
          className={`text-center py-4 ${
            isDarkMode ? "text-white" : "text-cinema-text"
          }`}
        >
          <div className="animate-pulse h-64 bg-gray-600 rounded" />
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 lg:px-8">
          {/* Left Scroll Button */}
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Scroll Left"
          >
            <FaChevronLeft size={16} />
          </button>

          {/* Movie/Series Cards */}
          <motion.div
            ref={rowRef}
            className="flex overflow-x-auto space-x-2 md:space-x-4 pb-4 scrollbar-hide"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {movies.map((movie) => (
              <div key={`${movie.id}_${movie.media_type}`} className="flex-none w-32 md:w-40">
                <MovieCard
                  movie={movie}
                  onClick={() => handleClick(movie)}
                  showLink={false}
                />
              </div>
            ))}
          </motion.div>

          {/* Right Scroll Button */}
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Scroll Right"
          >
            <FaChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieRow;