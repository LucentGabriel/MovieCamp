import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useContext } from 'react';
import { FaSearch, FaUserCircle } from 'react-icons/fa';

import SearchBar from './SearchBar';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, logout, toggleAuthModal } = useContext(AuthContext);

  console.log('Navbar render. User:', user);

  const location = useLocation();

  // ✅ Define paths where navbar should be transparent
  const transparentNavPaths = ['/', '/series', '/indian', '/anime'];
  const isTransparentNav = transparentNavPaths.includes(location.pathname);

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
    <div
      className={`w-full z-50 transition-all duration-300 ${isTransparentNav
        ? 'fixed top-0 bg-transparent bg-gradient-to-b from-black/80 to-transparent'
        : 'sticky top-0 bg-cinema-black shadow-md'
        }`}
    >
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
            {/* <img src="/logo.jpg" alt="MovieCamp Logo" className="h-8 w-auto mr-2 rounded" /> */}
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
                `text-white hover:text-cinema-red transition-colors duration-300 ${isActive ? 'text-cinema-red font-semibold' : ''
                }`
              }
            >
              <motion.span whileHover={{ scale: 1.05 }} className="block">
                {item.name}
              </motion.span>
            </NavLink>
          ))}
        </div>

        {/* ✅ Right: Search & Auth */}
        <div className="flex items-center space-x-4">
          {/* ✅ Search Bar (Desktop) - Right Side */}
          <div className="hidden md:block w-64 lg:w-80 mr-4">
            <SearchBar />
          </div>

          <button
            className="md:hidden text-white text-xl"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Toggle search"
          >
            <FaSearch />
          </button>

          {/* ✅ Auth Buttons */}
          <div className="hidden md:flex items-center ml-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <NavLink to="/admin" className="text-gray-300 hover:text-white text-sm font-semibold">
                    Admin
                  </NavLink>
                )}
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-400 text-xl" />
                  <span className="text-sm text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={toggleAuthModal}
                className="bg-cinema-red hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition"
              >
                Sign In
              </button>
            )}
          </div>
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

      {/* ✅ Category Menu */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-center overflow-x-auto space-x-4 scrollbar-hide whitespace-nowrap"
        style={{ transform: 'translateX(-6%)' }}
      >
        {categories.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `text-white hover:text-cinema-red transition-colors duration-300 ${isActive ? 'text-cinema-red font-semibold' : ''
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
            {/* Navigation Items */}
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={toggleMobileMenu}
                className={({ isActive }) =>
                  `block py-3 text-white hover:text-cinema-red transition-colors duration-300 ${isActive ? 'text-cinema-red font-semibold' : ''
                  }`
                }
              >
                <motion.span whileHover={{ scale: 1.05 }} className="block">
                  {item.name}
                </motion.span>
              </NavLink>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-700 my-3"></div>

            {/* Auth Section */}
            {user ? (
              <div className="space-y-3">
                {/* User Profile */}
                <div className="flex items-center gap-3 py-2">
                  <FaUserCircle className="text-gray-400 text-2xl" />
                  <div>
                    <p className="text-white font-semibold">{user.name}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </div>

                {/* Admin Link */}
                {user.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={toggleMobileMenu}
                    className="block py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">Admin Dashboard</span>
                  </NavLink>
                )}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-md font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  toggleAuthModal();
                  toggleMobileMenu();
                }}
                className="w-full bg-cinema-red hover:bg-red-700 text-white px-4 py-3 rounded-md font-bold transition-colors"
              >
                Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;