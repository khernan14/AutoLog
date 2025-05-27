import { Box, Table, Typography, Chip, Sheet, Stack } from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function VehicleTable({ vehicles }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    // Vista tipo tarjeta para móvil
    return (
      <Stack spacing={2}>
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((veh, index) => (
            <Sheet
              key={veh.id || index}
              variant="outlined"
              sx={{ p: 2, borderRadius: "md" }}>
              <Typography level="title-sm">{veh.placa || "N/A"}</Typography>
              <Typography level="body-sm">
                <strong>Marca:</strong> {veh.marca || "N/A"}
              </Typography>
              <Typography level="body-sm">
                <strong>Modelo:</strong> {veh.modelo || "N/A"}
              </Typography>
              <Typography level="body-sm">
                <strong>Estado:</strong>{" "}
                <Chip
                  size="sm"
                  color={
                    veh.estado === "Disponible"
                      ? "success"
                      : veh.estado === "En Uso"
                      ? "warning"
                      : "neutral"
                  }>
                  {veh.estado}
                </Chip>
              </Typography>
              <Typography level="body-sm">
                <strong>Ubicación:</strong> {veh.nombre_ubicacion || "N/A"}
              </Typography>
            </Sheet>
          ))
        ) : (
          <Typography level="body-sm" align="center">
            No hay vehículos disponibles.
          </Typography>
        )}
      </Stack>
    );
  }

  // Vista de tabla tradicional para pantallas más grandes
  return (
    <Sheet variant="outlined" sx={{ borderRadius: "md", p: 2 }}>
      <Table
        aria-label="Lista de vehículos"
        hoverRow
        stickyHeader
        sx={{ minWidth: 600 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Vehículo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Estado</th>
            <th>Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {vehicles && vehicles.length > 0 ? (
            vehicles.map((veh, index) => (
              <tr key={veh.id || index}>
                <td>{index + 1}</td>
                <td>{veh.placa || "N/A"}</td>
                <td>{veh.marca || "N/A"}</td>
                <td>{veh.modelo || "N/A"}</td>
                <td>
                  <Chip
                    size="sm"
                    color={
                      veh.estado === "Disponible"
                        ? "success"
                        : veh.estado === "En Uso"
                        ? "warning"
                        : "neutral"
                    }>
                    {veh.estado}
                  </Chip>
                </td>
                <td>{veh.nombre_ubicacion || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <Typography level="body-sm" align="center">
                  No hay vehículos disponibles.
                </Typography>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Sheet>
  );
}
