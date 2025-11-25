import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SearchProvider } from "./context/SearchContext";
import { GenreProvider } from "./context/GenreContext";
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import Navbar from "./components/Navbar";
import GlobalPlayer from "./components/GlobalPlayer";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import SeriesPage from "./pages/SeriesPage";
import AnimePage from "./pages/AnimePage";
import IndianPage from "./pages/IndianPage";
import SeriesDetails from "./pages/SeriesDetailsPage";
import SearchPage from "./pages/SearchPage";
import AdminDashboard from "./pages/AdminDashboard";
import AuthModal from "./components/AuthModal";

function App() {
  return (
    <ThemeProvider>
      <GenreProvider>
        <SearchProvider>
          <AuthProvider>
            <PlayerProvider>
              <Router>
                <AnalyticsLogger />
                <div className="min-h-screen w-full bg-cinema-black text-white">
                  <Navbar />
                  <Routes>
                    {/* Home */}
                    <Route path="/" element={<HomePage />} />

                    {/* Categories */}
                    <Route path="/series" element={<SeriesPage />} />
                    <Route path="/anime" element={<AnimePage />} />
                    <Route path="/indian" element={<IndianPage />} />
                    <Route path="/:category" element={<CategoryPage />} />

                    {/* Details Pages */}
                    <Route path="/movie/:id" element={<MovieDetailsPage />} />
                    <Route path="/tv/:id" element={<MovieDetailsPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/series/:id" element={<SeriesDetails />} />

                    {/* Auth & Admin */}
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                  <GlobalPlayer />
                  <AuthModal />
                </div>
              </Router>
            </PlayerProvider>
          </AuthProvider>
        </SearchProvider>
      </GenreProvider>
    </ThemeProvider>
  );
}

// Helper component to log analytics
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AnalyticsLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const logVisit = async () => {
      try {
        await supabase.from('analytics').insert({
          page_path: location.pathname,
          visitor_id: localStorage.getItem('visitor_id') || 'anon'
        });
      } catch (e) {
        console.error('Analytics error:', e);
      }
    };
    logVisit();
  }, [location]);

  return null;
};

export default App;