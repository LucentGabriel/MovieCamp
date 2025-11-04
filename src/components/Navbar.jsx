import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useContext } from 'react';
import { FaSearch } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // ✅ Main top-level navigation items
  const navItems = [
    { name: 'Movies', path: '/' },
    { name: 'Series', path: '/series' },
    { name: 'Indian', path: '/indian' },
    { name: 'Anime', path: '/anime' },
  ];

  // ✅ Scrollable category filters (below main nav)
  const categories = [
    { name: 'All', path: '/all' },
    { name: 'New', path: '/new' },
    { name: 'Popular', path: '/popular' },
    { name: 'Top Rated', path: '/top_rated' },
    { name: 'Upcoming', path: '/upcoming' },
    { name: 'Action', path: '/action' },
    { name: 'Horror', path: '/horror' },
    { name: 'Comedy', path: '/comedy' },
  ];

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="bg-cinema-black text-white sticky top-0 z-10 shadow-md">
      {/* ✅ Top Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center">
          <button
            className="md:hidden text-white text-2xl mr-4"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            ☰
          </button>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-2xl font-bold text-cinema-red flex items-center"
          >
            <img src="/logo.jpg" alt="MovieCamp Logo" className="h-8 w-auto mr-2 rounded" />
            MovieCamp
          </motion.div>
        </div>

        {/* ✅ Center: Main Navigation (Desktop) */}
        <div className="hidden md:flex flex-1 justify-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-white hover:text-cinema-red transition-colors duration-300 ${
                  isActive ? 'text-cinema-red font-semibold' : ''
                }`
              }
            >
              <motion.span whileHover={{ scale: 1.05 }} className="block">
                {item.name}
              </motion.span>
            </NavLink>
          ))}
        </div>

        {/* ✅ Right: Search + Theme */}
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Toggle search"
          >
            <FaSearch />
          </button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-cinema-gray text-white hover:bg-cinema-red transition-colors duration-300"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </motion.button>
        </div>
      </nav>

      {/* ✅ Mobile Search Bar */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 pb-4"
          >
            <SearchBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Desktop Search Bar */}
      <div className="hidden md:block max-w-lg mx-auto px-4 py-2">
        <SearchBar />
      </div>

      {/* ✅ Category Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-center overflow-x-auto space-x-4 scrollbar-hide whitespace-nowrap">
        {categories.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `text-white hover:text-cinema-red transition-colors duration-300 ${
                isActive ? 'text-cinema-red font-semibold' : ''
              }`
            }
          >
            <motion.span whileHover={{ scale: 1.05 }} className="block">
              {item.name}
            </motion.span>
          </NavLink>
        ))}
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden bg-cinema-gray px-4 pt-2 pb-4"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={toggleMobileMenu}
                className={({ isActive }) =>
                  `block py-2 text-white hover:text-cinema-red transition-colors duration-300 ${
                    isActive ? 'text-cinema-red font-semibold' : ''
                  }`
                }
              >
                <motion.span whileHover={{ scale: 1.05 }} className="block">
                  {item.name}
                </motion.span>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;