// src/components/RegisterForm/SalidaForm.jsx
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
import { useTranslation } from "react-i18next";

/**
 * SalidaForm mejorado:
 * - i18n
 * - validación en tiempo real
 * - prevención doble submit
 * - respeta tus servicios/rutas existentes
 */
export default function SalidaForm({
  vehicles = [],
  usuario = null,
  emailSupervisor = null,
  vehiculoPreseleccionado = null,
}) {
  const { t } = useTranslation();

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
    let mounted = true;
    const load = async () => {
      const idEmpleado = resolveIdEmpleado();
      console.debug(
        "[SalidaForm] resolveIdEmpleado:",
        idEmpleado,
        "usuario:",
        usuario
      );
      if (!idEmpleado) {
        // componente padre debe controlar auth
        return;
      }

      try {
        const data = await ListarVehiculosEmpleado(idEmpleado);
        if (!mounted) return;
        setListVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al listar vehículos del empleado:", err);
        if (mounted) setListVehicles([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  // Manejar cambio/selección de vehículo (id)
  const handleVehicleChange = async (_, value) => {
    // value puede ser objeto de vehiculo o id primitivo (según Autocomplete)
    const id = (value && (value.id ?? value)) ?? null;
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

      // intentamos extraer campos flexibles
      const km = kilometraje?.km_regreso ?? kilometraje?.km ?? 0;
      const combustibleActual =
        combustible?.combustible_regreso ?? combustible?.combustible ?? 0;

      if ((km && km > 0) || (combustibleActual && combustibleActual > 0)) {
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

  // Validación simple en tiempo real
  const validationErrors = useMemo(() => {
    const errs = {};
    if (!vehicleSelected)
      errs.vehicle = t(
        "register.salidas.err_vehicle",
        "Selecciona un vehículo."
      );
    const kmNum = Number(kmActual);
    if (!kmActual)
      errs.km = t(
        "register.salidas.err_km_required",
        "El kilometraje es obligatorio."
      );
    else if (Number.isNaN(kmNum) || kmNum < 0)
      errs.km = t("register.salidas.err_km_invalid", "Kilometraje inválido.");
    const fuelNum = fuelActual === "" ? null : Number(fuelActual);
    if (
      fuelActual !== "" &&
      (Number.isNaN(fuelNum) || fuelNum < 0 || fuelNum > 100)
    )
      errs.fuel = t(
        "register.salidas.err_fuel_invalid",
        "Porcentaje de combustible inválido (0-100)."
      );
    if (!observations)
      errs.obs = t(
        "register.salidas.err_observations",
        "Agrega una observación."
      );
    if (!images || images.length === 0)
      errs.images = t(
        "register.salidas.err_images",
        "Agrega al menos una imagen."
      );
    return errs;
  }, [vehicleSelected, kmActual, fuelActual, observations, images, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // validar
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage(
        t(
          "register.salidas.err_fix_fields",
          "Corrige los campos marcados antes de continuar."
        )
      );
      return;
    }

    setIsSubmitting(true);

    const kmParsed = parseInt(kmActual, 10);
    const fuelParsed = parseInt(fuelActual, 10);

    if (
      isNaN(kmParsed) ||
      (fuelActual !== "" &&
        (isNaN(fuelParsed) || fuelParsed < 0 || fuelParsed > 100))
    ) {
      setErrorMessage(
        t(
          "register.salidas.err_values_invalid",
          "Verifica que el kilometraje y combustible sean válidos."
        )
      );
      setIsSubmitting(false);
      return;
    }

    // resolver id empleado robustamente
    let idEmpleado = resolveIdEmpleado();
    if (!idEmpleado) {
      setErrorMessage(
        t(
          "register.salidas.err_user_invalid",
          "Datos de usuario inválidos. Por favor, inicia sesión de nuevo."
        )
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
      setErrorMessage(
        t(
          "register.salidas.err_vehicle_invalid",
          "Vehículo no válido. Selecciona un vehículo existente."
        )
      );
      setIsSubmitting(false);
      return;
    }

    // Construir formData
    const formData = new FormData();
    formData.append("id_empleado", idEmpleado);
    formData.append("id_vehiculo", foundVehicle.id);
    formData.append(
      "id_ubicacion_salida",
      foundVehicle?.LocationID ?? foundVehicle?.locationId ?? ""
    );
    formData.append("km_salida", kmParsed);
    formData.append("combustible_salida", fuelParsed);
    formData.append("comentario_salida", observations ?? "");

    images.forEach((file) => {
      formData.append("files", file);
    });

    try {
      console.debug("[SalidaForm] enviando registro:", {
        id_empleado: idEmpleado,
        id_vehiculo: foundVehicle.id,
        km_salida: kmParsed,
        combustible_salida: fuelParsed,
      });

      const register = await registrarSalida(formData);

      if (register) {
        await Swal.fire({
          title: t(
            "register.salidas.success_title",
            "¡Salida registrada con éxito!"
          ),
          text: t(
            "register.salidas.success_text",
            "Salida registrada con éxito 🚗"
          ),
          icon: "success",
          confirmButtonColor: "#03624C",
        });

        // notificación no bloqueante
        try {
          if (emailSupervisor?.supervisor_email) {
            sendNotificacionSalida({
              to: [usuario?.email, emailSupervisor.supervisor_email].filter(
                Boolean
              ),
              employeeName: usuario?.nombre,
              vehicleName: foundVehicle.placa,
              supervisorName: emailSupervisor.supervisor_nombre,
            }).catch((err) =>
              console.warn("sendNotificacionSalida failed:", err)
            );
          }
        } catch (err) {
          console.warn("No se pudo enviar notificación de salida:", err);
        }

        navigate("/admin/panel-vehiculos", {
          state: {
            mensaje: t(
              "register.salidas.success_toast",
              "Salida registrada con éxito 🚗✅"
            ),
          },
        });
      } else {
        throw new Error(
          t(
            "register.salidas.err_server",
            "Ocurrió un error al registrar la salida. Intenta de nuevo."
          )
        );
      }
    } catch (error) {
      console.error("Error al registrar la salida:", error);
      const errMsg =
        error?.response?.data?.error ||
        error?.message ||
        t(
          "register.salidas.err_server",
          "Ocurrió un error al registrar la salida. Intenta de nuevo."
        );
      await Swal.fire({
        title: t("register.salidas.error_title", "Error"),
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
            {t("register.salidas.title", "Realiza el Registro de Salida")}
          </Typography>
          <Typography level="body-sm">
            {t(
              "register.salidas.subtitle",
              "Realiza el registro de salida de tu vehículo en el sistema de registro de vehículos."
            )}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>
              {t("register.salidas.field_vehicle", "Vehículo")}
            </FormLabel>
            <Autocomplete
              placeholder={t(
                "register.salidas.ph_select_vehicle",
                "Selecciona un vehículo..."
              )}
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
            {validationErrors.vehicle && (
              <Typography level="body-xs" color="danger">
                {validationErrors.vehicle}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t("register.salidas.field_km", "Kilometraje Actual")}
            </FormLabel>
            <Input
              fullWidth
              size="sm"
              type="text"
              placeholder={t(
                "register.salidas.ph_km",
                "Ingrese el Kilometraje"
              )}
              value={kmActual}
              onChange={(e) => setKmActual(e.target.value)}
              readOnly={!kmManual}
            />
            {validationErrors.km && (
              <Typography level="body-xs" color="danger">
                {validationErrors.km}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t("register.salidas.field_fuel", "Porcentaje de Combustible")}
            </FormLabel>
            <Input
              fullWidth
              size="sm"
              type="number"
              placeholder={t("register.salidas.ph_fuel", "Porcentaje (%)")}
              value={fuelActual}
              onChange={(e) => setFuelActual(e.target.value)}
              readOnly={!fuelManual}
            />
            {validationErrors.fuel && (
              <Typography level="body-xs" color="danger">
                {validationErrors.fuel}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t("register.salidas.field_observations", "Observaciones")}
            </FormLabel>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              maxRows={3}
              placeholder={t(
                "register.salidas.ph_observations",
                "Observaciones"
              )}
              minRows={2}
              sx={{
                "--Textarea-focusedInset": "var(--any, )",
                "--Textarea-focusedThickness": "0.25rem",
                "--Textarea-focusedHighlight": "rgba(13,110,253,.25)",
              }}
            />
            {validationErrors.obs && (
              <Typography level="body-xs" color="danger">
                {validationErrors.obs}
              </Typography>
            )}
          </FormControl>

          <UploadImages value={images} onChange={setImages} />
          {validationErrors.images && (
            <Typography level="body-xs" color="danger">
              {validationErrors.images}
            </Typography>
          )}
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
              {t("register.salidas.cancel", "Cancelar")}
            </Button>
            <Button
              size="sm"
              variant="solid"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}>
              {isSubmitting
                ? t("register.salidas.saving", "Guardando...")
                : t("register.salidas.save", "Guardar")}
            </Button>
          </CardActions>
        </CardOverflow>
      </Card>
    </Stack>
  );
}
