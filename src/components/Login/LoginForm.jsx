import {
  Box,
  Button,
  Typography,
  Input,
  Sheet,
  Stack,
  Divider,
} from "@mui/joy";
import loginBg from "../../assets/fondo-login.svg";

export default function LoginForm({
  credentials,
  setCredentials,
  onSubmit,
  loading,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}>
      {/* Imagen arriba en mobile, derecha en desktop */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          backgroundColor: "background.level1",
        }}>
        <Box
          component="img"
          src={loginBg}
          alt="Login illustration"
          sx={{
            width: { xs: "60%", md: "40%" },
            height: "auto",
            mb: 4,
          }}
        />
        <Typography level="h3" textAlign="center">
          ¡Hola, bienvenido!
        </Typography>
        <Typography level="body1" textAlign="center" mt={1}>
          Gestione fácilmente el uso de los vehículos de la empresa.
        </Typography>
        <Typography level="body2" textAlign="center" mt={2} color="neutral">
          support@company.com
          <br />
          Contacte con el equipo de soporte
        </Typography>
      </Box>

      {/* Formulario */}
      <Sheet
        variant="plain"
        sx={{
          // p: 4,
          paddingBottom: 5,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}>
        <Typography level="h2" sx={{ mb: 2 }}>
          Inicia sesión
        </Typography>

        <Stack spacing={2} width="100%" maxWidth="360px">
          <Input
            sx={{
              "&::before": {
                border: "1.5px solid var(--Input-focusedHighlight)",
                transform: "scaleX(0)",
                left: "2.5px",
                right: "2.5px",
                bottom: 0,
                top: "unset",
                transition: "transform .15s cubic-bezier(0.1,0.9,0.2,1)",
                borderRadius: 0,
                borderBottomLeftRadius: "64px 20px",
                borderBottomRightRadius: "64px 20px",
              },
              "&:focus-within::before": {
                transform: "scaleX(1)",
              },
            }}
            type="text"
            placeholder="Correo electrónico"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            size="lg"
          />

          <Input
            sx={{
              "&::before": {
                border: "1.5px solid var(--Input-focusedHighlight)",
                transform: "scaleX(0)",
                left: "2.5px",
                right: "2.5px",
                bottom: 0,
                top: "unset",
                transition: "transform .15s cubic-bezier(0.1,0.9,0.2,1)",
                borderRadius: 0,
                borderBottomLeftRadius: "64px 20px",
                borderBottomRightRadius: "64px 20px",
              },
              "&:focus-within::before": {
                transform: "scaleX(1)",
              },
            }}
            type="password"
            placeholder="Contraseña"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            size="lg"
          />
          <Button
            size="lg"
            variant="solid"
            color="primary"
            onClick={onSubmit}
            loading={loading}>
            Entrar
          </Button>
          <Divider />
          <Typography level="body2" textAlign="center">
            ¿No tienes cuenta? Contacta al administrador.
          </Typography>
        </Stack>
      </Sheet>
    </Box>
  );
}
