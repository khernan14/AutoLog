// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token"); // o tu método de auth
        // Simulamos validación
        if (!token || isExpired(token)) {
          setIsSessionExpired(true);
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
    localStorage.removeItem("token");
    setIsSessionExpired(false); // 👈 Esto oculta el overlay
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
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
    return decoded.exp * 1000 < Date.now(); // JWT
  } catch {
    return true;
  }
};
