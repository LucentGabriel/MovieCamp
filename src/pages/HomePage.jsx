import React, { useEffect, useContext, useState, lazy, Suspense } from 'react';
import { supabase } from '../supabaseClient';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import MovieCard from '../components/MovieCard';

const MovieRow = lazy(() => import('../components/MovieRow'));

const HomePage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playVideo } = usePlayer();
  const navigate = useNavigate();

  const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  const [featured, setFeatured] = useState(null);
  const [error, setError] = useState(null);

  // ---- Fetch random featured movie ----
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('https://api.themoviedb.org/3/trending/movie/week', {
          headers: {
            Authorization: TMDB_TOKEN ? `Bearer ${TMDB_TOKEN}` : '',
            accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch trending movies');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const random = data.results[Math.floor(Math.random() * data.results.length)];
          setFeatured(random);
        } else {
          throw new Error('No movies found');
        }
      } catch (err) {
        console.error('Error fetching featured:', err);
        setError(err.message);
      }
    };
    fetchFeatured();
  }, [TMDB_TOKEN]);

  const handleWatchNow = async () => {
    if (!featured) return;

    try {
      const { data, error } = await supabase
        .from('movie_links')
        .select('video_url')
        .eq('tmdb_id', String(featured.id))
        .single();

      if (error) {
        console.error('Error fetching video URL:', error);
      }

      if (data?.video_url) {
        playVideo(data.video_url);
      } else {
        console.log('No video URL found for this movie.');
        playVideo('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  // ---- Navigate to correct details page ----
  const handleCardClick = (movie) => {
    if (!movie) return;

    const isTV =
      movie.media_type === 'tv' ||
      movie.media_type === 'series' ||
      Boolean(movie.first_air_date) ||
      (movie.origin_country?.includes('JP') || movie.genre_ids?.includes(16));

    const mediaType = isTV ? 'tv' : 'movie';
    const path = isTV ? `/series/${movie.id}` : `/movie/${movie.id}`;

    navigate(path, {
      state: {
        movie: { ...movie, media_type: mediaType },
        mediaType,
      },
    });
  };

  const categories = [
    { title: 'New Movies', fetchType: 'now_playing' },
    { title: 'Popular Movies', fetchType: 'popular' },
    { title: 'Top Rated Movies', fetchType: 'top_rated' },
    { title: 'Upcoming Movies', fetchType: 'upcoming' },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-cinema-black text-white' : 'bg-white text-cinema-text'
        }`}
    >
      {/* ---- FEATURED HERO SECTION ---- */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex items-end"
        style={{
          backgroundImage: featured?.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${featured.backdrop_path})`
            : 'linear-gradient(to bottom, #000000, #1a1a1a)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div
          className="relative z-10 p-4 sm:p-6 md:p-10 max-w-3xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            {featured?.title || 'No Featured Movie'}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base line-clamp-3 mb-5">
            {featured?.overview ||
              (error ? `⚠️ ${error}` : 'Fetching trending movie details...')}
          </p>
          {featured && (
            <button
              onClick={handleWatchNow}
              className="bg-cinema-red hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-md font-semibold transition text-sm sm:text-base min-h-[44px]"
            >
              Watch Now
            </button>
          )}
        </div>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Movie Categories */}
        {categories.map((category) => (
          <Suspense
            key={category.fetchType}
            fallback={
              <div
                className={`text-center ${isDarkMode ? 'text-white' : 'text-cinema-text'
                  }`}
              >
                Loading {category.title}...
              </div>
            }
          >
            <MovieRowWrapper
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

// ---- Lazy Wrapper ----
const MovieRowWrapper = ({ title, fetchType, onCardClick }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView ? (
        <MovieRow title={title} fetchType={fetchType} onCardClick={onCardClick} />
      ) : (
        <div className="h-40" />
      )}
    </div>
  );
};

export default HomePage;