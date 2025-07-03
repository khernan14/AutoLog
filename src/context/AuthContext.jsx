import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "../config/variables"; // Asegúrate de importar esto

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  });

  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token || isExpired(token)) {
      setIsSessionExpired(true);
    }
    setCheckingSession(false);
  }, []);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setIsSessionExpired(false);
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSessionExpired,
        setIsSessionExpired,
        logout,
        checkingSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const isExpired = (token) => {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
