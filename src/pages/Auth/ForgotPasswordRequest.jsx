import React, { useState } from "react";
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
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"; // Icono de flecha para regresar
import { sendRecoveryPassword } from "../../services/MailServices"; // Asegúrate de que la ruta sea correcta
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await sendRecoveryPassword(email);
      setMessage(
        response.message ||
          "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
    } catch (err) {
      console.error("Error al solicitar restablecimiento:", err);
      setError(
        err.message || "Error al procesar tu solicitud. Intenta más tarde."
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
        backgroundColor: "background.body", // Fondo general de la página
        p: 2, // Padding general para la página
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
        variant="outlined" // Usar outlined para un borde sutil
        sx={{
          p: { xs: 3, sm: 4 }, // Padding responsivo
          borderRadius: "lg", // Bordes redondeados
          boxShadow: "xl", // Sombra más pronunciada
          maxWidth: "400px", // Ancho máximo para el formulario
          width: "100%", // Ocupa todo el ancho disponible hasta el maxWidth
          mx: "auto", // Centrar horizontalmente
          display: "flex",
          flexDirection: "column",
          gap: 2, // Espaciado entre elementos
          alignItems: "center", // Centrar contenido verticalmente
        }}>
        <Typography
          level="h2"
          sx={{ mb: 1, fontWeight: "xl", color: "primary.plainColor" }}>
          ¿Olvidaste tu Contraseña?
        </Typography>
        <Typography
          level="body-md"
          textAlign="center"
          sx={{ mb: 2, color: "text.secondary" }}>
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecerla.
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Input
              name="email"
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="lg"
              startDecorator={<EmailRoundedIcon />}
              sx={{ borderRadius: "md" }}
            />
            <Button
              type="submit"
              size="lg"
              variant="solid"
              color="primary"
              loading={loading}
              sx={{ borderRadius: "xl", fontWeight: "lg" }}>
              Enviar Enlace
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
