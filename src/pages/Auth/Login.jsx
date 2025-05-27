import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Actualización
import Swal from "sweetalert2";
import { login } from "../../services/AuthServices";
import { STORAGE_KEYS } from "../../config/variables";
import LoginForm from "@components/Login/LoginForm";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate(); // <-- Reemplaza window.location
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    setLoading(true);
    try {
      const data = await login(credentials.username, credentials.password);

      if (!data?.token || !data?.rol) {
        throw new Error("Credenciales inválidas");
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión correctamente.",
        icon: "success",
        confirmButtonColor: "#03624C",
      }).then(() => {
        redirectByRole(data.rol);
      });
    } catch (error) {
      Swal.fire("Error", "Correo o contraseña incorrectos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (rol) => {
    const routes = {
      Admin: "/admin/home",
      Supervisor: "/admin/home",
      default: "/admin/panel-vehiculos",
    };
    navigate(routes[rol] || routes.default); // <-- Usa navigate
  };

  return (
    <LoginForm
      credentials={credentials}
      setCredentials={setCredentials}
      onSubmit={handleLogin}
      loading={loading}
    />
  );
}
