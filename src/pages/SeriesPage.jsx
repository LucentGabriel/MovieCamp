import React, { useEffect, useContext, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import MovieCard from "../components/MovieCard";
import axios from "axios";

const MovieRow = lazy(() => import("../components/MovieRow"));

const SeriesPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  const [featured, setFeatured] = useState(null);
  const [error, setError] = useState(null);

  // ---- Fetch random featured TV series (Top Rated) ----
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(
          "https://api.themoviedb.org/3/tv/top_rated?page=1",
          {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
          }
        );
        const data = res.data.results;
        if (data && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)];
          setFeatured(random);
        } else {
          throw new Error("No series found");
        }
      } catch (err) {
        console.error("Error fetching featured series:", err);
        setError(err.message);
      }
    };
    fetchFeatured();
  }, [TMDB_TOKEN]);

  // ---- Navigate to series details ----
  const handleCardClick = (series) => {
    if (!series) return;
    navigate(`/series/${series.id}`, {
      state: { series: { ...series, media_type: "tv" }, mediaType: "tv" },
    });
  };

  // ---- Categories ----
  const categories = [
    { title: "New Series", fetchType: "airing_today" },
    { title: "Popular Series", fetchType: "popular" },
    { title: "Top Rated Series", fetchType: "top_rated" },
    { title: "Upcoming Series", fetchType: "on_the_air" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-cinema-black text-white" : "bg-white text-cinema-text"
        }`}
    >
      {/* ---- HERO FEATURED SERIES ---- */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex items-end"
        style={{
          backgroundImage: featured?.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`
            : "linear-gradient(to bottom, #000000, #1a1a1a)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <motion.div
          className="relative z-10 p-10 max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {featured?.name || "No Featured Series"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-5">
            {featured?.overview || (error ? `⚠️ ${error}` : "Fetching series details...")}
          </p>
          {featured && (
            <button
              onClick={() => handleCardClick(featured)}
              className="bg-cinema-red hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition"
            >
              Watch Now
            </button>
          )}
        </motion.div>
      </div>

      {/* ---- HORIZONTAL CATEGORY ROWS ---- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categories.map((category) => (
          <Suspense
            key={category.fetchType}
            fallback={
              <div
                className={`text-center ${isDarkMode ? "text-white" : "text-cinema-text"
                  }`}
              >
                Loading {category.title}...
              </div>
            }
          >
            <SeriesRowWrapper
              title={category.title}
              fetchType={category.fetchType}
              onCardClick={handleCardClick}
            />
          </Suspense>
        ))}
      </div>
    </div>
  );
};

// ---- Lazy Wrapper for TV Series Rows ----
const SeriesRowWrapper = ({ title, fetchType, onCardClick }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div ref={ref} className="mb-10">
      {inView ? (
        <MovieRow
          title={title}
          fetchType={fetchType}
          onCardClick={onCardClick}
          mediaType="tv" // <-- important, fetches TV series
        />
      ) : (
        <div className="h-40" />
      )}
    </div>
  );
};

export default SeriesPage;
