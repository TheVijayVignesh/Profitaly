import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../lib/firebase';

/**
 * Get user's theme preference from Firebase
 * @param {string} uid - User ID
 * @returns {Promise<string>} Theme ID or default 'tokyo-night'
 */
export const getUserThemeFromFirebase = async (uid) => {
  if (!uid) return 'tokyo-night';
  
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? docSnap.data().theme || 'tokyo-night' : 'tokyo-night';
  } catch (error) {
    console.error('Error getting user theme:', error);
    return 'tokyo-night'; // Default to tokyo-night on error
  }
};

/**
 * Save user's theme preference to Firebase
 * @param {string} uid - User ID
 * @param {string} themeId - Theme identifier
 * @returns {Promise<void>}
 */
export const setUserTheme = async (uid, themeId) => {
  if (!uid) return;
  
  try {
    await updateDoc(doc(db, 'users', uid), {
      theme: themeId,
      updatedAt: new Date()
    });
    console.log('Theme preference saved');
  } catch (error) {
    console.error('Error saving user theme:', error);
  }
};

/**
 * Apply theme to document by setting CSS variables and a theme class
 * @param {Object} theme - Theme object with color values and font family
 */
export const applyThemeToDocument = (theme) => {
  if (!theme) return;
  
  // Set CSS variables for colors and fonts
  Object.entries(theme).forEach(([key, value]) => {
    if (typeof value === 'string' && key !== 'name' && key !== 'id') {
      document.documentElement.style.setProperty(`--theme-${key}`, value);
    }
  });
  
  // Remove any existing theme classes
  const existingThemeClasses = Array.from(document.documentElement.classList).filter(cls => cls.startsWith('theme-'));
  existingThemeClasses.forEach(cls => document.documentElement.classList.remove(cls));
  
  // Add the new theme class
  document.documentElement.classList.add(`theme-${theme.id}`);
}; 