import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import MovieCard from "../components/MovieCard";
import axios from "axios";

const AnimePage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [anime, setAnime] = useState([]);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("top_rated");
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();

  const fetchAnime = async (pageNum = 1) => {
    setIsLoading(true);
    let url = "";

    if (category === "currently_airing") {
      url = `https://api.themoviedb.org/3/discover/tv?with_origin_country=JP&first_air_date.gte=2025-01-01&sort_by=first_air_date.desc&page=${pageNum}`;
    } else if (category === "popular") {
      url = `https://api.themoviedb.org/3/discover/tv?with_origin_country=JP&sort_by=popularity.desc&page=${pageNum}`;
    } else {
      url = `https://api.themoviedb.org/3/discover/tv?with_origin_country=JP&sort_by=vote_average.desc&vote_count.gte=50&page=${pageNum}`;
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
        },
      });

      const newAnime = response.data.results.map((item) => ({
        id: item.id,
        title: item.name,
        rating: item.vote_average ?? 0,
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "https://via.placeholder.com/300x450?text=No+Image",
        overview: item.overview || "No description available.",
        release_date: item.first_air_date || "N/A",
        media_type: "tv",
      }));

      setAnime((prev) => [...prev, ...newAnime]);
    } catch (err) {
      console.error("Error fetching Anime:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setAnime([]);
    fetchAnime(1);
  }, [category]);

  useEffect(() => {
    if (page > 1) fetchAnime(page);
  }, [page]);

  const lastCardRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setPage((prev) => prev + 1);
      });

      if (node) observer.current.observe(node);
    },
    [isLoading]
  );

  return (
    <div
      className={`min-h-screen pt-20 px-4 sm:px-6 lg:px-8 ${
        isDarkMode ? "bg-cinema-dark text-white" : "bg-white text-cinema-text"
      }`}
    >
      <h1 className="text-4xl font-bold mb-6">Anime</h1>

      {/* Category buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { key: "top_rated", label: "Top Rated" },
          { key: "popular", label: "Popular" },
          { key: "currently_airing", label: "Currently Airing (2025+)" },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setCategory(btn.key)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              category === btn.key
                ? "bg-cinema-red text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {anime.map((item, index) => {
          if (index === anime.length - 1) {
            return (
              <div ref={lastCardRef} key={item.id}>
                <MovieCard movie={item} />
              </div>
            );
          }
          return <MovieCard key={item.id} movie={item} />;
        })}
      </div>

      {isLoading && (
        <div className="text-center mt-8">
          <div className="animate-spin w-8 h-8 border-4 border-cinema-red border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading more...</p>
        </div>
      )}
    </div>
  );
};

export default AnimePage;
