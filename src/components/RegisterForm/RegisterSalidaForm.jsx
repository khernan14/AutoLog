import { useState, useEffect } from "react";
import { ListarVehiculosEmpleado } from "../../services/VehiculosService";
import {
  obtenerCombustibleActual,
  obtenerKmActual,
  registrarSalida,
  SubirImagenesRegistro,
} from "../../services/RegistrosService";
import { sendNotificacionSalida } from "../../services/MailServices";
import UploadImages from "./UploadImages";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Typography,
  Stack,
  Divider,
  Card,
  Option,
  CardOverflow,
  CardActions,
  Select,
  Alert,
  CircularProgress,
} from "@mui/joy";
import { selectClasses } from "@mui/joy/Select";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function SalidaForm({ vehicles, usuario, emailSupervisor }) {
  const [vehicleSelected, setVehicleSelected] = useState("");
  const [listVehicles, setListVehicles] = useState([]);
  const [kmActual, setKmActual] = useState("");
  const [kmManual, setKmManual] = useState(false);
  const [fuelActual, setFuelActual] = useState("");
  const [fuelManual, setFuelManual] = useState(false);
  const [observations, setObservations] = useState("");
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario?.id_empleado) return;

    const loadListVehicles = async () => {
      const data = await ListarVehiculosEmpleado(usuario.id_empleado);
      if (data) setListVehicles(data);
    };
    loadListVehicles();
  }, [usuario]);

  const handleVehicleChange = async (_, value) => {
    setVehicleSelected(value);
    setErrorMessage("");

    try {
      const kilometraje = await obtenerKmActual(value);
      const combustible = await obtenerCombustibleActual(value);

      const km = kilometraje?.km_regreso || 0;
      const combustibleActual = combustible?.combustible_regreso || 0;

      if (km > 0 && combustibleActual > 0) {
        setKmActual(km.toString());
        setKmManual(false);
        setFuelActual(combustibleActual.toString());
        setFuelManual(false);
      } else {
        setKmActual("");
        setKmManual(true);
        setFuelActual("");
        setFuelManual(true);
      }
    } catch (error) {
      console.error("Error obteniendo datos:", error);
      setKmActual("");
      setKmManual(true);
      setFuelActual("");
      setFuelManual(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (
      !kmActual ||
      !vehicleSelected ||
      !fuelActual ||
      !observations ||
      !images.length
    ) {
      setErrorMessage("Por favor, rellena todos los campos obligatorios.");
      setIsSubmitting(false);
      return;
    }

    const foundVehicle = vehicles.find(
      (v) => v.id === parseInt(vehicleSelected)
    );

    const payload = {
      ...foundVehicle,
      id_empleado: usuario.id_empleado,
      id_vehiculo: foundVehicle?.id,
      id_ubicacion_salida: foundVehicle?.LocationID ?? null,
      km_salida: parseInt(kmActual),
      combustible_salida: parseInt(fuelActual),
      comentario_salida: observations,
    };

    try {
      const register = await registrarSalida(payload);
      const onlyFiles = images.map((f) => f.file);

      if (register) {
        const imagesData = await SubirImagenesRegistro(
          register.id_registro,
          onlyFiles
        );
        if (imagesData) {
          Swal.fire({
            title: "¡Salida registrada con éxito!",
            text: "Salida registrada con éxito 🚗",
            icon: "success",
            confirmButtonColor: "#03624C",
          }).then(() => {
            navigate("/admin/panel-vehiculos", {
              state: { mensaje: "Salida registrada con éxito 🚗✅" },
            });
            const destinatarios = [usuario.email];
            if (emailSupervisor?.supervisor_email) {
              destinatarios.push(emailSupervisor.supervisor_email);
            }

            sendNotificacionSalida({
              to: [usuario.email, emailSupervisor.supervisor_email],
              employeeName: usuario.nombre,
              vehicleName: foundVehicle.placa,
              supervisorName: emailSupervisor.supervisor_nombre,
            });
          });
        }
      }
    } catch (error) {
      console.error("Error al registrar la salida:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al registrar la salida. Intenta de nuevo.",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/panel-vehiculos");
  };

  return (
    <Stack
      spacing={4}
      sx={{
        display: "flex",
        maxWidth: "700px",
        mx: "auto",
        px: { xs: 2, md: 6 },
        py: { xs: 2, md: 3 },
      }}>
      {errorMessage && (
        <Alert
          color="danger"
          variant="soft"
          onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography level="title-md">
            Realiza el Registro de Salida
          </Typography>
          <Typography level="body-sm">
            Realiza el registro de salida de tu vehículo en el sistema de
            registro de vehículos.
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>Vehículo</FormLabel>
            <Select
              value={vehicleSelected}
              onChange={handleVehicleChange}
              placeholder="Selecciona Un Vehiculo..."
              indicator={<KeyboardArrowDown />}
              fullWidth
              sx={{
                [`& .${selectClasses.indicator}`]: {
                  transition: "0.2s",
                  [`&.${selectClasses.expanded}`]: {
                    transform: "rotate(-180deg)",
                  },
                },
              }}>
              <Option value="">Selecciona un vehículo</Option>
              {listVehicles?.map((v) => (
                <Option key={v.id} value={v.id}>
                  {v.placa} - {v.marca} {v.modelo}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Kilometraje Actual</FormLabel>
            <Input
              fullWidth
              size="sm"
              type="text"
              placeholder="Ingrese el Kilometraje"
              value={kmActual}
              onChange={(e) => setKmActual(e.target.value)}
              readOnly={!kmManual}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Porcentaje de Combustible</FormLabel>
            <Input
              fullWidth
              size="sm"
              type="number"
              placeholder="Porcentaje (%)"
              value={fuelActual}
              onChange={(e) => setFuelActual(e.target.value)}
              readOnly={!fuelManual}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Observaciones</FormLabel>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              maxRows={3}
              placeholder="Observaciones"
              minRows={2}
              sx={{
                "--Textarea-focusedInset": "var(--any, )",
                "--Textarea-focusedThickness": "0.25rem",
                "--Textarea-focusedHighlight": "rgba(13,110,253,.25)",
              }}
            />
          </FormControl>

          <UploadImages images={images} setImages={setImages} />
        </Stack>

        <CardOverflow
          sx={{ borderTop: "1px solid", borderColor: "divider", mt: 3 }}>
          <CardActions sx={{ justifyContent: "flex-end", pt: 2 }}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              onClick={handleCancel}
              disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="solid"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              startDecorator={isSubmitting && <CircularProgress size="sm" />}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </CardActions>
        </CardOverflow>
      </Card>
    </Stack>
  );
}
