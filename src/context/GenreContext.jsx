import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const GenreContext = createContext();

const GenreProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          'https://api.themoviedb.org/3/genre/movie/list?language=en-US',
          {
            headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}` },
          }
        );
        setGenres(response.data.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
        setError('Failed to load genres'); // Can hook to a toast later
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const getGenreNames = (genreIds) => {
    if (loading || error) return error || 'Loading...';
    return genreIds?.map(id => genres.find(g => g.id === id)?.name).filter(Boolean).join(', ') || 'N/A';
  };

  return (
    <GenreContext.Provider value={{ genres, getGenreNames, loading, error }}>
      {children}
    </GenreContext.Provider>
  );
};

export { GenreContext, GenreProvider };