import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MovieModal = ({ movie, isOpen, onClose }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [isTrailerLoading, setIsTrailerLoading] = useState(false);
  const [error, setError] = useState(null);

  const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

  const fetchFromTMDB = async (endpoint) => {
    const res = await fetch(`https://api.themoviedb.org/3/${endpoint}`, {
      headers: {
        Authorization: TMDB_TOKEN ? `Bearer ${TMDB_TOKEN}` : "",
        accept: "application/json",
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`TMDB ${res.status}: ${txt || res.statusText}`);
    }
    return res.json();
  };

  useEffect(() => {
    if (movie && isOpen) {
      fetchTrailer();
    }
  }, [movie, isOpen]);

  const fetchTrailer = async () => {
    if (!movie?.id) return;

    try {
      setIsTrailerLoading(true);
      setError(null);

      // Determine correct media type for trailer API
      let mediaType = "movie"; // default
      if (movie.media_type === "tv" || movie.first_air_date) {
        mediaType = "tv";
      } else if (movie.media_type === "anime") {
        mediaType = "tv"; // Anime are categorized under TV in TMDB
      }

      const videoData = await fetchFromTMDB(
        `${mediaType}/${movie.id}/videos?language=en-US`
      );

      console.log("Trailer API response:", videoData);

      const videos = videoData.results || [];
      const trailer =
        videos.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official
        ) ||
        videos.find(
          (video) => video.site === "YouTube" && video.type === "Trailer"
        );

      setTrailerKey(trailer ? trailer.key : null);
    } catch (err) {
      console.error("Error fetching trailer:", err);
      setError("Failed to load trailer");
    } finally {
      setIsTrailerLoading(false);
    }
  };

  if (!movie || !isOpen) return null;

  const handleClose = () => {
    setTrailerKey(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-7xl h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.2 }}
              onClick={handleClose}
              className="absolute top-4 right-4 text-white text-2xl hover:text-cinema-red transition-colors z-50"
            >
              ✕
            </motion.button>

            <div className="w-full h-full">
              {isTrailerLoading ? (
                <div className="flex justify-center items-center w-full h-full bg-black">
                  <p className="animate-pulse text-white text-lg">
                    Loading trailer...
                  </p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center w-full h-full bg-black text-cinema-red text-lg">
                  Failed to load trailer. Please try again.
                </div>
              ) : trailerKey ? (
                <motion.div
                  className="w-full h-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Movie Trailer"
                  />
                </motion.div>
              ) : (
                <div className="flex justify-center items-center w-full h-full bg-black text-cinema-red text-lg">
                  No Trailer Available
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieModal;
