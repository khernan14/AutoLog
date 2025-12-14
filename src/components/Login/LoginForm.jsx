import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import loginBg from "../../assets/tecnasa_core.png"; // Asegúrate de que la ruta sea correcta

export default function LoginForm({
  credentials,
  setCredentials,
  onSubmit,
  loading,
  onForgotPassword, // Recibe la nueva función
}) {
  const { t } = useTranslation();
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
        backgroundColor: "background.body",
      }}>
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: { xs: "none", md: 1 },
          p: { xs: 2, sm: 4 },
          backgroundColor: "background.level1",
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 0, md: "lg" },
          m: { xs: 0, md: 2 },
          boxShadow: { xs: "none", md: "xl" },
        }}>
        <Box
          component="img"
          src={loginBg}
          alt="Login illustration"
          sx={{
            width: { xs: "80%", sm: "60%", md: "80%" },
            height: "auto",
            mb: 4,
            animation: "float 3s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-10px)" },
            },
            maxWidth: "400px",
          }}
        />

        <Typography
          level="h3"
          textAlign="center"
          sx={{ fontWeight: "lg", color: "text.primary" }}>
          {t("login.title_bienvenida")}
        </Typography>
        <Typography
          level="body-lg"
          textAlign="center"
          mt={1}
          sx={{ color: "text.secondary", maxWidth: "400px" }}>
          {t("login.description_bienvenida")}
        </Typography>
        <Typography
          level="body-sm"
          textAlign="center"
          mt={3}
          color="neutral.500">
          {t("login.title_ayuda")}
          <br />
          <Link
            href="mailto:micros.teh@tecnasadesk.com"
            level="body-sm"
            sx={{ fontWeight: "md" }}>
            {t("login.link_ayuda")}
          </Link>
        </Typography>
      </Box>

      <Sheet
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 4, md: 6 },
          flex: { xs: 1, md: 1 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
          borderRadius: { xs: "lg", md: "xl" },
          boxShadow: { xs: "lg", md: "xl" },
          m: { xs: 2, md: 2 },
          maxWidth: { xs: "90%", sm: "450px", md: "500px" },
          mx: "auto",
        }}>
        <Typography
          level="h2"
          sx={{ mb: 2, fontWeight: "xl", color: "primary.plainColor" }}>
          {t("login.title")}
        </Typography>

        <Stack spacing={2} width="100%">
          <Input
            name="username"
            type="text"
            placeholder={t("login.usuario")}
            value={credentials.username}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            size="lg"
            startDecorator={<EmailRoundedIcon />}
            sx={{ borderRadius: "md" }}
          />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("login.contraseña")}
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
          <Link
            component="button"
            onClick={onForgotPassword}
            level="body-sm"
            sx={{
              alignSelf: "flex-end",
              mt: -1,
              color: "text.secondary",
              "&:hover": { color: "primary.plainColor" },
            }}>
            {t("login.olvidaste_contraseña")}
          </Link>
          <Button
            size="lg"
            variant="solid"
            color="primary"
            onClick={onSubmit}
            loading={loading}
            sx={{
              mt: 2,
              borderRadius: "xl",
              fontWeight: "lg",
              letterSpacing: "0.05em",
              transition: "transform 0.2s ease-in-out",
              "&:active": {
                transform: "scale(0.98)",
              },
            }}>
            {t("login.entrar")}
          </Button>
          <Divider sx={{ my: 2 }}>O</Divider>
          <Typography
            level="body-sm"
            textAlign="center"
            sx={{ color: "text.secondary" }}>
            {t("login.no_cuentas")}{" "}
            <Link href="mailto:support@herndevs.com" sx={{ fontWeight: "md" }}>
              {t("login.registrarte")}
            </Link>
          </Typography>
        </Stack>
      </Sheet>
    </Box>
  );
}
