import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load theme from localStorage, default to dark mode (isDarkMode: true)
    const savedTheme = localStorage.getItem('theme');
    console.log('Initial theme from localStorage:', savedTheme);
    return savedTheme !== 'light';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    // Toggle 'dark' class on <html>
    document.documentElement.classList.toggle('dark', isDarkMode);
    console.log('Applied dark class:', document.documentElement.classList.contains('dark'));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      console.log('Toggling theme to:', !prev ? 'dark' : 'light');
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };