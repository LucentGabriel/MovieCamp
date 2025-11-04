import { motion } from "framer-motion";
import { useContext } from "react";
import { FaPlay, FaStar } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import { GenreContext } from "../context/GenreContext";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { getGenreNames } = useContext(GenreContext);
  const navigate = useNavigate();

  if (!movie) return null;

  // ✅ Robust media type detection
  const isTV =
    movie.media_type === "tv" ||
    movie.media_type === "series" ||
    Boolean(movie.first_air_date) ||
    (movie.origin_country?.includes("JP") || movie.genre_ids?.includes(16));

  const mediaType = isTV ? "tv" : "movie";
  const linkPath = isTV ? `/series/${movie.id}` : `/movie/${movie.id}`;

  const genre = getGenreNames(movie.genre_ids || []);
  const year =
    movie.release_date?.slice(0, 4) ||
    movie.first_air_date?.slice(0, 4) ||
    "N/A";
  const rating = (movie.vote_average ?? movie.rating ?? 0).toFixed(1);

  const posterUrl =
    movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : movie.poster
      ? movie.poster
      : "https://via.placeholder.com/300x450?text=No+Image";

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(linkPath, {
      state: {
        movie: { ...movie, media_type: mediaType },
        mediaType,
      },
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative flex-none w-full cursor-pointer"
      onClick={handlePlay}
    >
      {/* Poster */}
      <img
        src={posterUrl}
        alt={movie.title || movie.name}
        className="w-full h-48 md:h-64 object-cover rounded-md"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
        }}
      />

      {/* Hover Overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-md"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <button
          onClick={handlePlay}
          className="bg-cinema-red bg-opacity-80 p-3 rounded-full hover:bg-opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-cinema-red"
          aria-label={`View details for ${movie.title || movie.name}`}
        >
          <FaPlay className="text-white text-3xl md:text-4xl" />
        </button>
      </motion.div>

      {/* Info */}
      <div className="mt-2">
        <h3
          className={`text-sm md:text-lg font-semibold truncate ${
            isDarkMode ? "text-white" : "text-cinema-text"
          }`}
        >
          {movie.title || movie.name || "Untitled"}
        </h3>
        <p className="text-xs text-gray-400">{year}</p>

        {/* Rating */}
        <div className="flex items-center text-xs mt-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={
                i < Math.round(rating / 2)
                  ? "text-cinema-gold"
                  : "text-gray-600"
              }
            />
          ))}
          <span className="ml-1 text-gray-400">{rating}/10</span>
        </div>

        {/* Genres */}
        <p className="text-xs text-gray-400 mt-1">{genre}</p>
      </div>
    </motion.div>
  );
};

export default MovieCard;