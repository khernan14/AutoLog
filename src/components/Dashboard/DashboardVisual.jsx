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
} from "@mui/joy";
import { LineChart } from "@mui/x-charts/LineChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import { fetchDashboardData } from "../../services/DashboardServices";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function DashboardVisual() {
  const [data, setData] = useState({
    registrosHoy: 0,
    registrosSemana: 0,
    registrosMes: 0,
    topEmpleados: [],
    registrosPorHora: [],
    rankingCombustible: [],
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const loadData = async () => {
      const [hoy, semana, mes, top, porHora, ranking] = await Promise.all([
        fetchDashboardData("registros_hoy"),
        fetchDashboardData("registros_semana"),
        fetchDashboardData("registros_mes"),
        fetchDashboardData("top_empleados"),
        fetchDashboardData("registros_por_hora"),
        fetchDashboardData("ranking_combustible"),
      ]);

      setData({
        registrosHoy: hoy[0]?.total_hoy || 0,
        registrosSemana: semana[0]?.total_semana || 0,
        registrosMes: mes[0]?.total_mes || 0,
        topEmpleados: top,
        registrosPorHora: porHora,
        rankingCombustible: ranking,
      });
    };

    loadData();
  }, []);

  const resumen = [
    {
      label: "Registros Hoy",
      value: data.registrosHoy,
      icon: <AccessTimeIcon />,
    },
    {
      label: "Registros Semana",
      value: data.registrosSemana,
      icon: <CalendarTodayIcon />,
    },
    {
      label: "Registros Mes",
      value: data.registrosMes,
      icon: <EventIcon />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography level="h2" mb={3}>
        Panel de Control
      </Typography>

      <Grid container spacing={2}>
        {resumen.map((item, index) => (
          <Grid key={index} xs={12} sm={4}>
            <Card variant="soft" color="primary">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton variant="solid" color="primary" size="lg">
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

      <Typography level="title-lg" mb={2}>
        Registros por Hora
      </Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <LineChart
            height={300}
            series={[
              {
                data: data.registrosPorHora.map((item) => item.total),
                label: "Registros",
              },
            ]}
            xAxis={[
              {
                scaleType: "point",
                data: data.registrosPorHora.map((item) => item.hora),
                label: "Hora",
              },
            ]}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Typography level="title-lg" mb={2}>
            Top Empleados
          </Typography>
          {isMobile ? (
            <Stack spacing={2}>
              {data.topEmpleados.map((empleado, i) => (
                <Card key={i} variant="outlined">
                  <CardContent>
                    <Typography level="title-sm">{empleado.nombre}</Typography>
                    <Typography level="body-sm">
                      Registros: {empleado.total_registros}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: "sm",
                overflow: "auto",
                "& table": { minWidth: "100%" },
              }}>
              <Table borderAxis="none" stickyHeader hoverRow>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Registros</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topEmpleados.map((empleado, i) => (
                    <tr key={i}>
                      <td>{empleado.nombre}</td>
                      <td>{empleado.total_registros}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          )}
        </Grid>

        <Grid xs={12} md={6}>
          <Typography level="title-lg" mb={2}>
            Ranking por Consumo de Combustible
          </Typography>
          {isMobile ? (
            <Stack spacing={2}>
              {data.rankingCombustible.map((item, i) => (
                <Card key={i} variant="outlined">
                  <CardContent>
                    <Typography level="title-sm">
                      {i + 1}. {item.empleado}
                    </Typography>
                    <Typography level="body-sm">
                      Vehículo: {item.placa}
                    </Typography>
                    <Typography level="body-sm">
                      Km Salida: {item.km_salida} | Km Regreso:{" "}
                      {item.km_regreso}
                    </Typography>
                    <Typography level="body-sm">
                      Comb. Salida: {item.combustible_salida} | Comb. Regreso:{" "}
                      {item.combustible_regreso}
                    </Typography>
                    <Typography level="body-sm">
                      Km/L:{" "}
                      {Number.isFinite(Number(item.km_por_litro))
                        ? Number(item.km_por_litro).toFixed(2)
                        : "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: "sm",
                overflow: "auto",
                "& table": { minWidth: "100%" },
              }}>
              <Table borderAxis="none" stickyHeader hoverRow>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Empleado</th>
                    <th>Vehículo</th>
                    <th>Km Salida</th>
                    <th>Km Regreso</th>
                    <th>Comb. Salida</th>
                    <th>Comb. Regreso</th>
                    <th>Km/L</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankingCombustible.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{item.empleado}</td>
                      <td>{item.placa}</td>
                      <td>{item.km_salida}</td>
                      <td>{item.km_regreso}</td>
                      <td>{item.combustible_salida}</td>
                      <td>{item.combustible_regreso}</td>
                      <td>
                        {Number.isFinite(Number(item.km_por_litro))
                          ? Number(item.km_por_litro).toFixed(2)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
