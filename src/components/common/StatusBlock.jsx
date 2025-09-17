// components/common/StatusBlock.jsx
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/joy";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import StatusCard from "./StatusCard";

export function renderStatus(
  viewState,
  { error, onRetry, emptyTitle, emptyDesc }
) {
  if (viewState === "checking") {
    return (
      <StatusCard
        icon={<HourglassEmptyRoundedIcon />}
        title="Verificando sesión…"
        description={
          <Stack alignItems="center" spacing={1}>
            <CircularProgress size="sm" />
            <Typography level="body-xs" sx={{ opacity: 0.8 }}>
              Por favor, espera un momento.
            </Typography>
          </Stack>
        }
      />
    );
  }
  if (viewState === "no-permission") {
    return (
      <StatusCard
        color="danger"
        icon={<LockPersonRoundedIcon />}
        title="Sin permisos"
        description="Consulta con un administrador para obtener acceso."
      />
    );
  }
  if (viewState === "error") {
    const isNetwork = /conexión|failed to fetch/i.test(error || "");
    return (
      <StatusCard
        color={isNetwork ? "warning" : "danger"}
        icon={isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />}
        title={isNetwork ? "Problema de conexión" : "Ocurrió un error"}
        description={error || "Inténtalo de nuevo."}
        actions={
          onRetry ? (
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={onRetry}
              variant="soft">
              Reintentar
            </Button>
          ) : null
        }
      />
    );
  }
  if (viewState === "empty") {
    return (
      <StatusCard
        color="neutral"
        icon={<InfoOutlinedIcon />}
        title={emptyTitle || "Sin datos"}
        description={emptyDesc || "No hay resultados para mostrar."}
      />
    );
  }
  if (viewState === "loading") {
    return (
      <Box p={3} sx={{ textAlign: "center" }}>
        <Stack spacing={1} alignItems="center">
          <CircularProgress />
          <Typography level="body-sm">Cargando…</Typography>
        </Stack>
      </Box>
    );
  }
  return null;
}
