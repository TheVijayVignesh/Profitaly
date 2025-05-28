import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthData {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, password: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): AuthData => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  // Sign up with email/password
  const signup = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "An error occurred during sign up.";

      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = "Email address is already in use.";
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = "Email address is invalid.";
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email/password
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "An error occurred during login.";

      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = "Email address is invalid.";
      } else if (errorCode === 'auth/user-disabled') {
        errorMessage = "This account has been disabled.";
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      setError("An error occurred during Google login.");
      console.error("Google sign-in error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
    } catch (error: any) {
      setError("An error occurred during logout.");
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = "An error occurred during password reset.";

      if (errorCode === 'auth/invalid-email') {
        errorMessage = "Email address is invalid.";
      } else if (errorCode === 'auth/user-not-found') {
        errorMessage = "No user found with this email address.";
      }

      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    clearError,
  };
};

export default useAuth; 