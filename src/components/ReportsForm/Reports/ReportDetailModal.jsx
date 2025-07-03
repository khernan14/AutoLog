// components/ReportsForm/Reports/ReportDetailModal.jsx
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Divider,
  Stack,
  Chip,
} from "@mui/joy";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

export default function ReportDetailModal({ open, onClose, registro }) {
  if (!registro) return null;

  const {
    vehiculo = {},
    empleado = {},
    fecha_salida,
    fecha_regreso,
    comentario_salida,
    comentario_regreso,
    km_salida,
    km_regreso,
    combustible_salida,
    combustible_regreso,
    images = [],
  } = registro;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="center" size="lg">
        <ModalClose />
        <Typography level="h4" mb={1}>
          Detalles del Registro - {vehiculo.placa || "Sin placa"}
        </Typography>
        <Divider />

        <Stack spacing={1} mt={2}>
          <Typography level="body-sm">
            Vehículo: {vehiculo.marca} {vehiculo.modelo}
          </Typography>
          <Typography level="body-sm">
            Empleado: {empleado.nombre} ({empleado.puesto})
          </Typography>
          <Typography level="body-sm">
            Fecha de salida: {new Date(fecha_salida).toLocaleString()}
          </Typography>
          <Typography level="body-sm">
            Fecha de regreso:{" "}
            {fecha_regreso
              ? new Date(fecha_regreso).toLocaleString()
              : "En curso"}
          </Typography>
          <Typography level="body-sm">KM salida: {km_salida} km</Typography>
          <Typography level="body-sm">
            KM regreso: {km_regreso ?? "-"}
          </Typography>
          <Typography level="body-sm">
            Combustible salida:{" "}
            <Chip size="sm">{combustible_salida ?? "-"}%</Chip>
          </Typography>
          <Typography level="body-sm">
            Combustible regreso:{" "}
            <Chip size="sm">{combustible_regreso ?? "-"}%</Chip>
          </Typography>
          <Typography level="body-sm">
            Comentario salida: {comentario_salida || "N/A"}
          </Typography>
          <Typography level="body-sm">
            Comentario regreso: {comentario_regreso || "N/A"}
          </Typography>
        </Stack>

        {images.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography level="title-sm" mb={1}>
              Evidencias
            </Typography>
            <ImageList cols={3} gap={8}>
              {images.map((img, i) => (
                <ImageListItem key={i}>
                  <img
                    src={img.url}
                    alt={`registro-img-${i}`}
                    loading="lazy"
                    style={{ borderRadius: "8px" }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </>
        )}
      </ModalDialog>
    </Modal>
  );
}
