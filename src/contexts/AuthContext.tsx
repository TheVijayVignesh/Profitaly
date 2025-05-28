import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  UserCredential,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import authService from '@/services/authService';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string): Promise<UserCredential> {
    const result = await authService.loginWithEmailPassword(email, password);
    if (!result.success) {
      throw new Error(result.error?.message || 'Login failed');
    }
    return { user: result.user } as UserCredential;
  }

  async function signup(email: string, password: string): Promise<UserCredential> {
    const result = await authService.signupWithEmailPassword(email, password);
    if (!result.success) {
      throw new Error(result.error?.message || 'Signup failed');
    }
    return { user: result.user } as UserCredential;
  }

  async function signInWithGoogle() {
    const result = await authService.signInWithGoogle();
    if (!result.success) {
      throw new Error(result.error?.message || 'Google sign-in failed');
    }
    return result;
  }

  async function logout(): Promise<void> {
    const result = await authService.logout();
    if (!result.success) {
      throw new Error(result.error?.message || 'Logout failed');
    }
  }
  
  async function resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
  
  async function updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    if (!auth.currentUser) {
      const error = new Error('No user is currently signed in');
      console.error('Profile update error:', error);
      return Promise.reject(error);
    }
    
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: photoURL || auth.currentUser.photoURL
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
