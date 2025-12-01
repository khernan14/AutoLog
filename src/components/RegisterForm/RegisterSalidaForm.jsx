import { useState, useEffect, useMemo } from "react";
import { ListarVehiculosEmpleado } from "../../services/VehiculosService";
import {
  obtenerCombustibleActual,
  obtenerKmActual,
  registrarSalida,
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
  CardOverflow,
  CardActions,
  Alert,
} from "@mui/joy";
import Autocomplete from "@mui/joy/Autocomplete";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/**
 * SalidaForm robusto:
 * - resuelve id_empleado desde props.usuario o desde localStorage (fallback)
 * - maneja preselección vía vehiculoPreseleccionado (QR)
 * - logs para depuración
 */

export default function SalidaForm({
  vehicles = [],
  usuario = null,
  emailSupervisor = null,
  vehiculoPreseleccionado = null,
}) {
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

  // Helper para resolver idEmpleado de forma robusta
  const resolveIdEmpleado = () => {
    let id = usuario?.id_empleado ?? usuario?.id ?? usuario?.id_usuario ?? null;

    if (!id) {
      try {
        const stored =
          localStorage.getItem("user") ||
          localStorage.getItem("USER") ||
          localStorage.getItem("usuario");
        if (stored) {
          const parsed = JSON.parse(stored);
          id = parsed?.id_empleado ?? parsed?.id ?? parsed?.id_usuario ?? id;
        }
      } catch (err) {
        console.warn("No se pudo parsear user de localStorage:", err);
      }
    }
    return id;
  };

  // Cargar la lista de vehículos asignados al empleado
  useEffect(() => {
    const load = async () => {
      const idEmpleado = resolveIdEmpleado();
      console.log(
        "[SalidaForm] resolveIdEmpleado:",
        idEmpleado,
        "usuario:",
        usuario
      );
      if (!idEmpleado) {
        // no hacemos nada — el componente padre debe controlar la autenticación
        return;
      }

      try {
        const data = await ListarVehiculosEmpleado(idEmpleado);
        setListVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al listar vehículos del empleado:", err);
        setListVehicles([]);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  // Manejar cambio/selección de vehículo (id)
  const handleVehicleChange = async (_, value) => {
    // value puede ser id (number) o null
    const id = value ?? null;
    setVehicleSelected(id);
    setErrorMessage("");

    if (!id) {
      setKmActual("");
      setFuelActual("");
      setKmManual(true);
      setFuelManual(true);
      return;
    }

    try {
      const kilometraje = await obtenerKmActual(id);
      const combustible = await obtenerCombustibleActual(id);

      const km = kilometraje?.km_regreso ?? kilometraje?.km ?? 0;
      const combustibleActual =
        combustible?.combustible_regreso ?? combustible?.combustible ?? 0;

      if (km > 0 || combustibleActual > 0) {
        setKmActual(km ? String(km) : "");
        setKmManual(!km);
        setFuelActual(combustibleActual ? String(combustibleActual) : "");
        setFuelManual(!combustibleActual);
      } else {
        setKmActual("");
        setKmManual(true);
        setFuelActual("");
        setFuelManual(true);
      }
    } catch (error) {
      console.error("Error obteniendo datos de km/combustible:", error);
      setKmActual("");
      setKmManual(true);
      setFuelActual("");
      setFuelManual(true);
    }
  };

  // Si viene desde QR (vehiculoPreseleccionado), preseleccionarlo
  useEffect(() => {
    if (!vehiculoPreseleccionado) return;

    const idFromQR =
      vehiculoPreseleccionado.id_vehiculo ??
      vehiculoPreseleccionado.id ??
      vehiculoPreseleccionado?.vehiculoId ??
      null;
    if (!idFromQR) return;

    // fijamos vehicleSelected y cargamos km/combustible
    setVehicleSelected(idFromQR);
    // llamamos handleVehicleChange para cargar km/combustible
    handleVehicleChange(null, idFromQR);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculoPreseleccionado]);

  // Para que Autocomplete reciba el objeto completo
  const selectedVehiculoObj = useMemo(() => {
    if (!vehicleSelected) return null;
    const idNum =
      typeof vehicleSelected === "string"
        ? parseInt(vehicleSelected, 10)
        : vehicleSelected;
    if (!idNum) return null;
    return listVehicles.find((v) => v.id === idNum) || null;
  }, [vehicleSelected, listVehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    // Validaciones básicas
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

    const kmParsed = parseInt(kmActual, 10);
    const fuelParsed = parseInt(fuelActual, 10);

    if (
      isNaN(kmParsed) ||
      isNaN(fuelParsed) ||
      kmParsed < 0 ||
      fuelParsed < 0 ||
      fuelParsed > 100
    ) {
      setErrorMessage(
        "Verifica que el kilometraje sea válido y el combustible esté entre 0 y 100."
      );
      setIsSubmitting(false);
      return;
    }

    // resolver id empleado robustamente
    let idEmpleado = resolveIdEmpleado();
    if (!idEmpleado) {
      setErrorMessage(
        "Datos de usuario inválidos. Por favor, inicia sesión de nuevo."
      );
      setIsSubmitting(false);
      return;
    }

    // resolver vehiculo
    const selectedId =
      typeof vehicleSelected === "string"
        ? parseInt(vehicleSelected, 10)
        : vehicleSelected;
    let foundVehicle =
      vehicles.find((v) => v.id === selectedId) ||
      listVehicles.find((v) => v.id === selectedId) ||
      null;

    // si no encontramos el vehículo, tratamos de usar el objeto preseleccionado
    if (!foundVehicle && vehiculoPreseleccionado) {
      const idFromQR =
        vehiculoPreseleccionado.id_vehiculo ??
        vehiculoPreseleccionado.id ??
        null;
      if (idFromQR === selectedId) {
        foundVehicle = {
          id: idFromQR,
          placa: vehiculoPreseleccionado.placa,
          marca: vehiculoPreseleccionado.marca,
          modelo: vehiculoPreseleccionado.modelo,
          LocationID: vehiculoPreseleccionado.LocationID ?? null,
        };
      }
    }

    if (!foundVehicle) {
      setErrorMessage("Vehículo no válido. Selecciona un vehículo existente.");
      setIsSubmitting(false);
      return;
    }

    // Construir formData
    const formData = new FormData();
    formData.append("id_empleado", idEmpleado);
    formData.append("id_vehiculo", foundVehicle.id);
    // LocationID puede llamarse distinto; si no existe dejamos null
    formData.append(
      "id_ubicacion_salida",
      foundVehicle?.LocationID ?? foundVehicle?.locationId ?? ""
    );
    formData.append("km_salida", kmParsed);
    formData.append("combustible_salida", fuelParsed);
    formData.append("comentario_salida", observations);

    images.forEach((file) => {
      formData.append("files", file);
    });

    try {
      console.log("[SalidaForm] enviando registro:", {
        id_empleado: idEmpleado,
        id_vehiculo: foundVehicle.id,
        km_salida: kmParsed,
        combustible_salida: fuelParsed,
      });

      const register = await registrarSalida(formData);

      if (register) {
        Swal.fire({
          title: "¡Salida registrada con éxito!",
          text: "Salida registrada con éxito 🚗",
          icon: "success",
          confirmButtonColor: "#03624C",
        }).then(() => {
          navigate("/admin/panel-vehiculos", {
            state: { mensaje: "Salida registrada con éxito 🚗✅" },
          });

          try {
            if (emailSupervisor?.supervisor_email) {
              sendNotificacionSalida({
                to: [usuario?.email, emailSupervisor.supervisor_email].filter(
                  Boolean
                ),
                employeeName: usuario?.nombre,
                vehicleName: foundVehicle.placa,
                supervisorName: emailSupervisor.supervisor_nombre,
              });
            }
          } catch (err) {
            console.warn("No se pudo enviar notificación de salida:", err);
          }
        });
      }
    } catch (error) {
      console.error("Error al registrar la salida:", error);

      const errMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Ocurrió un error al registrar la salida. Intenta de nuevo.";

      Swal.fire({
        title: "Error",
        text: errMsg,
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
            <Autocomplete
              placeholder="Selecciona un vehículo..."
              options={listVehicles || []}
              getOptionLabel={(option) =>
                option
                  ? `${option.placa} - ${option.marca} ${option.modelo}`
                  : ""
              }
              value={selectedVehiculoObj}
              onChange={(_, newValue) => {
                if (!newValue) {
                  setVehicleSelected("");
                  setKmActual("");
                  setFuelActual("");
                  setKmManual(true);
                  setFuelManual(true);
                  return;
                }
                const id = newValue.id;
                setVehicleSelected(id);
                handleVehicleChange(null, id);
              }}
              disabled={!!vehiculoPreseleccionado}
              sx={{ width: "100%" }}
            />
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

          <UploadImages value={images} onChange={setImages} />
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
              disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </CardActions>
        </CardOverflow>
      </Card>
    </Stack>
  );
}
