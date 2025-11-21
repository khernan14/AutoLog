// src/pages/Dashboard/Home.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Button,
  Sheet,
} from "@mui/joy";
import { motion } from "framer-motion";

import PeopleIcon from "@mui/icons-material/People";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { getPinnedChangelogs } from "@/services/help.api";
import { useFleetSummaryMetrics } from "@/hooks/useFleetSummaryMetrics";

const MotionCard = motion(Card);

const SLOGANS = [
  "Gestiona tu flota en un solo lugar.",
  "Registra salidas y regresos en segundos.",
  "Visualiza el uso de los vehículos al instante.",
];

const getUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.nombre || "Usuario";
  } catch {
    return "Usuario";
  }
};

const getFormattedDate = () => {
  const now = new Date();
  return now.toLocaleDateString("es-HN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Home() {
  const userName = getUserName();
  const today = getFormattedDate();
  const navigate = useNavigate();

  // 🔹 Métricas ligeras (compartidas con Dashboard)
  const {
    loading: loadingMetrics,
    error: errorMetrics,
    metrics,
  } = useFleetSummaryMetrics();

  // ---- estado novedades (pinned) con rotación
  const [pinned, setPinned] = useState([]);
  const [pinnedIndex, setPinnedIndex] = useState(0);
  const pinnedAbortRef = useRef(null);

  // ---- texto animado (slogans)
  const [sloganIndex, setSloganIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % SLOGANS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // === Cargar novedades fijadas ===
  useEffect(() => {
    const loadPinned = async () => {
      try {
        pinnedAbortRef.current?.abort();
        const controller = new AbortController();
        pinnedAbortRef.current = controller;
        const data = await getPinnedChangelogs(6, controller.signal);
        setPinned(Array.isArray(data) ? data : []);
        setPinnedIndex(0);
      } catch (e) {
        if (e?.name !== "AbortError") {
          // silencioso, no queremos romper Home por un error de changelog
          console.error("Error cargando novedades fijadas:", e);
        }
      }
    };
    loadPinned();
    return () => pinnedAbortRef.current?.abort();
  }, []);

  // Rotación automática de novedades
  useEffect(() => {
    if (!pinned.length) return;
    const id = setInterval(
      () => setPinnedIndex((prev) => (prev + 1) % pinned.length),
      8000
    );
    return () => clearInterval(id);
  }, [pinned]);

  const highlight = useMemo(
    () => (pinned.length ? pinned[pinnedIndex] : null),
    [pinned, pinnedIndex]
  );

  const go = (to) => (e) => {
    e?.preventDefault?.();
    navigate(to);
  };

  // === Estados de carga / error de métricas ===
  if (loadingMetrics) {
    return (
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}>
        <CircularProgress size="lg" />
        <Typography level="body-lg" sx={{ ml: 2 }}>
          Cargando tu panel de inicio...
        </Typography>
      </Box>
    );
  }

  if (errorMetrics) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert color="danger" variant="soft">
          <Typography level="body-lg">{errorMetrics}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Hero de bienvenida */}
      <MotionCard
        variant="soft"
        sx={{
          mb: 3,
          borderRadius: "2xl",
          background:
            "linear-gradient(135deg, var(--joy-palette-primary-softBg), var(--joy-palette-success-softBg))",
          boxShadow: "md",
          p: { xs: 2, md: 3 },
        }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}>
                <Typography
                  level="h2"
                  sx={{
                    mb: 1,
                    fontWeight: "extrabold",
                    background:
                      "linear-gradient(90deg, #03624C, #0284c7, #22c55e)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                  ¡Bienvenido, {userName}! 👋
                </Typography>
              </motion.div>

              <Typography
                level="body-md"
                sx={{ mb: 1.5, color: "text.secondary" }}>
                Hoy es {today}
              </Typography>

              <motion.div
                key={sloganIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}>
                <Typography level="body-lg">{SLOGANS[sloganIndex]}</Typography>
              </motion.div>
            </Grid>

            {/* mini-resumen de estado */}
            <Grid xs={12} md={5}>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent="flex-end">
                <Chip
                  variant="soft"
                  color="primary"
                  startDecorator={<PeopleIcon />}
                  sx={{ minWidth: 150, justifyContent: "space-between" }}>
                  <span>Empleados</span>
                  <strong>{metrics.totalEmpleados}</strong>
                </Chip>
                <Chip
                  variant="soft"
                  color="success"
                  startDecorator={<DirectionsCarIcon />}
                  sx={{ minWidth: 150, justifyContent: "space-between" }}>
                  <span>Vehículos</span>
                  <strong>{metrics.totalVehiculos}</strong>
                </Chip>
                <Chip
                  variant="soft"
                  color="warning"
                  startDecorator={<DirectionsCarIcon />}
                  sx={{ minWidth: 150, justifyContent: "space-between" }}>
                  <span>En uso</span>
                  <strong>{metrics.vehiculosEnUso}</strong>
                </Chip>
                <Chip
                  variant="soft"
                  color="danger"
                  startDecorator={<PendingActionsIcon />}
                  sx={{ minWidth: 150, justifyContent: "space-between" }}>
                  <span>Registros pendientes</span>
                  <strong>{metrics.registrosPendientes}</strong>
                </Chip>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </MotionCard>

      {/* Novedades destacadas con rotación */}
      <MotionCard
        whileHover={{ scale: 1.01 }}
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: "xl",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
          p: 2,
        }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <PushPinRoundedIcon />
          <Typography level="title-lg">Novedades del sistema</Typography>
          <Chip size="sm" variant="soft" color="neutral">
            {pinned.length} fijadas
          </Chip>
          <Box sx={{ flex: 1 }} />
          <Button
            size="sm"
            variant="plain"
            endDecorator={<ChevronRightRoundedIcon />}
            onClick={go("/admin/help/changelog")}>
            Ver todas
          </Button>
        </Stack>

        {highlight ? (
          <motion.div
            key={highlight.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}>
            <Sheet
              variant="soft"
              color="neutral"
              sx={{
                p: 2,
                borderRadius: "lg",
              }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="sm"
                  variant="soft"
                  color={
                    highlight.type
                      ? {
                          Added: "success",
                          Changed: "warning",
                          Fixed: "success",
                          Removed: "danger",
                          Deprecated: "warning",
                          Security: "danger",
                          Performance: "success",
                        }[highlight.type] || "neutral"
                      : "neutral"
                  }>
                  {highlight.type || "Update"}
                </Chip>
                {highlight.pinned ? (
                  <Chip size="sm" variant="soft" color="primary">
                    Pinned
                  </Chip>
                ) : null}
                <Typography level="title-md" sx={{ ml: 0.5, flex: 1 }}>
                  {highlight.title}
                </Typography>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={go(`/admin/help/changelog/${highlight.slug}`)}>
                  Abrir
                </Button>
              </Stack>
              {highlight.description ? (
                <Typography level="body-sm" sx={{ mt: 0.75 }}>
                  {highlight.description}
                </Typography>
              ) : null}
            </Sheet>
          </motion.div>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
            <InfoOutlinedIcon />
            <Typography level="body-sm">
              No hay novedades destacadas por ahora.
            </Typography>
          </Stack>
        )}

        {pinned.length > 1 && (
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-end"
            sx={{ mt: 1 }}>
            {pinned.map((item, idx) => (
              <Chip
                key={item.id}
                size="sm"
                color={idx === pinnedIndex ? "primary" : "neutral"}
                variant={idx === pinnedIndex ? "solid" : "outlined"}
                onClick={() => setPinnedIndex(idx)}>
                {idx + 1}
              </Chip>
            ))}
          </Stack>
        )}
      </MotionCard>

      {/* Acciones rápidas */}
      <Typography level="h3" sx={{ mb: 1.5, fontWeight: "medium" }}>
        Acciones rápidas
      </Typography>

      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "md", borderRadius: "lg", p: 2, height: "100%" }}>
            <CardContent>
              <Typography level="title-md" sx={{ mb: 0.5 }}>
                Registrar uso de vehículos
              </Typography>
              <Typography level="body-sm" sx={{ mb: 1.5 }}>
                Accede al panel para registrar salidas y regresos de la flota.
              </Typography>
              <Button
                size="sm"
                variant="solid"
                startDecorator={<DirectionsCarIcon />}
                onClick={go("/admin/panel-vehiculos")}>
                Ir al panel de registro
              </Button>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "md", borderRadius: "lg", p: 2, height: "100%" }}>
            <CardContent>
              <Typography level="title-md" sx={{ mb: 0.5 }}>
                Ver catálogo de vehículos
              </Typography>
              <Typography level="body-sm" sx={{ mb: 1.5 }}>
                Consulta el listado completo de vehículos y sus estados.
              </Typography>
              <Button
                size="sm"
                variant="outlined"
                startDecorator={<DirectionsCarIcon />}
                onClick={go("/admin/vehiculos")}>
                Ir a Vehículos
              </Button>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "md", borderRadius: "lg", p: 2, height: "100%" }}>
            <CardContent>
              <Typography level="title-md" sx={{ mb: 0.5 }}>
                Dashboard detallado
              </Typography>
              <Typography level="body-sm" sx={{ mb: 1.5 }}>
                Visualiza gráficos y métricas avanzadas de uso.
              </Typography>
              <Button
                size="sm"
                variant="outlined"
                startDecorator={<PeopleIcon />}
                onClick={go("/admin/dashboard")}>
                Ver dashboard
              </Button>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
