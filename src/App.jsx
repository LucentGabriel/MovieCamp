import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SearchProvider } from "./context/SearchContext";
import { GenreProvider } from "./context/GenreContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import SeriesPage from "./pages/SeriesPage";
import AnimePage from "./pages/AnimePage";
import IndianPage from "./pages/IndianPage";
import SeriesDetails from "./pages/SeriesDetailsPage";

function App() {
  return (
    <ThemeProvider>
      <GenreProvider>
        <SearchProvider>
          <Router>
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
                <Route path="/series/:id" element={<SeriesDetails />} />
              </Routes>
            </div>
          </Router>
        </SearchProvider>
      </GenreProvider>
    </ThemeProvider>
  );
}

export default App;