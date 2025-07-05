import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  Sheet,
  CircularProgress,
  Alert,
} from "@mui/joy";
import { getKilometrajePorEmpleadoReport } from "../services/ReportServices"; // Asegúrate de que la ruta sea correcta

export default function KilometrajePorEmpleado() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getKilometrajePorEmpleadoReport();
        setReportData(data);
      } catch (err) {
        console.error(
          "Error al cargar el reporte de kilometraje por empleado:",
          err
        );
        setError(
          "No se pudo cargar el reporte de kilometraje por empleado. Por favor, intente de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

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
          Cargando reporte...
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
    <Box sx={{ p: 3 }}>
      <Typography level="h2" component="h1" sx={{ mb: 3 }}>
        Reporte: Kilometraje Total por Empleado
      </Typography>

      {reportData.length > 0 ? (
        <Sheet
          variant="outlined"
          sx={{
            width: "100%",
            overflow: "auto", // Permite scroll si la tabla es muy ancha
            borderRadius: "md",
            boxShadow: "sm",
          }}>
          <Table
            aria-label="Tabla de kilometraje por empleado"
            stickyHeader
            hoverRow
            sx={{
              "--Table-headerUnderline": "1px solid",
              "--TableCell-borderColor": (theme) => theme.vars.palette.divider,
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
                <th>Puesto</th>
                <th>Kilometraje Total Recorrido</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => {
                // Convertir a número y verificar si es finito antes de usar toFixed
                const kilometraje = parseFloat(
                  item.kilometraje_total_recorrido
                );
                const displayKilometraje = Number.isFinite(kilometraje)
                  ? kilometraje.toFixed(2) + " km"
                  : "N/A";

                return (
                  <tr key={index}>
                    <td>{item.nombre_empleado}</td>
                    <td>{item.puesto}</td>
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
            No hay datos disponibles para este reporte.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
