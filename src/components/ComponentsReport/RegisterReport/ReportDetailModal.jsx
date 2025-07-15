import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Divider,
  Stack,
  Chip,
  Sheet,
  IconButton,
} from "@mui/joy";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { useState } from "react";

export default function ReportDetailModal({ open, onClose, registro }) {
  const [zoomedImage, setZoomedImage] = useState(null);

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

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          layout="center"
          size="lg"
          sx={{
            borderRadius: "xl",
            p: 3,
            maxWidth: 800,
            width: "90vw",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "lg",
          }}>
          <ModalClose />
          <Typography level="h4" mb={1}>
            Detalles del Registro - {vehiculo.placa || "Sin placa"}
          </Typography>
          <Divider />

          {/* Info del reporte */}
          <Stack spacing={1} mt={2}>
            <Typography level="title-sm" color="primary">
              Vehículo
            </Typography>
            <Typography level="body-sm">
              {vehiculo.marca} {vehiculo.modelo}
            </Typography>

            <Typography level="title-sm" color="primary" mt={1}>
              Empleado
            </Typography>
            <Typography level="body-sm">
              {empleado.nombre} ({empleado.puesto})
            </Typography>

            <Typography level="title-sm" color="primary" mt={1}>
              Fechas
            </Typography>
            <Typography level="body-sm">
              Salida: {formatDate(fecha_salida)}
            </Typography>
            <Typography level="body-sm">
              Regreso: {formatDate(fecha_regreso)}
            </Typography>

            <Typography level="title-sm" color="primary" mt={1}>
              Kilometraje
            </Typography>
            <Typography level="body-sm">Salida: {km_salida} km</Typography>
            <Typography level="body-sm">
              Regreso: {km_regreso ?? "-"} km{" "}
            </Typography>

            <Typography level="title-sm" color="primary" mt={1}>
              Combustible
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip size="sm">Salida: {combustible_salida ?? "-"}%</Chip>
              <Chip size="sm">Regreso: {combustible_regreso ?? "-"}%</Chip>
            </Stack>

            <Typography level="title-sm" color="primary" mt={1}>
              Comentarios
            </Typography>
            <Typography level="body-sm">
              Salida: {comentario_salida || "N/A"}
            </Typography>
            <Typography level="body-sm">
              Regreso: {comentario_regreso || "N/A"}
            </Typography>
          </Stack>

          {/* Galería de imágenes */}
          {images.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography level="title-sm" mb={1}>
                Evidencias
              </Typography>
              <ImageList
                cols={3}
                gap={12}
                sx={{
                  width: "100%",
                  m: 0,
                  "@media (max-width: 600px)": {
                    gridTemplateColumns: "repeat(2, 1fr)",
                  },
                }}>
                {images.map((img, i) => (
                  <ImageListItem
                    key={i}
                    sx={{
                      position: "relative",
                      borderRadius: "md",
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover .zoom-btn": {
                        opacity: 1,
                      },
                    }}
                    onClick={() => setZoomedImage(img.url)}>
                    <img
                      src={img.url}
                      alt={`evidencia-${i}`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      className="zoom-btn"
                      size="sm"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(0,0,0,0.5)",
                        color: "white",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}>
                      <ZoomInIcon />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </>
          )}
        </ModalDialog>
      </Modal>

      {/* Imagen expandida */}
      <Modal open={!!zoomedImage} onClose={() => setZoomedImage(null)}>
        <ModalDialog
          layout="center"
          sx={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            p: 1,
            borderRadius: "lg",
            overflow: "hidden",
          }}>
          <ModalClose />
          <img
            src={zoomedImage}
            alt="evidencia ampliada"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "85vh",
              borderRadius: "lg",
            }}
          />
        </ModalDialog>
      </Modal>
    </>
  );
}
