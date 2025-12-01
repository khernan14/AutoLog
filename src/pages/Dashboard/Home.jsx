import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Sheet,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Divider,
  Table,
  Chip,
  Button,
} from "@mui/joy";
import { motion } from "framer-motion";

import WbSunnyIcon from "@mui/icons-material/WbSunny";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import BuildIcon from "@mui/icons-material/Build";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  getEmpleadosMasSalidasReport,
  getVehiculosMasUtilizadosReport,
  getRegisterReport,
  getTotalEmpleados,
  getTotalVehiculos,
  getVehiculosEnUso,
  getVehiculosEnMantenimiento,
} from "@/services/ReportServices";

import { getPinnedChangelogs, statusToJoyColor } from "@/services/help.api";
import { useAuth } from "@/context/AuthContext";

const MotionCard = motion(Card);

const getFormattedDate = () => {
  const now = new Date();
  return now.toLocaleDateString("es-HN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// util para elegir “destacado del día” estable
function pickStableItem(arr) {
  if (!arr?.length) return null;
  const seed = new Date().toDateString(); // cambia 1 vez por día
  const hash = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  const idx = Math.abs(hash) % arr.length;
  return arr[idx];
}

export default function Home() {
  const { userData } = useAuth();
  const userName = (userData?.nombre && String(userData.nombre)) || "Usuario";

  const today = getFormattedDate();
  const navigate = useNavigate();

  // ---- estado clima
  const [weather, setWeather] = useState(null);
  const weatherKey = import.meta.env.VITE_OWM_KEY || "REEMPLAZA_TU_APIKEY";

  // ---- estado métricas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalEmpleados: 0,
    totalVehiculos: 0,
    vehiculosEnUso: 0,
    vehiculosEnMantenimiento: 0,
    registrosPendientes: 0,
    ultimosRegistros: [],
    topEmpleadosActivos: [],
    topVehiculosUsados: [],
  });

  // ---- estado novedades (pinned)
  const [pinned, setPinned] = useState([]);
  const pinnedAbortRef = useRef();

  useEffect(() => {
    // === Cargar clima (opcional) ===
    if (
      weatherKey &&
      weatherKey !== "REEMPLAZA_TU_APIKEY" &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${weatherKey}`;
          fetch(url)
            .then((r) => r.json())
            .then((data) => {
              if (data?.main?.temp != null && data?.weather?.[0]) {
                setWeather({
                  temperatura: Math.round(data.main.temp),
                  descripcion: data.weather[0].description,
                  icono: data.weather[0].icon,
                });
              }
            })
            .catch(() => {});
        },
        () => {}
      );
    }

    // === Cargar métricas del dashboard ===
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          totalEmpleados,
          totalVehiculos,
          vehiculosEnUso,
          vehiculosEnMantenimiento,
          allRegistros,
          empleadosMasSalidas,
          vehiculosMasUtilizados,
        ] = await Promise.all([
          getTotalEmpleados(),
          getTotalVehiculos(),
          getVehiculosEnUso(),
          getVehiculosEnMantenimiento(),
          getRegisterReport(),
          getEmpleadosMasSalidasReport(),
          getVehiculosMasUtilizadosReport(),
        ]);

        const pendientes = (allRegistros || []).filter((r) => !r.fecha_regreso);
        const ultimos = (allRegistros || []).slice(0, 5);

        setDashboardMetrics({
          totalEmpleados: totalEmpleados?.total || 0,
          totalVehiculos: totalVehiculos?.total || 0,
          vehiculosEnUso: vehiculosEnUso?.total || 0,
          vehiculosEnMantenimiento: vehiculosEnMantenimiento?.total || 0,
          registrosPendientes: pendientes.length,
          ultimosRegistros: ultimos,
          topEmpleadosActivos: (empleadosMasSalidas || []).slice(0, 3),
          topVehiculosUsados: (vehiculosMasUtilizados || []).slice(0, 3),
        });
      } catch (err) {
        setError(
          "No se pudieron cargar las métricas principales. Por favor, intente de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [weatherKey]);

  // === Novedades/pinned ===
  useEffect(() => {
    const loadPinned = async () => {
      try {
        pinnedAbortRef.current?.abort();
        const controller = new AbortController();
        pinnedAbortRef.current = controller;
        const data = await getPinnedChangelogs(6, controller.signal);
        setPinned(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e?.name !== "AbortError") {
          // silencioso
        }
      }
    };
    loadPinned();
    return () => pinnedAbortRef.current?.abort();
  }, []);

  const highlight = useMemo(() => pickStableItem(pinned), [pinned]);

  if (loading) {
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
          Cargando información principal...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert color="danger" variant="soft">
          <Typography level="body-lg">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  const go = (to) => (e) => {
    e?.preventDefault?.();
    navigate(to);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Saludo + fecha */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <Typography level="h2" sx={{ mb: 1, fontWeight: "bold" }}>
          ¡Hola, {userName}! 👋
        </Typography>
        <Typography level="body-lg" sx={{ mb: 2, color: "text.secondary" }}>
          Hoy es {today}
        </Typography>
      </motion.div>

      {/* Bloque: Novedades (pinned) */}
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
          <Typography level="title-lg">Novedades destacadas</Typography>
          <Chip size="sm" variant="soft" color="neutral">
            {pinned.length} fijas
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
          <Sheet
            variant="soft"
            color="neutral"
            sx={{
              p: 2,
              borderRadius: "lg",
              mb: pinned.length > 1 ? 2 : 0,
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
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
            <InfoOutlinedIcon />
            <Typography level="body-sm">
              No hay novedades destacadas por ahora.
            </Typography>
          </Stack>
        )}

        {pinned.length > 1 && (
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            {pinned
              .filter((x) => x.slug !== highlight?.slug)
              .map((item) => (
                <Grid key={item.id} xs={12} sm={6} lg={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: "lg",
                      height: "100%",
                      cursor: "pointer",
                    }}
                    onClick={go(`/admin/help/changelog/${item.slug}`)}>
                    <CardContent sx={{ gap: 0.75 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            item.type
                              ? {
                                  Added: "success",
                                  Changed: "warning",
                                  Fixed: "success",
                                  Removed: "danger",
                                  Deprecated: "warning",
                                  Security: "danger",
                                  Performance: "success",
                                }[item.type] || "neutral"
                              : "neutral"
                          }>
                          {item.type || "Update"}
                        </Chip>
                        <Typography level="title-sm" sx={{ flex: 1 }} noWrap>
                          {item.title}
                        </Typography>
                      </Stack>
                      {item.description ? (
                        <Typography level="body-xs" color="neutral" noWrap>
                          {item.description}
                        </Typography>
                      ) : null}
                      {item.date ? (
                        <Typography level="body-xs" sx={{ mt: 0.25 }}>
                          {new Date(item.date).toLocaleDateString("es-HN")}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </MotionCard>

      {/* Métricas clave */}
      <Typography level="h3" sx={{ mb: 2, fontWeight: "medium" }}>
        Resumen rápido
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{
              boxShadow: "md",
              borderRadius: "lg",
              p: 2,
              backgroundColor: "primary.softBg",
            }}>
            <CardContent
              orientation="horizontal"
              sx={{ alignItems: "center", gap: 2 }}>
              <IconButton variant="solid" color="primary" size="lg">
                <PeopleIcon fontSize="xl" />
              </IconButton>
              <Box>
                <Typography level="title-md">Total Empleados</Typography>
                <Typography level="h3">
                  {dashboardMetrics.totalEmpleados}
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{
              boxShadow: "md",
              borderRadius: "lg",
              p: 2,
              backgroundColor: "success.softBg",
            }}>
            <CardContent
              orientation="horizontal"
              sx={{ alignItems: "center", gap: 2 }}>
              <IconButton variant="solid" color="success" size="lg">
                <DirectionsCarIcon fontSize="xl" />
              </IconButton>
              <Box>
                <Typography level="title-md">Total Vehículos</Typography>
                <Typography level="h3">
                  {dashboardMetrics.totalVehiculos}
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{
              boxShadow: "md",
              borderRadius: "lg",
              p: 2,
              backgroundColor: "warning.softBg",
            }}>
            <CardContent
              orientation="horizontal"
              sx={{ alignItems: "center", gap: 2 }}>
              <IconButton variant="solid" color="warning" size="lg">
                <DirectionsCarIcon fontSize="xl" />
              </IconButton>
              <Box>
                <Typography level="title-md">Vehículos en Uso</Typography>
                <Typography level="h3">
                  {dashboardMetrics.vehiculosEnUso}
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{
              boxShadow: "md",
              borderRadius: "lg",
              p: 2,
              backgroundColor: "danger.softBg",
            }}>
            <CardContent
              orientation="horizontal"
              sx={{ alignItems: "center", gap: 2 }}>
              <IconButton variant="solid" color="danger" size="lg">
                <PendingActionsIcon fontSize="xl" />
              </IconButton>
              <Box>
                <Typography level="title-md">Registros Pendientes</Typography>
                <Typography level="h3">
                  {dashboardMetrics.registrosPendientes}
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Quick glance: clima, actividad, top empleados */}
      <Grid container spacing={3}>
        {/* Clima (opcional) */}
        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "md", borderRadius: "lg", p: 2, minHeight: 200 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <WbSunnyIcon />
                <Typography level="title-md">Clima Actual</Typography>
              </Stack>
              {weather ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  {weather.icono && (
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icono}@2x.png`}
                      alt={weather.descripcion}
                      style={{ width: 50, height: 50 }}
                    />
                  )}
                  <Box>
                    <Typography level="h3">{weather.temperatura}°C</Typography>
                    <Typography
                      level="body-md"
                      sx={{ textTransform: "capitalize" }}>
                      {weather.descripcion}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography level="body-md" color="neutral">
                  No disponible.
                </Typography>
              )}
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Actividad reciente */}
        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "md", borderRadius: "lg", p: 2, minHeight: 200 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <AccessTimeFilledIcon />
                <Typography level="title-md">Actividad Reciente</Typography>
              </Stack>
              {dashboardMetrics.ultimosRegistros.length > 0 ? (
                <Sheet variant="soft" sx={{ borderRadius: "md", p: 1 }}>
                  <Table borderAxis="none" size="sm">
                    <tbody>
                      {dashboardMetrics.ultimosRegistros.map((r, i) => (
                        <tr key={r.id || i}>
                          <td>
                            <Typography level="body-sm" fontWeight="md" noWrap>
                              {r.empleado?.nombre || "N/A"}
                            </Typography>
                            <Typography level="body-xs" noWrap>
                              {r.vehiculo?.marca || "N/A"} (
                              {r.vehiculo?.placa || "N/A"})
                            </Typography>
                          </td>
                          <td>
                            <Typography
                              level="body-xs"
                              sx={{ whiteSpace: "nowrap" }}>
                              {r.fecha_salida
                                ? new Date(r.fecha_salida).toLocaleDateString(
                                    "es-HN"
                                  )
                                : "-"}
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Sheet>
              ) : (
                <Typography level="body-md" color="text.secondary">
                  No hay registros recientes.
                </Typography>
              )}
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Top empleados activos */}
        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "md", borderRadius: "lg", p: 2, minHeight: 200 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <PeopleIcon />
                <Typography level="title-md">
                  Top 3 Empleados Activos
                </Typography>
              </Stack>
              {dashboardMetrics.topEmpleadosActivos.length > 0 ? (
                <Sheet variant="soft" sx={{ borderRadius: "md", p: 1 }}>
                  <Table borderAxis="none" size="sm">
                    <tbody>
                      {dashboardMetrics.topEmpleadosActivos.map((e, i) => (
                        <tr key={i}>
                          <td>
                            <Typography level="body-sm" fontWeight="md" noWrap>
                              {e.nombre_empleado}
                            </Typography>
                            <Typography level="body-xs" noWrap>
                              {e.puesto}
                            </Typography>
                          </td>
                          <td>
                            <Typography level="body-sm" fontWeight="bold">
                              {e.total_salidas}
                            </Typography>
                            <Typography level="body-xs">salidas</Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Sheet>
              ) : (
                <Typography level="body-md" color="text.secondary">
                  No hay empleados activos para mostrar.
                </Typography>
              )}
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
