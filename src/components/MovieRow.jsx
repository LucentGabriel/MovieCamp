import { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MovieCard from "./MovieCard";
import { ThemeContext } from "../context/ThemeContext";

// ✅ Shared cache across rows
const apiCache = new Map();

const MovieRow = ({
  title,
  fetchType,
  discoverParams = {},
  genreIds = [],
  mediaType = "movie", // "tv" for Kitsu
  onCardClick,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = `row_${fetchType}_${mediaType}_${JSON.stringify(discoverParams)}`;
      if (apiCache.has(cacheKey)) {
        setItems(apiCache.get(cacheKey));
        return;
      }

      try {
        setIsLoading(true);
        let data = [];

        if (fetchType === "kitsu") {
          const res = await axios.get("https://kitsu.io/api/edge/anime", {
            params: discoverParams,
          });
          const results = res.data.data || [];
          data = results.map((item) => ({
            id: item.id,
            title: item.attributes.canonicalTitle,
            overview: item.attributes.synopsis || "No description available",
            poster: item.attributes.posterImage?.original || "https://via.placeholder.com/300x450?text=No+Image",
            rating: parseFloat(item.attributes.averageRating) || 0,
            media_type: "tv",
          }));
        } else {
          // Fallback to TMDB
          const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
          let url;

          if (fetchType && fetchType !== 'discover') {
            url = `https://api.themoviedb.org/3/${mediaType}/${fetchType}?language=en-US`;
          } else {
            url = `https://api.themoviedb.org/3/discover/${mediaType}?language=en-US`;
          }

          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
            params: discoverParams,
          });
          const results = res.data.results || [];
          data = results.map((item) => ({
            id: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://via.placeholder.com/300x450?text=No+Image",
            rating: item.vote_average || 0,
            media_type: mediaType,
          }));
        }

        apiCache.set(cacheKey, data);
        setItems(data);
      } catch (err) {
        console.error(`Error fetching row ${title}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [title, fetchType, discoverParams, mediaType]);

  // ---- Scroll handlers ----
  const scrollLeft = () => {
    if (!rowRef.current) return;
    const width = rowRef.current.clientWidth || 800;
    rowRef.current.scrollBy({ left: -Math.floor(width * 0.7), behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!rowRef.current) return;
    const width = rowRef.current.clientWidth || 800;
    rowRef.current.scrollBy({ left: Math.floor(width * 0.7), behavior: "smooth" });
  };

  const handleClick = (item) => onCardClick?.(item);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? "text-white" : "text-cinema-text"}`}>
          {title}
        </h2>
      </div>

      {isLoading ? (
        <div className={`text-center py-4 ${isDarkMode ? "text-white" : "text-cinema-text"}`}>
          <div className="animate-pulse h-64 bg-gray-600 rounded" />
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 lg:px-8">
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Scroll Left"
          >
            <FaChevronLeft size={16} />
          </button>

          <motion.div
            ref={rowRef}
            className="flex overflow-x-auto space-x-2 md:space-x-4 pb-4 scrollbar-hide"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {items.map((item) => (
              <div key={item.id} className="flex-none w-32 md:w-40">
                <MovieCard movie={item} onClick={() => handleClick(item)} showLink={false} />
              </div>
            ))}
          </motion.div>

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
