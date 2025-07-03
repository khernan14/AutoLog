import { Card, Typography, Chip, Box } from "@mui/joy";

export default function ReportCard({ registro, onClick }) {
  const { vehiculo, empleado, fecha_salida, fecha_regreso, estado } = registro;

  return (
    <Card
      variant="outlined"
      sx={{ mt: 2, cursor: "pointer" }}
      onClick={() => onClick?.(registro)}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography level="title-md">
          {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
        </Typography>
        <Chip color="primary" variant="soft">
          {estado}
        </Chip>
      </Box>
      <Typography level="body-sm">
        Empleado: {empleado.nombre} ({empleado.puesto})
      </Typography>
      <Typography level="body-xs">
        Salida: {new Date(fecha_salida).toLocaleString()} <br />
        Regreso:{" "}
        {fecha_regreso ? new Date(fecha_regreso).toLocaleString() : "En curso"}
      </Typography>
    </Card>
  );
}
