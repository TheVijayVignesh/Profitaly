import { createContext, useState, useEffect, useContext } from 'react';
import { themes } from '../themes';
import { getUserThemeFromFirebase, setUserTheme, applyThemeToDocument } from '../utils/themeUtils';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext

export const ThemeContext = createContext({
  theme: themes['tokyo-night'],
  themeId: 'tokyo-night',
  changeTheme: () => {},
  isLoading: true
});

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth(); // Get current user from AuthContext
  const [themeId, setThemeId] = useState('tokyo-night');
  const [theme, setTheme] = useState(themes['tokyo-night']);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's theme preference from Firebase when they log in
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user?.uid) {
        setIsLoading(true);
        try {
          const savedThemeId = await getUserThemeFromFirebase(user.uid);
          if (savedThemeId && themes[savedThemeId]) {
            setThemeId(savedThemeId);
            setTheme(themes[savedThemeId]);
          }
        } catch (error) {
          console.error('Error loading user theme:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no user, check for theme in localStorage
        const localTheme = localStorage.getItem('theme');
        if (localTheme && themes[localTheme]) {
          setThemeId(localTheme);
          setTheme(themes[localTheme]);
        }
        setIsLoading(false);
      }
    };

    loadUserTheme();
  }, [user]);

  // Apply theme whenever it changes
  useEffect(() => {
    applyThemeToDocument(theme);
    
    // Also save to localStorage for non-logged-in users
    localStorage.setItem('theme', themeId);
    
    // Ensure theme applies to dynamically loaded content
    const enforceTheme = () => {
      document.querySelectorAll('*').forEach(element => {
        element.style.fontFamily = `var(--theme-fontFamily)`;
        element.style.color = `var(--theme-foreground)`;
        element.style.backgroundColor = `var(--theme-background)`;
        element.style.borderColor = `var(--theme-border)`;
      });
      // Additional focus on text elements for font color
      document.querySelectorAll('p, span, div, a, button, input, textarea, select, option, label, h1, h2, h3, h4, h5, h6, li, th, td').forEach(element => {
        element.style.color = `var(--theme-foreground)`;
      });
    };
    
    enforceTheme();
    window.addEventListener('load', enforceTheme);
    const observer = new MutationObserver(enforceTheme);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('load', enforceTheme);
      observer.disconnect();
    };
  }, [theme, themeId]);

  // Function to change themes
  const changeTheme = (id) => {
    if (!themes[id]) {
      console.error(`Theme "${id}" not found!`);
      return;
    }
    
    setTheme(themes[id]);
    setThemeId(id);
    
    // Save theme preference to Firebase if user is logged in
    if (user?.uid) {
      setUserTheme(user.uid, id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, changeTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context
export const useTheme = () => useContext(ThemeContext); 