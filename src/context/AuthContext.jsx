// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "@/config/variables";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState(null); // 👈 agregamos user
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (!token || isExpired(token)) {
          setIsSessionExpired(true);
        } else {
          if (storedUser) {
            setUser(JSON.parse(storedUser)); // 👈 cargamos user si existe
          }
        }
      } catch (e) {
        console.error("Error verificando sesión", e);
        setIsSessionExpired(true);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null); // 👈 limpiamos user
    setIsSessionExpired(false);
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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

// 👇 JWT expiration checker
const isExpired = (token) => {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 < Date.now(); // JWT expiration check
  } catch {
    return true;
  }
};
