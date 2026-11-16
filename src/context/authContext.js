
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const AuthContext = createContext(null);

const AUTH_KEY = "konfizAuth";

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login
  const login = (userData) => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  // Synchronize other browser tabs
  useEffect(() => {

    const handleStorage = (event) => {

      if (event.key === AUTH_KEY || event.key === null) {

        try {
          const saved = localStorage.getItem(AUTH_KEY);
          setUser(saved ? JSON.parse(saved) : null);
        } catch {
          setUser(null);
        }

      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
