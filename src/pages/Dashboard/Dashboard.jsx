import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Sheet,
  Table,
  Stack,
  CircularProgress,
  IconButton,
  Button,
  Alert,
  Chip,
  LinearProgress,
} from "@mui/joy";
import { BarChart } from "@mui/x-charts/BarChart";

// Iconos
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

// Servicios
import { fetchDashboardData } from "../../services/DashboardServices";
import {
  getEmpleadosMasSalidasReport,
  getKilometrajePorEmpleadoReport,
  getVehiculosMasUtilizadosReport,
  getConsumoCombustibleVehiculoReport,
  getTotalEmpleados,
  getTotalVehiculos,
  getVehiculosEnUso,
} from "../../services/ReportServices";

// Componente KPI Card Reutilizable con diseño moderno
const KpiCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card
    variant="solid"
    color={color}
    invertedColors
    sx={{ boxShadow: "lg", overflow: "hidden", position: "relative" }}>
    <Box
      sx={{
        position: "absolute",
        top: -20,
        right: -20,
        opacity: 0.2,
        transform: "rotate(15deg)",
      }}>
      <Icon sx={{ fontSize: 120 }} />
    </Box>
    <Stack spacing={1} sx={{ position: "relative", zIndex: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            p: 0.5,
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
          }}>
          <Icon />
        </Box>
        <Typography
          level="title-sm"
          textColor="common.white"
          sx={{ opacity: 0.9 }}>
          {title}
        </Typography>
      </Box>
      <Typography level="h2" textColor="common.white">
        {value}
      </Typography>
      {trend && (
        <Typography
          level="body-xs"
          textColor="common.white"
          sx={{ opacity: 0.8 }}>
          {trend}
        </Typography>
      )}
    </Stack>
  </Card>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    totalEmpleados: 0,
    totalVehiculos: 0,
    vehiculosEnUso: 0,
    registrosHoy: 0,
    registrosPendientes: 0, // Calculado o traído si existe endpoint
    empleadosTop: [],
    vehiculosTop: [],
    kilometrajeTop: [],
    consumoTop: [],
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        empleadosTotal,
        vehiculosTotal,
        enUso,
        hoy,
        empTop,
        vehTop,
        kmTop,
        fuelTop,
      ] = await Promise.all([
        getTotalEmpleados(),
        getTotalVehiculos(),
        getVehiculosEnUso(),
        fetchDashboardData("registros_hoy"),
        getEmpleadosMasSalidasReport(),
        getVehiculosMasUtilizadosReport(),
        getKilometrajePorEmpleadoReport(),
        getConsumoCombustibleVehiculoReport(),
      ]);

      setData({
        totalEmpleados: empleadosTotal?.total || 0,
        totalVehiculos: vehiculosTotal?.total || 0,
        vehiculosEnUso: enUso?.total || 0,
        registrosHoy: hoy[0]?.total_hoy || 0,
        empleadosTop: empTop || [],
        vehiculosTop: vehTop || [],
        kilometrajeTop: kmTop || [],
        consumoTop: fuelTop || [],
      });
    } catch (e) {
      console.error(e);
      setError(t("dashboard.errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Preparación de datos para gráficos
  const chartEmpleados = useMemo(
    () => ({
      labels: data.empleadosTop
        .slice(0, 5)
        .map((e) => e.nombre_empleado.split(" ")[0]), // Solo primer nombre
      data: data.empleadosTop.slice(0, 5).map((e) => e.total_salidas),
    }),
    [data.empleadosTop]
  );

  const chartVehiculos = useMemo(
    () => ({
      labels: data.vehiculosTop.slice(0, 5).map((v) => v.placa),
      data: data.vehiculosTop.slice(0, 5).map((v) => v.total_usos),
    }),
    [data.vehiculosTop]
  );

  if (loading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}>
        <CircularProgress size="lg" />
        <Typography>{t("common.loading")}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert
          color="danger"
          variant="soft"
          endDecorator={
            <Button size="sm" variant="soft" color="danger" onClick={loadData}>
              Reintentar
            </Button>
          }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: "auto" }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        spacing={2}>
        <Box>
          <Typography level="h2">{t("dashboard.title")}</Typography>
          <Typography level="body-md" color="neutral">
            {t("dashboard.subtitle")}
          </Typography>
        </Box>
        <IconButton variant="soft" onClick={loadData}>
          <RefreshRoundedIcon />
        </IconButton>
      </Stack>

      {/* KPI Grid */}
      <Grid container spacing={2} mb={4}>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard
            title={t("dashboard.kpi.active_vehicles")}
            value={`${data.vehiculosEnUso} / ${data.totalVehiculos}`}
            icon={DirectionsCarIcon}
            color="primary"
            trend={t("dashboard.kpi.currently_in_use")}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard
            title={t("dashboard.kpi.today_activity")}
            value={data.registrosHoy}
            icon={CheckCircleRoundedIcon}
            color="success"
            trend={t("dashboard.kpi.movements_today")}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard
            title={t("dashboard.kpi.total_employees")}
            value={data.totalEmpleados}
            icon={PersonIcon}
            color="neutral"
            trend={t("dashboard.kpi.registered")}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          {/* Ejemplo de KPI de alerta/pendiente */}
          <KpiCard
            title={t("dashboard.kpi.pending_maintenance")}
            value="0"
            icon={PendingActionsRoundedIcon}
            color="warning"
            trend={t("dashboard.kpi.requires_attention")}
          />
        </Grid>
      </Grid>

      {/* Gráficos Row */}
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} lg={6}>
          <Card variant="outlined" sx={{ height: "100%", borderRadius: "lg" }}>
            <Typography level="title-lg" mb={2}>
              {t("dashboard.charts.top_employees")}
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              {chartEmpleados.data.length > 0 ? (
                <BarChart
                  series={[
                    {
                      data: chartEmpleados.data,
                      color: "#0B6BCB",
                      label: t("dashboard.charts.exits"),
                    },
                  ]}
                  xAxis={[{ scaleType: "band", data: chartEmpleados.labels }]}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  borderRadius={4}
                />
              ) : (
                <Typography level="body-sm" textAlign="center" mt={10}>
                  {t("dashboard.empty_data")}
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
        <Grid xs={12} lg={6}>
          <Card variant="outlined" sx={{ height: "100%", borderRadius: "lg" }}>
            <Typography level="title-lg" mb={2}>
              {t("dashboard.charts.top_vehicles")}
            </Typography>
            <Box sx={{ width: "100%", height: 300 }}>
              {chartVehiculos.data.length > 0 ? (
                <BarChart
                  series={[
                    {
                      data: chartVehiculos.data,
                      color: "#10b981",
                      label: t("dashboard.charts.uses"),
                    },
                  ]}
                  xAxis={[{ scaleType: "band", data: chartVehiculos.labels }]}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  borderRadius={4}
                />
              ) : (
                <Typography level="body-sm" textAlign="center" mt={10}>
                  {t("dashboard.empty_data")}
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tablas Detalladas Row */}
      <Grid container spacing={3}>
        {/* Tabla Km */}
        <Grid xs={12} md={6}>
          <Sheet
            variant="outlined"
            sx={{ borderRadius: "lg", p: 0, overflow: "hidden" }}>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.surface",
              }}>
              <Typography level="title-md" startDecorator={<SpeedIcon />}>
                {t("dashboard.tables.km_title")}
              </Typography>
            </Box>
            <Table
              hoverRow
              sx={{ "& thead th": { bgcolor: "background.level1" } }}>
              <thead>
                <tr>
                  <th>{t("dashboard.tables.employee")}</th>
                  <th style={{ textAlign: "right" }}>
                    {t("dashboard.tables.km_total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.kilometrajeTop.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    <td>
                      <Typography level="body-sm" fontWeight="md">
                        {row.nombre_empleado}
                      </Typography>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Chip size="sm" variant="soft" color="neutral">
                        {Number(row.kilometraje_total_recorrido).toFixed(1)} km
                      </Chip>
                    </td>
                  </tr>
                ))}
                {data.kilometrajeTop.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      style={{ textAlign: "center", padding: 20 }}>
                      {t("dashboard.empty_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Sheet>
        </Grid>

        {/* Tabla Combustible (Con barra de progreso visual) */}
        <Grid xs={12} md={6}>
          <Sheet
            variant="outlined"
            sx={{ borderRadius: "lg", p: 0, overflow: "hidden" }}>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.surface",
              }}>
              <Typography
                level="title-md"
                startDecorator={<LocalGasStationIcon />}>
                {t("dashboard.tables.fuel_title")}
              </Typography>
            </Box>
            <Table
              hoverRow
              sx={{ "& thead th": { bgcolor: "background.level1" } }}>
              <thead>
                <tr>
                  <th>{t("dashboard.tables.vehicle")}</th>
                  <th>{t("dashboard.tables.consumption")}</th>
                </tr>
              </thead>
              <tbody>
                {data.consumoTop.slice(0, 5).map((row, i) => {
                  const val = parseFloat(row.promedio_consumo_porcentaje);
                  return (
                    <tr key={i}>
                      <td>
                        <Typography level="body-sm" fontWeight="md">
                          {row.marca} {row.modelo}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          {row.placa}
                        </Typography>
                      </td>
                      <td style={{ width: 150 }}>
                        <Stack spacing={0.5}>
                          <Typography level="body-xs" textAlign="right">
                            {val.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            determinate
                            value={Math.min(val, 100)}
                            color={
                              val > 80
                                ? "danger"
                                : val > 50
                                ? "warning"
                                : "success"
                            }
                            thickness={6}
                            sx={{ borderRadius: 4 }}
                          />
                        </Stack>
                      </td>
                    </tr>
                  );
                })}
                {data.consumoTop.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      style={{ textAlign: "center", padding: 20 }}>
                      {t("dashboard.empty_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Sheet>
        </Grid>
      </Grid>
    </Box>
  );
}
