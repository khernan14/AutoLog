import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../../services/AuthServices"; // Asegúrate de que la ruta sea correcta
import { STORAGE_KEYS } from "../../config/variables"; // Asegúrate de que la ruta sea correcta
import LoginForm from "../../components/Login/LoginForm"; // Asegúrate de que la ruta sea correcta
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { restoreSessionFromStorage } = useAuth();

  // 👇 leemos ?redirect= de la URL (si viene de QR o sesión expirada)
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect"); // puede ser null

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await login(credentials.username, credentials.password);

      // --- CONSOLE.LOG PARA DEPURAR (mantener para futuras depuraciones) ---
      console.log("Respuesta completa del servicio de login:", data);

      // Verificamos que el backend devolvió token y rol
      if (!data?.token || !data?.rol) {
        throw new Error(
          "Credenciales inválidas o datos de usuario incompletos."
        );
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

      // Reconstruir sesión en el contexto
      restoreSessionFromStorage();

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión correctamente.",
        icon: "success",
        confirmButtonColor: "#03624C",
      }).then(() => {
        // 👇 PRIORIDAD 1: si hay redirect (QR o sesión expirada) volvemos allí
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
          return;
        }

        // 👇 PRIORIDAD 2: flujo normal -> por rol
        redirectByRole(data.rol);
      });
    } catch (error) {
      console.error("Login error (en catch):", error); // Log para depuración
      Swal.fire(
        "Error",
        error.message || "Correo o contraseña incorrectos.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (rol) => {
    const routes = {
      Admin: "/admin/home",
      Supervisor: "/admin/home",
      Empleado: "/admin/panel-vehiculos",
      default: "/admin/panel-vehiculos",
    };
    navigate(routes[rol] || routes.default);
  };

  const handleForgotPassword = () => {
    navigate("/auth/forgot-password");
  };

  return (
    <LoginForm
      credentials={credentials}
      setCredentials={setCredentials}
      onSubmit={handleLogin}
      loading={loading}
      onForgotPassword={handleForgotPassword}
    />
  );
}
