import React, { useEffect, useState, useContext, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";

const MovieRow = lazy(() => import("../components/MovieRow"));

const AnimePage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  const [featured, setFeatured] = useState(null);

  // Fetch random featured anime
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/discover/tv?with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=50&page=1`,
          { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
        );
        const data = res.data.results;
        if (data && data.length > 0) {
          const random = data[Math.floor(Math.random() * data.length)];
          setFeatured(random);
        }
      } catch (err) {
        console.error("Error fetching featured anime:", err);
      }
    };
    fetchFeatured();
  }, [TMDB_TOKEN]);

  const handleCardClick = (anime) => {
    if (!anime) return;
    navigate(`/series/${anime.id}`, {
      state: { series: { ...anime, media_type: "tv" }, mediaType: "tv" },
    });
  };

  const today = new Date().toISOString().split("T")[0];

  const categories = [
    {
      title: "Top Rated Anime",
      params: { sort_by: "vote_average.desc", "vote_count.gte": "50", with_origin_country: "JP", with_genres: "16" },
    },
    {
      title: "Popular Anime",
      params: { sort_by: "popularity.desc", with_origin_country: "JP", with_genres: "16" },
    },
    {
      title: "New Anime",
      params: { sort_by: "first_air_date.desc", with_origin_country: "JP", with_genres: "16" },
    },
    {
      title: "Upcoming Anime",
      params: { sort_by: "first_air_date.asc", "first_air_date.gte": today, with_origin_country: "JP", with_genres: "16" },
    },
    {
      title: "Action Anime",
      params: { with_genres: "10759", with_origin_country: "JP" }, // 10759 is Action & Adventure
    },
    {
      title: "Comedy Anime",
      params: { with_genres: "35", with_origin_country: "JP", with_genres: "16" }, // 35 is Comedy, 16 is Animation
    },
    // Note: Horror (27) is not a standard TV genre, using Mystery (9648) or just keeping it if it works for movies, but for TV it might be empty. 
    // Let's try to include it but also add Animation to ensure it's anime.
    {
      title: "Horror / Mystery Anime",
      params: { with_genres: "9648", with_origin_country: "JP", with_genres: "16" },
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-cinema-black text-white" : "bg-white text-cinema-text"}`}>
      {/* ---- HERO FEATURED ---- */}
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
          <motion.div className="relative z-10 p-10 max-w-3xl" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{featured.name}</h1>
            <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-5">{featured.overview}</p>
            <button
              onClick={() => handleCardClick(featured)}
              className="bg-cinema-red hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition"
            >
              Watch Now
            </button>
          </motion.div>
        </div>
      )}

      {/* ---- SCROLLABLE ANIME ROWS ---- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categories.map((cat) => (
          <Suspense key={cat.title} fallback={<div>Loading {cat.title}...</div>}>
            <MovieRow
              title={cat.title}
              fetchType="discover"
              mediaType="tv"
              discoverParams={cat.params}
              onCardClick={handleCardClick}
            />
          </Suspense>
        ))}
      </div>
    </div>
  );
};

export default AnimePage;
