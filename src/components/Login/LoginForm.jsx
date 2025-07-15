import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Input,
  Sheet,
  Stack,
  Divider,
  Link, // Importa Link para el enlace de "Olvidé mi contraseña"
  IconButton, // Importa IconButton para el ojo de la contraseña
} from "@mui/joy";
import Visibility from "@mui/icons-material/Visibility"; // Icono de ojo visible
import VisibilityOff from "@mui/icons-material/VisibilityOff"; // Icono de ojo tachado
import EmailRoundedIcon from "@mui/icons-material/EmailRounded"; // Icono para el email
import LockRoundedIcon from "@mui/icons-material/LockRounded"; // Icono para la contraseña
import loginBg from "../../assets/fondo-login.svg"; // Asegúrate de que la ruta sea correcta

export default function LoginForm({
  credentials,
  setCredentials,
  onSubmit,
  loading,
  onForgotPassword, // Recibe la nueva función
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        backgroundColor: "background.body", // Fondo general de la página
      }}>
      {/* Sección de Ilustración/Información (Oculta en mobile pequeño para ahorrar espacio) */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" }, // Ocultar en mobile muy pequeño
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: { xs: "none", md: 1 }, // Toma la mitad en desktop
          p: { xs: 2, sm: 4 },
          backgroundColor: "background.level1", // Un color de fondo suave
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 0, md: "lg" }, // Bordes redondeados en desktop
          m: { xs: 0, md: 2 }, // Margen para que no esté pegado a los bordes en desktop
          boxShadow: { xs: "none", md: "xl" }, // Sombra sutil en desktop
        }}>
        <Box
          component="img"
          src={loginBg}
          alt="Login illustration"
          sx={{
            width: { xs: "80%", sm: "60%", md: "80%" }, // Ajuste de tamaño responsivo
            height: "auto",
            mb: 4,
            animation: "float 3s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-10px)" }, // Animación más pronunciada
            },
            maxWidth: "400px", // Limitar tamaño máximo
          }}
        />

        <Typography
          level="h3"
          textAlign="center"
          sx={{ fontWeight: "lg", color: "text.primary" }}>
          ¡Bienvenido a AutoLog!
        </Typography>
        <Typography
          level="body-lg"
          textAlign="center"
          mt={1}
          sx={{ color: "text.secondary", maxWidth: "400px" }}>
          Gestione y optimice el uso de los vehículos de su empresa de forma
          eficiente.
        </Typography>
        <Typography
          level="body-sm"
          textAlign="center"
          mt={3}
          color="neutral.500">
          ¿Necesitas ayuda? Contacta a soporte:
          <br />
          <Link
            href="mailto:micros.teh@tecnasadesk.com"
            level="body-sm"
            sx={{ fontWeight: "md" }}>
            micros.teh@tecnasa.com
          </Link>
        </Typography>
      </Box>

      {/* Formulario de Login */}
      <Sheet
        variant="outlined" // Usar outlined para un borde sutil
        sx={{
          p: { xs: 3, sm: 4, md: 6 }, // Padding responsivo
          flex: { xs: 1, md: 1 }, // Toma la mitad en desktop, todo en mobile
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3, // Espaciado entre elementos del formulario
          borderRadius: { xs: "lg", md: "xl" }, // Bordes redondeados
          boxShadow: { xs: "lg", md: "xl" }, // Sombra más pronunciada
          m: { xs: 2, md: 2 }, // Margen para que no esté pegado a los bordes
          maxWidth: { xs: "90%", sm: "450px", md: "500px" }, // Ancho máximo
          mx: "auto", // Centrar horizontalmente
        }}>
        <Typography
          level="h2"
          sx={{ mb: 2, fontWeight: "xl", color: "primary.plainColor" }}>
          Iniciar Sesión
        </Typography>

        <Stack spacing={2} width="100%">
          <Input
            name="username"
            type="text"
            placeholder="Usuario"
            value={credentials.username}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            size="lg"
            startDecorator={<EmailRoundedIcon />}
            sx={{ borderRadius: "md" }} // Bordes redondeados
          />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={credentials.password}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            size="lg"
            startDecorator={<LockRoundedIcon />}
            endDecorator={
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility}
                edge="end"
                variant="plain"
                color="neutral">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            sx={{ borderRadius: "md" }}
          />
          {/* Enlace de Olvidé mi contraseña */}
          <Link
            component="button" // Renderiza como un botón para accesibilidad
            onClick={onForgotPassword}
            level="body-sm"
            sx={{
              alignSelf: "flex-end",
              mt: -1,
              color: "text.secondary",
              "&:hover": { color: "primary.plainColor" },
            }}>
            ¿Olvidaste tu contraseña?
          </Link>
          <Button
            size="lg"
            variant="solid"
            color="primary"
            onClick={onSubmit}
            loading={loading}
            sx={{
              mt: 2,
              borderRadius: "xl", // Botón más redondeado
              fontWeight: "lg",
              letterSpacing: "0.05em",
              transition: "transform 0.2s ease-in-out",
              "&:active": {
                transform: "scale(0.98)",
              },
            }}>
            Entrar
          </Button>
          <Divider sx={{ my: 2 }}>O</Divider> {/* Separador */}
          <Typography
            level="body-sm"
            textAlign="center"
            sx={{ color: "text.secondary" }}>
            ¿No tienes cuenta?{" "}
            <Link href="mailto:support@herndevs.com" sx={{ fontWeight: "md" }}>
              Contacta al administrador.
            </Link>
          </Typography>
        </Stack>
      </Sheet>
    </Box>
  );
}
