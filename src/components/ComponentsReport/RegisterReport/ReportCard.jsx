import { Card, Typography, Chip, Box, Divider, IconButton } from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

export default function ReportCard({ registro, onClick }) {
  const { vehiculo, empleado, fecha_salida, fecha_regreso, estado } = registro;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Activo":
        return "warning";
      case "Finalizado":
        return "success";
      default:
        return "neutral";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "Activo":
        return <PendingActionsIcon color="warning" />;
      case "Finalizado":
        return <CheckCircleIcon color="success" />;
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        p: 3,
        boxShadow: "lg",
        bgcolor: "background.body",
        cursor: "pointer",
        transition: "all 0.25s ease",
        "&:hover": {
          boxShadow: "xl",
          transform: "translateY(-3px)",
        },
        borderRadius: "xl",
      }}
      onClick={() => onClick?.(registro)}>
      {/* Estado e ícono */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          {getEstadoIcon(estado)}
          <Typography level="title-sm" fontWeight="md">
            Estado:
          </Typography>
          <Chip size="sm" variant="soft" color={getEstadoColor(estado)}>
            {estado}
          </Chip>
        </Box>
      </Box>

      <Divider />

      {/* Vehículo */}
      <Box mt={2} mb={1}>
        <Typography level="title-md" fontWeight="lg">
          {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
        </Typography>
      </Box>

      {/* Empleado */}
      <Box mb={1}>
        <Typography level="body-sm">
          Empleado: <b>{empleado.nombre}</b> ({empleado.puesto})
        </Typography>
      </Box>

      {/* Fechas */}
      <Box>
        <Typography level="body-xs" color="text.secondary">
          Salida: {new Date(fecha_salida).toLocaleString()}
        </Typography>
        <Typography level="body-xs" color="text.secondary">
          Regreso:{" "}
          {fecha_regreso
            ? new Date(fecha_regreso).toLocaleString()
            : "En curso"}
        </Typography>
      </Box>
    </Card>
  );
}
