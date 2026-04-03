// Mock authentication hook - always returns null user (no authentication required)
export const useAuth = () => {
  return {
    currentUser: null,
    user: null,
    login: async () => { throw new Error("Authentication not available") },
    signup: async () => { throw new Error("Authentication not available") },
    signInWithGoogle: async () => { throw new Error("Authentication not available") },
    logout: async () => {},
    resetPassword: async () => { throw new Error("Authentication not available") },
    updateUserProfile: async () => {},
    loading: false
  };
};
