// src/pages/Auth/Login.jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../../services/AuthServices";
import LoginForm from "../../components/Login/LoginForm";
import TwoFactorVerifyModal from "../../components/Login/TwoFactorVerifyModal"; // Importar el nuevo modal
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado para el 2FA
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [verifying2FA, setVerifying2FA] = useState(false);

  const { setUser, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  // Esta función maneja el éxito del login (ya sea directo o post-2FA)
  const handleLoginSuccess = async (roleData) => {
    try {
      // Espera que /auth/me confirme la sesión y actualice el contexto
      const serverUser = await refreshUser();
      if (!serverUser) throw new Error("No se pudo restaurar la sesión.");

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Has iniciado sesión correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
          return;
        }
        redirectByRole(serverUser.rol || roleData);
      });
    } catch (error) {
      console.error("Session refresh error:", error);
      Swal.fire("Error", "Error al establecer la sesión.", "error");
    }
  };

  // Login inicial (paso 1)
  const handleLogin = async () => {
    setLoading(true);
    try {
      // Enviamos solo usuario y contraseña
      const data = await login(credentials.username, credentials.password);

      // CASO A: El backend pide 2FA
      if (data.require_2fa) {
        setLoading(false);
        setShow2FAModal(true); // Abrimos el modal
        return;
      }

      // CASO B: Login directo exitoso
      if (!data || !data.rol) {
        throw new Error("Credenciales inválidas o datos incompletos.");
      }
      await handleLoginSuccess(data.rol);
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire(
        "Error",
        error?.message || "Usuario o contraseña incorrectos.",
        "error"
      );
    } finally {
      if (!show2FAModal) setLoading(false); // Solo quitamos loading si no abrimos modal
    }
  };

  // Verificación del código 2FA (paso 2)
  const handleVerify2FA = async (code) => {
    setVerifying2FA(true);
    try {
      // Llamamos al mismo endpoint de login pero AHORA con el código
      const data = await login(
        credentials.username,
        credentials.password,
        code
      );

      if (!data || !data.rol) {
        throw new Error("Código incorrecto o expirado.");
      }

      // Si pasa, cerramos modal y procedemos al éxito
      setShow2FAModal(false);
      await handleLoginSuccess(data.rol);
    } catch (error) {
      // Si falla el código, mostramos error pero mantenemos el modal abierto para reintentar
      Swal.fire({
        title: "Error",
        text: error?.message || "Código incorrecto",
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setVerifying2FA(false);
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
    <>
      <LoginForm
        credentials={credentials}
        setCredentials={setCredentials}
        onSubmit={handleLogin}
        loading={loading}
        onForgotPassword={handleForgotPassword}
      />

      {/* Modal de 2FA */}
      <TwoFactorVerifyModal
        open={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onVerify={handleVerify2FA}
        loading={verifying2FA}
      />
    </>
  );
}
