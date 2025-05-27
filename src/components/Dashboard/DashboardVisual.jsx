import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  Sheet,
} from "@mui/joy";
import { LineChart } from "@mui/x-charts/LineChart";
import { fetchDashboardData } from "../../services/DashboardServices";

export default function DashboardVisual() {
  const [data, setData] = useState({
    registrosHoy: 0,
    registrosSemana: 0,
    registrosMes: 0,
    topEmpleados: [],
    registrosPorHora: [],
    rankingCombustible: [],
  });

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

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h2" mb={3}>
        Panel de Control
      </Typography>

      {/* Tarjetas de resumen */}
      <Grid container spacing={2}>
        {[
          { label: "Registros Hoy", value: data.registrosHoy },
          { label: "Registros Semana", value: data.registrosSemana },
          { label: "Registros Mes", value: data.registrosMes },
        ].map((item, index) => (
          <Grid key={index} xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-md">{item.label}</Typography>
                <Typography level="h3">{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Gráfico de registros por hora */}
      <Typography level="title-lg" mb={2}>
        Registros por Hora
      </Typography>
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

      <Divider sx={{ my: 4 }} />

      {/* Tabla de Top Empleados */}
      <Typography level="title-lg" mb={2}>
        Top Empleados
      </Typography>
      <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "auto" }}>
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
          {/* <tfoot>
            <tr>
              <th scope="row">Totals</th>
              <td>{sum("total_registros").toFixed(2)}</td>
            </tr>
          </tfoot> */}
        </Table>
      </Sheet>

      <Divider sx={{ my: 4 }} />

      {/* Tabla de Ranking por Combustible */}
      <Typography level="title-lg" mb={2}>
        Ranking por Consumo de Combustible
      </Typography>
      <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "auto" }}>
        <Table borderAxis="none" stickyHeader hoverRow>
          <thead>
            <tr>
              <th>#</th>
              <th>Empleado</th>
              <th>Vehiculo</th>
              <th>Kilometro de Salida</th>
              <th>Kilometro de Regreso</th>
              <th>Combustible de Salida</th>
              <th>Combustible de Regreso</th>
              <th>Kilometros por Litro</th>
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
    </Box>
  );
}
