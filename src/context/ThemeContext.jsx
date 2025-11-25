import { createContext } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  // Always true for dark mode
  const isDarkMode = true;

  // No-op function since we are enforcing dark mode
  const toggleTheme = () => { };

  // Ensure dark class is always on html
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };