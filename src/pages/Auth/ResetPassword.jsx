import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Sheet,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/joy";
import { useSearchParams, useNavigate } from "react-router-dom";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"; // Icono de flecha para regresar
import { restablecerContrasenia } from "../../services/AuthServices"; // Asegúrate de que la ruta sea correcta

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Obtener el token de la URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificar si el token está presente al cargar la página
  useEffect(() => {
    if (!token) {
      setError(
        "Token de restablecimiento no encontrado en la URL. Por favor, solicita un nuevo enlace."
      );
    }
  }, [token]); // Se ejecuta solo cuando el token cambia

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setLoading(true);
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Token de restablecimiento inválido o faltante.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      // Ejemplo de validación mínima de contraseña
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // Llama al servicio de frontend para restablecer la contraseña
      const response = await restablecerContrasenia(token, newPassword);
      setMessage(response.message || "Contraseña restablecida exitosamente.");
      // Redirigir al login después de un breve retraso si fue exitoso
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000); // Redirige después de 3 segundos para que el usuario lea el mensaje
    } catch (err) {
      console.error("Error al restablecer contraseña:", err);
      setError(
        err.message ||
          "Error al restablecer la contraseña. El token podría ser inválido o haber expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.body",
        p: 2,
        position: "relative", // Para posicionar el botón de regreso
      }}>
      {/* Botón de Regresar al Login */}
      <IconButton
        aria-label="Volver al inicio de sesión"
        onClick={() => navigate("/auth/login")}
        variant="outlined"
        color="neutral"
        size="lg"
        sx={{
          position: "absolute",
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
          borderRadius: "lg",
          zIndex: 10,
        }}>
        <ArrowBackRoundedIcon />
      </IconButton>

      <Sheet
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: "lg",
          boxShadow: "xl",
          maxWidth: "400px",
          width: "100%",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
        }}>
        <Typography
          level="h2"
          sx={{ mb: 1, fontWeight: "xl", color: "primary.plainColor" }}>
          Restablecer Contraseña
        </Typography>
        <Typography
          level="body-md"
          textAlign="center"
          sx={{ mb: 2, color: "text.secondary" }}>
          Ingresa tu nueva contraseña.
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Input
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              size="lg"
              startDecorator={<LockRoundedIcon />}
              endDecorator={
                <IconButton
                  aria-label="toggle new password visibility"
                  onClick={togglePasswordVisibility}
                  edge="end"
                  variant="plain"
                  color="neutral">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              }
              sx={{ borderRadius: "md" }}
            />
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              size="lg"
              startDecorator={<LockRoundedIcon />}
              endDecorator={
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={toggleConfirmPasswordVisibility}
                  edge="end"
                  variant="plain"
                  color="neutral">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              }
              sx={{ borderRadius: "md" }}
            />
            <Button
              type="submit"
              size="lg"
              variant="solid"
              color="primary"
              loading={loading}
              sx={{ borderRadius: "xl", fontWeight: "lg" }}>
              Restablecer Contraseña
            </Button>
          </Stack>
        </form>

        {loading && <CircularProgress size="sm" sx={{ mt: 2 }} />}

        {message && (
          <Alert color="success" variant="soft" sx={{ mt: 2, width: "100%" }}>
            <Typography level="body-md">{message}</Typography>
          </Alert>
        )}

        {error && (
          <Alert color="danger" variant="soft" sx={{ mt: 2, width: "100%" }}>
            <Typography level="body-md">{error}</Typography>
          </Alert>
        )}
      </Sheet>
    </Box>
  );
}
