// src/pages/Settings/sections/Acerca.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Card,
  Stack,
  Divider,
  Button,
  Grid,
  Chip,
  Sheet,
  Skeleton,
  IconButton,
  Tooltip,
} from "@mui/joy";

// Iconos
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";

// Servicios (Usando los mismos que ya tenías)
import {
  getOverallStatus,
  listServices,
  statusToJoyColor,
} from "../../../services/help.api.js";

// --- Helpers de Estado ---
function StatusDot({ color = "neutral" }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: `${color}.500`,
        boxShadow: (theme) => `0 0 0 2px ${theme.vars.palette[color][100]}`,
      }}
    />
  );
}

// Widget de Estado del Sistema (Integrado)
// Widget de Estado del Sistema (Con Auto-Refresh y Validación Robusta)
function SystemStatusWidget() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true); // Carga inicial (esqueleto)
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  // Función de carga
  // isBackground = true evita que aparezca el Skeleton cada 30 segundos
  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await listServices();
      setServices(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      // Solo mostramos error si no tenemos datos previos
      if (!isBackground)
        setError("No se pudo conectar con el monitor de estado.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Efecto: Carga inicial + Intervalo
  useEffect(() => {
    fetchData(); // 1. Carga inmediata

    const interval = setInterval(() => {
      fetchData(true); // 2. Refresco silencioso cada 30s
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Agrupamos servicios
  const grouped = useMemo(() => {
    return services.reduce((acc, curr) => {
      const g = curr.group_name || "Otros";
      if (!acc[g]) acc[g] = [];
      acc[g].push(curr);
      return acc;
    }, {});
  }, [services]);

  // --- LÓGICA DE ESTADOS ROBUSTA (Regex) ---
  const getStatusColor = (items) => {
    // Convertimos a string y minúsculas para comparar seguro
    const hasError = items.some((i) =>
      /down|incident|falla|error|caido|degradado|outage/i.test(String(i.status))
    );
    const hasWarning = items.some((i) =>
      /degraded|maintenance|mantenimiento|lento|warning/i.test(String(i.status))
    );

    if (hasError) return "danger";
    if (hasWarning) return "warning";
    return "success"; // Por defecto verde
  };

  const getStatusLabel = (items) => {
    const hasError = items.some((i) =>
      /down|incident|falla|error|caido|degradado|outage/i.test(String(i.status))
    );
    if (hasError) return "Incidente";

    const hasWarning = items.some((i) =>
      /degraded|maintenance|mantenimiento|lento|warning/i.test(String(i.status))
    );
    if (hasWarning) return "Mantenimiento";

    return "Operativo";
  };

  if (loading)
    return (
      <Skeleton
        variant="rectangular"
        height={150}
        sx={{ borderRadius: "lg" }}
      />
    );

  if (error && services.length === 0) {
    return (
      <Sheet variant="soft" color="danger" sx={{ p: 2, borderRadius: "md" }}>
        <Typography level="body-sm" startDecorator={<ErrorRoundedIcon />}>
          {error}
        </Typography>
        <Button
          size="sm"
          variant="plain"
          onClick={() => fetchData(false)}
          sx={{ mt: 1 }}>
          Reintentar
        </Button>
      </Sheet>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: "lg" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}>
        <Typography
          level="title-md"
          startDecorator={<BoltRoundedIcon color="warning" />}>
          {t("settings.about.status_title")}
        </Typography>
        <Tooltip title="Actualizar ahora">
          <IconButton
            size="sm"
            variant="plain"
            onClick={() => fetchData(false)}>
            <RefreshRoundedIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={2}>
        {Object.entries(grouped).map(([group, items]) => {
          const color = getStatusColor(items);
          const label = getStatusLabel(items);

          return (
            <Grid key={group} xs={12} sm={6}>
              <Sheet
                variant="soft"
                color="neutral"
                sx={{
                  p: 1.5,
                  borderRadius: "md",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: color !== "success" ? "1px solid" : "none", // Borde si hay error
                  borderColor: `${color}.300`,
                }}>
                <Typography level="body-sm" fontWeight="md">
                  {group}
                </Typography>
                <Chip
                  size="sm"
                  variant="solid"
                  color={color}
                  startDecorator={<StatusDot color={color} />}>
                  {label}
                </Chip>
              </Sheet>
            </Grid>
          );
        })}
        {services.length === 0 && (
          <Typography level="body-xs" color="neutral">
            Sin información de servicios.
          </Typography>
        )}
      </Grid>
    </Card>
  );
}

// --- Componente Principal ---
export default function Acerca() {
  const { t } = useTranslation();

  // Datos técnicos del entorno cliente
  const clientInfo = [
    {
      label: t("settings.about.version"),
      value: `v${import.meta.env.PACKAGE_VERSION}`,
    },
    {
      label: t("settings.about.commit"),
      value: (
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          sx={{ cursor: "default" }}>
          #{import.meta.env.COMMIT_HASH}
        </Chip>
      ),
    },
    {
      label: t("settings.about.build"),
      value:
        import.meta.env.MODE === "development" ? "Desarrollo" : "Producción",
    },
    {
      label: t("settings.about.browser"),
      value: navigator.userAgentData?.brands?.[0]?.brand || navigator.appName,
    },
    { label: t("settings.about.platform"), value: navigator.platform },
    { label: t("settings.about.language"), value: navigator.language },
  ];

  return (
    <Stack spacing={3} maxWidth={800}>
      {/* Header de la App */}
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              bgcolor: "primary.500",
              borderRadius: "xl",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "lg",
              mb: 2,
              fontSize: "2rem",
              fontWeight: "bold",
            }}>
            {/* Logo o Iniciales */}
            {(import.meta.env.PACKAGE_NAME || "App")
              .substring(0, 2)
              .toUpperCase()}
          </Box>
          <Typography level="h2">
            {import.meta.env.VITE_APP_TITLE || "Mi Sistema SaaS"}
          </Typography>
          <Typography level="body-md" color="neutral">
            {t("settings.about.version")} {import.meta.env.PACKAGE_VERSION}
          </Typography>
        </Box>
      </Card>

      {/* Widget de Estado (Tu código adaptado) */}
      <SystemStatusWidget />

      {/* Información Técnica */}
      <Card variant="outlined" sx={{ borderRadius: "lg" }}>
        <Typography
          level="title-md"
          mb={2}
          startDecorator={<InfoRoundedIcon />}>
          {t("settings.about.tech_info")}
        </Typography>
        <Stack divider={<Divider />}>
          {clientInfo.map((item, i) => (
            <Stack
              key={i}
              direction="row"
              justifyContent="space-between"
              py={1}>
              <Typography level="body-sm" color="neutral">
                {item.label}
              </Typography>
              <Typography
                level="body-sm"
                fontWeight="md"
                sx={{ fontFamily: "monospace" }}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Card>

      {/* Botones de Acción */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ pt: 2 }}>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<GitHubIcon />}
          onClick={() =>
            window.open("https://github.com/khernan14/AutoLog", "_blank")
          }>
          GitHub
        </Button>
        <Button
          variant="soft"
          color="danger"
          startDecorator={<BugReportRoundedIcon />}
          onClick={() => window.open("mailto:support@herndevs.com", "_blank")}>
          {t("settings.about.report_bug")}
        </Button>
      </Stack>

      <Typography
        level="body-xs"
        textAlign="center"
        color="neutral"
        sx={{ pt: 4 }}>
        © {new Date().getFullYear()} Hernández Devs S.A.{" "}
        {t("settings.about.rights")}
      </Typography>
    </Stack>
  );
}
