import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../../services/AuthServices";
import LoginForm from "../../components/Login/LoginForm";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setUser, refreshUser } = useAuth();

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Llamada que crea cookie httpOnly en backend
      const data = await login(credentials.username, credentials.password);

      if (!data || !data.rol) {
        throw new Error(
          "Credenciales inválidas o datos de usuario incompletos."
        );
      }

      // Espera que /auth/me confirme la sesión y actualice el contexto
      const serverUser = await refreshUser();
      if (!serverUser)
        throw new Error("No se pudo restaurar la sesión después del login.");

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión correctamente.",
        icon: "success",
        confirmButtonColor: "#03624C",
      }).then(() => {
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
          return;
        }
        redirectByRole(serverUser.rol || data.rol);
      });
    } catch (error) {
      console.error("Login error (en catch):", error);
      Swal.fire(
        "Error",
        error?.message || "Usuario o contraseña incorrectos.",
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
