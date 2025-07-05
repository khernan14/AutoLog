import React, { useEffect, useState } from "react";
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
} from "@mui/joy";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import PeopleIcon from "@mui/icons-material/People"; // Icono para Total Empleados
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // Icono para Total Vehículos
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"; // Icono para Registros Completados
import PendingActionsIcon from "@mui/icons-material/PendingActions"; // Icono para Registros Pendientes
import BuildIcon from "@mui/icons-material/Build"; // Icono para En Mantenimiento
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled"; // Icono para Actividad Reciente

import { motion } from "framer-motion";

// Importa todas las funciones de servicio necesarias
import {
  getEmpleadosMasSalidasReport,
  getVehiculosMasUtilizadosReport,
  getRegisterReport, // Para registros recientes y pendientes
  // Asumiremos que estas funciones existen en ReportServices para las nuevas métricas
  getTotalEmpleados,
  getTotalVehiculos,
  getVehiculosEnUso,
  getVehiculosEnMantenimiento,
} from "../../services/ReportServices"; // Asegúrate de que la ruta sea correcta

const MotionCard = motion(Card);

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
    // Cambiado a 'es-HN' para Honduras
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Home() {
  const userName = getUserName();
  const today = getFormattedDate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = "7ccda530f97765376983de979173d465"; // Reemplaza con tu API Key

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

  useEffect(() => {
    // Carga de datos del clima
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${apiKey}`;

          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              if (data && data.main && data.weather) {
                const temperatura = data.main.temp;
                const descripcion = data.weather[0].description;
                const icono = data.weather[0].icon;
                setWeather({ temperatura, descripcion, icono });
              } else {
                console.warn("Datos de clima incompletos o inválidos:", data);
              }
            })
            .catch((error) => {
              console.error("Error al obtener el clima:", error);
            });
        },
        (error) => {
          console.error("Error al obtener la ubicación para el clima:", error);
        }
      );
    } else {
      console.error("Geolocalización no es soportada por este navegador.");
    }

    // Carga de métricas del dashboard
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          totalEmpleados,
          totalVehiculos,
          vehiculosEnUso,
          vehiculosEnMantenimiento,
          allRegistros, // Obtener todos los registros para calcular pendientes y recientes
          empleadosMasSalidas,
          vehiculosMasUtilizados,
        ] = await Promise.all([
          getTotalEmpleados(), // Nueva función
          getTotalVehiculos(), // Nueva función
          getVehiculosEnUso(), // Nueva función
          getVehiculosEnMantenimiento(), // Nueva función
          getRegisterReport(), // Ya existente, para filtrar en frontend
          getEmpleadosMasSalidasReport(), // Ya existente
          getVehiculosMasUtilizadosReport(), // Ya existente
        ]);

        // Calcular registros pendientes y últimos registros desde allRegistros
        const pendientes = allRegistros.filter((r) => !r.fecha_regreso);
        const ultimos = allRegistros.slice(0, 5); // Últimos 5 registros

        setDashboardMetrics({
          totalEmpleados: totalEmpleados.total || 0, // Asumiendo que devuelve { total: X }
          totalVehiculos: totalVehiculos.total || 0, // Asumiendo que devuelve { total: X }
          vehiculosEnUso: vehiculosEnUso.total || 0, // Asumiendo que devuelve { total: X }
          vehiculosEnMantenimiento: vehiculosEnMantenimiento.total || 0, // Asumiendo que devuelve { total: X }
          registrosPendientes: pendientes.length,
          ultimosRegistros: ultimos,
          topEmpleadosActivos: empleadosMasSalidas.slice(0, 3), // Top 3 para la home
          topVehiculosUsados: vehiculosMasUtilizados.slice(0, 3), // Top 3 para la home
        });
      } catch (err) {
        console.error("Error al cargar las métricas del dashboard:", err);
        setError(
          "No se pudieron cargar las métricas principales. Por favor, intente de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
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
      <Box sx={{ p: 3 }}>
        <Alert color="danger" variant="soft">
          <Typography level="body-lg">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Saludo y Fecha */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <Typography level="h2" sx={{ mb: 1, fontWeight: "bold" }}>
          ¡Hola, {userName}! 👋
        </Typography>
        <Typography level="body-lg" sx={{ mb: 3, color: "text.secondary" }}>
          Hoy es {today}
        </Typography>
      </motion.div>

      <Divider sx={{ my: 4 }} />

      {/* Métricas Clave */}
      <Typography level="h3" sx={{ mb: 3, fontWeight: "medium" }}>
        Resumen Rápido
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Empleados */}
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
        {/* Total Vehículos */}
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
        {/* Vehículos en Uso */}
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
        {/* Registros Pendientes */}
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

      <Divider sx={{ my: 4 }} />

      {/* Secciones de Información Rápida (Quick Glance) */}
      <Grid container spacing={3}>
        {/* Clima Actual */}
        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{
              boxShadow: "md",
              borderRadius: "lg",
              p: 2,
              minHeight: { xs: "auto", md: 200 },
            }}>
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
                <Typography level="body-md">Cargando clima...</Typography>
              )}
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Últimos 5 Registros de Uso */}
        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{
              boxShadow: "md",
              borderRadius: "lg",
              p: 2,
              minHeight: { xs: "auto", md: 200 },
            }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <AccessTimeFilledIcon />
                <Typography level="title-md">Actividad Reciente</Typography>
              </Stack>
              {dashboardMetrics.ultimosRegistros.length > 0 ? (
                <Sheet variant="soft" sx={{ borderRadius: "md", p: 1 }}>
                  <Table borderAxis="none" size="sm">
                    <tbody>
                      {dashboardMetrics.ultimosRegistros.map((registro, i) => (
                        <tr key={registro.id || i}>
                          <td>
                            <Typography level="body-sm" fontWeight="md">
                              {registro.empleado?.nombre || "N/A"}
                            </Typography>
                            <Typography level="body-xs">
                              {registro.vehiculo?.marca || "N/A"} (
                              {registro.vehiculo?.placa || "N/A"})
                            </Typography>
                          </td>
                          <td>
                            <Typography
                              level="body-xs"
                              sx={{ whiteSpace: "nowrap" }}>
                              {new Date(
                                registro.fecha_salida
                              ).toLocaleDateString("es-HN")}
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

        {/* Top 3 Empleados Más Activos */}
        <Grid xs={12} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{
              boxShadow: "md",
              borderRadius: "lg",
              p: 2,
              minHeight: { xs: "auto", md: 200 },
            }}>
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
                      {dashboardMetrics.topEmpleadosActivos.map(
                        (empleado, i) => (
                          <tr key={i}>
                            <td>
                              <Typography level="body-sm" fontWeight="md">
                                {empleado.nombre_empleado}
                              </Typography>
                              <Typography level="body-xs">
                                {empleado.puesto}
                              </Typography>
                            </td>
                            <td>
                              <Typography level="body-sm" fontWeight="bold">
                                {empleado.total_salidas}
                              </Typography>
                              <Typography level="body-xs">salidas</Typography>
                            </td>
                          </tr>
                        )
                      )}
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
