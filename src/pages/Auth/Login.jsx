import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await login(credentials.username, credentials.password);

      // --- CONSOLE.LOG PARA DEPURAR (mantener para futuras depuraciones) ---
      console.log("Respuesta completa del servicio de login:", data);

      // --- CAMBIO CLAVE 1: Verificar si existen 'token' y 'rol' (o 'id', 'nombre' como indicador de datos de usuario) ---
      // Antes: if (!data?.token || !data?.user) {
      if (!data?.token || !data?.rol) {
        // Se verifica 'rol' directamente en 'data'
        throw new Error(
          "Credenciales inválidas o datos de usuario incompletos."
        );
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      // --- CAMBIO CLAVE 2: Guardar el objeto 'data' completo como el usuario ---
      // Antes: localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

      // 👈 Aquí agrega la llamada a restoreSessionFromStorage
      restoreSessionFromStorage();

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión correctamente.",
        icon: "success",
        confirmButtonColor: "#03624C",
      }).then(() => {
        // --- CAMBIO CLAVE 3: Acceder a 'rol' directamente desde 'data' ---
        // Antes: redirectByRole(data.user.rol);
        redirectByRole(data.rol);
      });
    } catch (error) {
      console.error("Login error (en catch):", error); // Log para depuración
      Swal.fire(
        "Error",
        error.message || "Correo o contraseña incorrectos.",
        "error"
      ); // Muestra el mensaje de error si existe
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

  // --- CAMBIO CLAVE AQUÍ: Navegar a la página de solicitud de restablecimiento ---
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
