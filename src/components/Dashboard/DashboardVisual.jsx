import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Sheet,
  Table,
  Divider,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/joy";
import { BarChart } from "@mui/x-charts/BarChart"; // Usaremos BarChart para los nuevos reportes
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // Icono para vehículos
import PersonIcon from "@mui/icons-material/Person"; // Icono para empleados
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation"; // Icono para combustible
import SpeedIcon from "@mui/icons-material/Speed"; // Icono para kilometraje

// Asumo que fetchDashboardData sigue proporcionando los resúmenes de hoy, semana, mes.
import { fetchDashboardData } from "../../services/DashboardServices";

// Importamos las nuevas funciones de reporte
import {
  getEmpleadosMasSalidasReport,
  getKilometrajePorEmpleadoReport,
  getVehiculosMasUtilizadosReport,
  getConsumoCombustibleVehiculoReport,
} from "../../services/ReportServices";

export default function DashboardVisual() {
  const [dashboardData, setDashboardData] = useState({
    registrosHoy: 0,
    registrosSemana: 0,
    registrosMes: 0,
    empleadosMasSalidas: [],
    kilometrajePorEmpleado: [],
    vehiculosMasUtilizados: [],
    consumoCombustibleVehiculo: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch de todos los datos en paralelo
        const [
          hoy,
          semana,
          mes,
          empleadosMasSalidas,
          kilometrajePorEmpleado,
          vehiculosMasUtilizados,
          consumoCombustibleVehiculo,
        ] = await Promise.all([
          fetchDashboardData("registros_hoy"),
          fetchDashboardData("registros_semana"),
          fetchDashboardData("registros_mes"),
          getEmpleadosMasSalidasReport(),
          getKilometrajePorEmpleadoReport(),
          getVehiculosMasUtilizadosReport(),
          getConsumoCombustibleVehiculoReport(),
        ]);

        setDashboardData({
          registrosHoy: hoy[0]?.total_hoy || 0,
          registrosSemana: semana[0]?.total_semana || 0,
          registrosMes: mes[0]?.total_mes || 0,
          empleadosMasSalidas: empleadosMasSalidas,
          kilometrajePorEmpleado: kilometrajePorEmpleado,
          vehiculosMasUtilizados: vehiculosMasUtilizados,
          consumoCombustibleVehiculo: consumoCombustibleVehiculo,
        });
      } catch (err) {
        console.error("Error al cargar los datos del dashboard:", err);
        setError(
          "No se pudieron cargar los datos del dashboard. Por favor, intente de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const resumenCards = [
    {
      label: "Registros Hoy",
      value: dashboardData.registrosHoy,
      icon: <AccessTimeIcon />,
      color: "primary",
    },
    {
      label: "Registros Semana",
      value: dashboardData.registrosSemana,
      icon: <CalendarTodayIcon />,
      color: "success",
    },
    {
      label: "Registros Mes",
      value: dashboardData.registrosMes,
      icon: <EventIcon />,
      color: "warning",
    },
  ];

  // Datos para el gráfico de Empleados con Más Salidas (Top 5)
  const topEmpleadosData = dashboardData.empleadosMasSalidas.slice(0, 5);
  const empleadosLabels = topEmpleadosData.map((item) => item.nombre_empleado);
  const empleadosSeries = topEmpleadosData.map((item) => item.total_salidas);

  // Datos para el gráfico de Vehículos Más Utilizados (Top 5)
  const topVehiculosData = dashboardData.vehiculosMasUtilizados.slice(0, 5);
  const vehiculosLabels = topVehiculosData.map(
    (item) => `${item.marca} ${item.modelo} (${item.placa})`
  );
  const vehiculosSeries = topVehiculosData.map((item) => item.total_usos);

  // Datos para la tabla de Kilometraje por Empleado (Top 10)
  const kilometrajeTableData = dashboardData.kilometrajePorEmpleado.slice(
    0,
    10
  );

  // Datos para la tabla de Consumo de Combustible por Vehículo (Top 10)
  const consumoCombustibleTableData =
    dashboardData.consumoCombustibleVehiculo.slice(0, 10);

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
          Cargando dashboard...
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography level="h2" mb={3}>
        Panel de Control de Vehículos
      </Typography>

      {/* Sección de Resumen General */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {resumenCards.map((item, index) => (
          <Grid key={index} xs={12} sm={4}>
            <Card variant="soft" color={item.color}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton variant="solid" color={item.color} size="lg">
                    {item.icon}
                  </IconButton>
                  <Box>
                    <Typography level="title-md">{item.label}</Typography>
                    <Typography level="h3">{item.value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Gráfico: Top 5 Empleados con Más Salidas */}
      <Typography level="h3" mb={2} startDecorator={<PersonIcon />}>
        Top 5 Empleados con Más Salidas
      </Typography>
      <Card variant="outlined" sx={{ mb: 4, height: { xs: "auto", md: 400 } }}>
        <CardContent>
          {topEmpleadosData.length > 0 ? (
            <BarChart
              height={300}
              series={[
                {
                  data: empleadosSeries,
                  label: "Total de Salidas",
                  color: "#16A085",
                },
              ]}
              xAxis={[
                { scaleType: "band", data: empleadosLabels, label: "Empleado" },
              ]}
              yAxis={[{ label: "Número de Salidas" }]}
              layout="vertical" // Para mejor lectura de nombres largos
              margin={{ left: 120, right: 20, top: 20, bottom: 30 }} // Ajustar márgenes para etiquetas
            />
          ) : (
            <Alert color="info" variant="soft">
              <Typography level="body-md">
                No hay datos de empleados con más salidas para mostrar.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Gráfico: Top 5 Vehículos Más Utilizados */}
      <Typography level="h3" mb={2} startDecorator={<DirectionsCarIcon />}>
        Top 5 Vehículos Más Utilizados
      </Typography>
      <Card variant="outlined" sx={{ mb: 4, height: { xs: "auto", md: 400 } }}>
        <CardContent>
          {topVehiculosData.length > 0 ? (
            <BarChart
              height={300}
              series={[
                {
                  data: vehiculosSeries,
                  label: "Total de Usos",
                  color: "#3498DB",
                },
              ]}
              xAxis={[
                { scaleType: "band", data: vehiculosLabels, label: "Vehículo" },
              ]}
              yAxis={[{ label: "Número de Usos" }]}
              layout="vertical" // Para mejor lectura de nombres largos
              margin={{ left: 150, right: 20, top: 20, bottom: 30 }} // Ajustar márgenes para etiquetas
            />
          ) : (
            <Alert color="info" variant="soft">
              <Typography level="body-md">
                No hay datos de vehículos más utilizados para mostrar.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Tabla: Kilometraje Total por Empleado */}
      <Grid container spacing={4}>
        <Grid xs={12} md={6}>
          <Typography level="h3" mb={2} startDecorator={<SpeedIcon />}>
            Kilometraje Total por Empleado (Top 10)
          </Typography>
          {kilometrajeTableData.length > 0 ? (
            <Sheet
              variant="outlined"
              sx={{
                width: "100%",
                overflow: "auto",
                borderRadius: "md",
                boxShadow: "sm",
                minHeight: { xs: "auto", md: 300 },
              }}>
              <Table
                aria-label="Tabla de kilometraje por empleado"
                stickyHeader
                hoverRow
                sx={{
                  "--Table-headerUnderline": "1px solid",
                  "--TableCell-borderColor": (theme) =>
                    theme.vars.palette.divider,
                  "& thead th": {
                    backgroundColor: "background.level1",
                    fontWeight: "bold",
                    color: "text.primary",
                  },
                  "& tbody tr:hover": {
                    backgroundColor: "background.level2",
                  },
                }}>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Kilometraje Total</th>
                  </tr>
                </thead>
                <tbody>
                  {kilometrajeTableData.map((item, index) => {
                    const kilometraje = parseFloat(
                      item.kilometraje_total_recorrido
                    );
                    const displayKilometraje = Number.isFinite(kilometraje)
                      ? kilometraje.toFixed(2) + " km"
                      : "N/A";
                    return (
                      <tr key={index}>
                        <td>{item.nombre_empleado}</td>
                        <td>{displayKilometraje}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Sheet>
          ) : (
            <Alert color="info" variant="soft">
              <Typography level="body-md">
                No hay datos de kilometraje por empleado para mostrar.
              </Typography>
            </Alert>
          )}
        </Grid>

        {/* Tabla: Consumo Promedio de Combustible por Vehículo */}
        <Grid xs={12} md={6}>
          <Typography
            level="h3"
            mb={2}
            startDecorator={<LocalGasStationIcon />}>
            Consumo Promedio de Combustible por Vehículo (Top 10)
          </Typography>
          {consumoCombustibleTableData.length > 0 ? (
            <Sheet
              variant="outlined"
              sx={{
                width: "100%",
                overflow: "auto",
                borderRadius: "md",
                boxShadow: "sm",
                minHeight: { xs: "auto", md: 300 },
              }}>
              <Table
                aria-label="Tabla de consumo promedio de combustible por vehículo"
                stickyHeader
                hoverRow
                sx={{
                  "--Table-headerUnderline": "1px solid",
                  "--TableCell-borderColor": (theme) =>
                    theme.vars.palette.divider,
                  "& thead th": {
                    backgroundColor: "background.level1",
                    fontWeight: "bold",
                    color: "text.primary",
                  },
                  "& tbody tr:hover": {
                    backgroundColor: "background.level2",
                  },
                }}>
                <thead>
                  <tr>
                    <th>Vehículo</th>
                    <th>Consumo Promedio (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {consumoCombustibleTableData.map((item, index) => {
                    const promedioConsumo = parseFloat(
                      item.promedio_consumo_porcentaje
                    );
                    const displayConsumo = Number.isFinite(promedioConsumo)
                      ? promedioConsumo.toFixed(2) + "%"
                      : "N/A";
                    return (
                      <tr key={index}>
                        <td>{`${item.marca} ${item.modelo} (${item.placa})`}</td>
                        <td>{displayConsumo}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Sheet>
          ) : (
            <Alert color="info" variant="soft">
              <Typography level="body-md">
                No hay datos de consumo de combustible para mostrar.
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
