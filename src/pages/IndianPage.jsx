import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MovieRow from "../components/MovieRow";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";

function IndianPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  const [featured, setFeatured] = useState(null);

  // Base TMDB filters for Indian content (covers major Indian languages)
  const indianParams = {
    with_original_language: "hi|ta|te|ml|kn", // Hindi, Tamil, Telugu, Malayalam, Kannada
    region: "IN",
  };

  // Fetch random featured Indian movie
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(
          "https://api.themoviedb.org/3/discover/movie",
          {
            params: {
              ...indianParams,
              sort_by: "popularity.desc",
              page: 1,
            },
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
          }
        );
        const data = res.data.results;
        if (data && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)];
          setFeatured(random);
        }
      } catch (err) {
        console.error("Error fetching featured Indian movie:", err);
      }
    };
    fetchFeatured();
  }, [TMDB_TOKEN]);

  const handleCardClick = (item) => {
    const path = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(path);
  };

  // Today's date
  const today = new Date().toISOString().split("T")[0];

  // Year cutoff for currently airing or upcoming
  const yearCutoff = "2025-01-01";

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-cinema-black text-white" : "bg-white text-cinema-text"}`}>
      {/* ---- HERO FEATURED INDIAN MOVIE ---- */}
      {featured && (
        <div
          className="relative w-full h-screen bg-cover bg-center flex items-end"
          style={{
            backgroundImage: featured.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`
              : "linear-gradient(to bottom, #000, #1a1a1a)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <motion.div
            className="relative z-10 p-10 max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{featured.title}</h1>
            <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-5">{featured.overview}</p>
            <button
              onClick={() => handleCardClick({ ...featured, media_type: 'movie' })}
              className="bg-cinema-red hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition"
            >
              Watch Now
            </button>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 🥇 Top Rated Indian Movies */}
        <MovieRow
          title="Top Rated Indian Movies"
          discoverParams={{
            ...indianParams,
            sort_by: "vote_average.desc",
            "vote_count.gte": "200",
          }}
          mediaType="movie"
          onCardClick={handleCardClick}
        />

        {/* 🔥 Popular Indian Movies */}
        <MovieRow
          title="Popular Indian Movies"
          discoverParams={{
            ...indianParams,
            sort_by: "popularity.desc",
          }}
          mediaType="movie"
          onCardClick={handleCardClick}
        />

        {/* 📺 Popular Indian Series */}
        <MovieRow
          title="Popular Indian Series"
          discoverParams={{
            ...indianParams,
            sort_by: "popularity.desc",
          }}
          mediaType="tv"
          onCardClick={handleCardClick}
        />

        {/* 🕒 Currently Airing / Upcoming (2025 and beyond) */}
        <MovieRow
          title="Currently Airing / Upcoming Indian Shows"
          discoverParams={{
            ...indianParams,
            sort_by: "first_air_date.desc",
            "first_air_date.gte": yearCutoff,
          }}
          mediaType="tv"
          onCardClick={handleCardClick}
        />

        {/* 🎬 Upcoming Indian Movies (future releases) */}
        <MovieRow
          title="Upcoming Indian Movies"
          discoverParams={{
            ...indianParams,
            sort_by: "primary_release_date.desc",
            "primary_release_date.gte": today,
          }}
          mediaType="movie"
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}

export default IndianPage;
