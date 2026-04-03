import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  GoogleAuthProvider,
  User,
  UserCredential,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { upsertUserProfile } from './dbService';

// Mock user for demo purposes
const MOCK_USER = {
  uid: 'mock-user-123',
  email: 'demo@example.com',
  displayName: 'Demo User',
  photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
  emailVerified: true
};

// Flag to use mock auth instead of Firebase
// In production, always use real Firebase authentication
const USE_MOCK_AUTH = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH === 'true';

/**
 * Authentication service that handles all Firebase auth operations
 * and provides additional error handling.
 */
class AuthService {
  private mockUser: User | null = null;
  private mockAuthListeners: Array<(user: User | null) => void> = [];

  constructor() {
    if (USE_MOCK_AUTH) {
      console.log('Using mock authentication service');
    } else {
      console.log('Using Firebase authentication service');
    }
  }
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    if (USE_MOCK_AUTH) {
      return this.mockUser;
    }
    return auth.currentUser;
  }

  /**
   * Sign in with email and password
   */
  async loginWithEmailPassword(email: string, password: string) {
    if (USE_MOCK_AUTH) {
      // Simple validation
      if (!email || !password) {
        return {
          user: null,
          success: false,
          error: {
            code: 'auth/invalid-credential',
            message: 'Please provide both email and password.'
          }
        };
      }
      
      // Demo credentials check
      if (password.length < 6) {
        return {
          user: null,
          success: false,
          error: {
            code: 'auth/wrong-password',
            message: 'Password must be at least 6 characters long.'
          }
        };
      }
      
      // Create a mock user from the MOCK_USER template
      const mockUserWithEmail = { 
        ...MOCK_USER, 
        email,
        // Add necessary User methods
        getIdToken: () => Promise.resolve('mock-id-token'),
        toJSON: () => ({ ...MOCK_USER, email })
      } as unknown as User;
      
      // Set the mock user and notify listeners
      this.mockUser = mockUserWithEmail;
      this.notifyAuthStateChanged();
      
      return {
        user: mockUserWithEmail,
        success: true,
        error: null
      };
    }
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // In a real app, we might want to check if the user's email is verified
      // if (!result.user.emailVerified) {
      //   await signOut(auth);
      //   return {
      //     user: null,
      //     success: false,
      //     error: {
      //       code: 'auth/email-not-verified',
      //       message: 'Please verify your email before logging in.'
      //     }
      //   };
      // }
      
      // Log successful login for audit purposes
      console.log(`User logged in: ${result.user.email}`);
      
      return {
        user: result.user,
        success: true,
        error: null
      };
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'auth/unknown';
      return {
        user: null,
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        }
      };
    }
  }

  /**
   * Create a new user with email and password
   */
  async signupWithEmailPassword(email: string, password: string, displayName?: string) {
    if (USE_MOCK_AUTH) {
      // Simple validation
      if (!email || !password) {
        return {
          user: null,
          success: false,
          error: {
            code: 'auth/invalid-email',
            message: 'Please provide both email and password.'
          }
        };
      }
      
      if (password.length < 6) {
        return {
          user: null,
          success: false,
          error: {
            code: 'auth/weak-password',
            message: 'Password should be at least 6 characters'
          }
        };
      }
      
      // Create a mock user from the MOCK_USER template
      const mockUserWithEmail = { 
        ...MOCK_USER, 
        email,
        displayName: displayName || MOCK_USER.displayName,
        // Add necessary User methods
        getIdToken: () => Promise.resolve('mock-id-token'),
        toJSON: () => ({ ...MOCK_USER, email, displayName })
      } as unknown as User;
      
      // Set the mock user and notify listeners
      this.mockUser = mockUserWithEmail;
      this.notifyAuthStateChanged();
      
      return {
        user: mockUserWithEmail,
        success: true,
        error: null
      };
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create a user profile in Firestore
      if (result.user) {
        try {
          // Store user data in PostgreSQL via API
          await upsertUserProfile(result.user.uid, {
            email: result.user.email,
            displayName: displayName || email.split('@')[0],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
          
          // Send email verification
          await sendEmailVerification(result.user);
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      return {
        user: result.user,
        success: true,
        error: null
      };
    } catch (error: unknown) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup';
      const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'auth/unknown';
      return {
        user: null,
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        }
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    console.log('Attempting Google sign-in...');
    if (USE_MOCK_AUTH) {
      console.log('Mock auth is enabled, skipping real sign-in.');
      // Create a mock Google credential
      const mockCredential = {
        accessToken: 'mock-google-access-token',
        idToken: 'mock-google-id-token',
      };
      
      // Create a mock user with Google profile
      const mockGoogleUser = { 
        ...MOCK_USER,
        displayName: 'Google User',
        photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
        // Add necessary User methods
        getIdToken: () => Promise.resolve('mock-id-token'),
        toJSON: () => ({ ...MOCK_USER, displayName: 'Google User' })
      } as unknown as User;
      
      // Set the mock user and notify listeners
      this.mockUser = mockGoogleUser;
      this.notifyAuthStateChanged();
      
      return {
        user: mockGoogleUser,
        credential: mockCredential,
        success: true,
        error: null
      };
    }
    
    try {
      // Configure Google sign-in to request the user's ID token, email address, and basic profile
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      
      // Prevent multiple sign-in dialogs
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user?.email);
      
      // This gives you a Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      // Create or update user profile in PostgreSQL via API
      if (result.user) {
        try {
          // Always upsert the user profile
          await upsertUserProfile(result.user.uid, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoUrl: result.user.photoURL,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            provider: 'google'
          });
        } catch (profileError) {
          console.error('Error updating user profile:', profileError);
        }
      }
      
      return {
        user: result.user,
        credential,
        success: true,
        error: null
      };
    } catch (error: unknown) {
      console.error('Google sign-in failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during Google sign-in';
      const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'auth/unknown';
      return {
        user: null,
        credential: null,
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        }
      };
    }
  }

  /**
   * Sign out the current user
   */
  async logout() {
    if (USE_MOCK_AUTH) {
      // Clear the mock user and notify listeners
      this.mockUser = null;
      this.notifyAuthStateChanged();
      return { success: true, error: null };
    }
    
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: error.message || 'An error occurred during logout'
        }
      };
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    if (USE_MOCK_AUTH) {
      // Add the callback to our listeners
      this.mockAuthListeners.push(callback);
      
      // Call it immediately with the current state
      callback(this.mockUser);
      
      // Return an unsubscribe function
      return () => {
        this.mockAuthListeners = this.mockAuthListeners.filter(cb => cb !== callback);
      };
    }
    
    return auth.onAuthStateChanged(callback);
  }
  
  /**
   * Notify all mock auth listeners of state change
   */
  private notifyAuthStateChanged() {
    if (USE_MOCK_AUTH) {
      this.mockAuthListeners.forEach(callback => {
        callback(this.mockUser);
      });
    }
  }
}

export const authService = new AuthService();
export default authService; 