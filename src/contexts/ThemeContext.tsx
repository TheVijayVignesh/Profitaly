import { createContext, useState, useEffect, useContext } from 'react';

interface Theme {
  background: string;
  foreground: string;
  accent: string;
  card: string;
  success: string;
  error: string;
  warning: string;
  border: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  fontFamily: string;
}

const defaultTheme: Theme = {
  background: '#1a1b26',
  foreground: '#c0caf5',
  accent: '#7aa2f7',
  card: '#24283b',
  success: '#9ece6a',
  error: '#f7768e',
  warning: '#e0af68',
  border: '#30374b',
  muted: '#414868',
  mutedForeground: '#565f89',
  primary: '#7aa2f7',
  primaryForeground: '#1a1b26',
  fontFamily: "'Inter', sans-serif"
};

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  changeTheme: (id: string) => void;
  isLoading: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  themeId: 'tokyo-night',
  changeTheme: () => {},
  isLoading: false
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeId, setThemeId] = useState('tokyo-night');
  const [theme, setTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme whenever it changes
  useEffect(() => {
    // Set CSS variables
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--theme-${key}`, value);
    });
    
    // Set theme class
    document.documentElement.className = `theme-${themeId}`;
    
    // Save to localStorage
    localStorage.setItem('theme', themeId);
  }, [theme, themeId]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setThemeId(savedTheme);
    }
  }, []);

  const changeTheme = (id: string) => {
    setThemeId(id);
    // For now, just use the default theme
    // In a real app, you'd have a themes object
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, changeTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
