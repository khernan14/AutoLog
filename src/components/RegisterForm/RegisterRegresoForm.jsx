// src/components/RegisterForm/RegisterRegresoForm.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardOverflow,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Option,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import Select, { selectClasses } from "@mui/joy/Select";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import UploadImages from "./UploadImages";
import {
  obtenerKmActual,
  registrarRegreso,
} from "../../services/RegistrosService";
import { getParkings } from "../../services/ParkingServices";
import { sendNotificacionRegreso } from "../../services/MailServices";
import { useTranslation } from "react-i18next";

/**
 * RegisterRegresoForm (mejorado)
 *
 * Props:
 *  - registro: objeto con info del registro (id_registro, id_vehiculo, placa, estado, etc.)
 *  - usuario: objeto usuario (id_empleado, nombre, email, ...)
 *  - emailSupervisor: { supervisor_email, supervisor_nombre } (opcional)
 */
export default function RegisterRegresoForm({
  registro,
  usuario,
  emailSupervisor,
}) {
  const { t } = useTranslation();

  const [kmAnterior, setKmAnterior] = useState("");
  const [km_regreso, setKmRegreso] = useState("");
  const [id_ubicacion_regreso, setIdUbicacionRegreso] = useState("");
  const [fuel, setFuel] = useState("");
  const [observations, setObservations] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [estacionamientos, setEstacionamientos] = useState([]);

  const navigate = useNavigate();

  // Nombre del estacionamiento seleccionado (memo)
  const estacionamientoNombre = useMemo(() => {
    const e = estacionamientos.find((x) => x.id === id_ubicacion_regreso);
    return (
      e?.nombre_ubicacion ??
      t("register.regreso.unknown_parking", "Desconocido")
    );
  }, [estacionamientos, id_ubicacion_regreso, t]);

  // Cargar estacionamientos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getParkings();
        if (!mounted) return;
        setEstacionamientos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("[Regreso] getParkings error:", err);
        if (mounted) setEstacionamientos([]);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Obtener último km registrado para el vehículo (si registro/vehículo están presentes)
  useEffect(() => {
    let mounted = true;
    const idVehiculo =
      registro?.id_vehiculo ?? registro?.id ?? registro?.idVehiculo ?? null;
    if (!idVehiculo) return;

    (async () => {
      try {
        const data = await obtenerKmActual(idVehiculo);
        if (!mounted) return;
        const kmValue =
          data?.km_regreso ??
          data?.km ??
          data?.km_salida ??
          data?.km_actual ??
          0;
        setKmAnterior(
          kmValue !== undefined && kmValue !== null ? String(kmValue) : ""
        );
      } catch (err) {
        console.error("[Regreso] obtenerKmActual error:", err);
        if (mounted) setKmAnterior("");
      }
    })();

    return () => (mounted = false);
  }, [registro]);

  // Helper robusto para resolver idEmpleado (props o localStorage)
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
        console.warn("[Regreso] parse user from localStorage failed:", err);
      }
    }
    return id;
  };

  // Validación en tiempo real
  const validationErrors = useMemo(() => {
    const errs = {};
    if (!id_ubicacion_regreso)
      errs.id_ubicacion_regreso = t(
        "register.regreso.err_parking",
        "Selecciona un estacionamiento."
      );
    if (!km_regreso)
      errs.km_regreso = t(
        "register.regreso.err_km_required",
        "El kilometraje de regreso es obligatorio."
      );
    else if (Number.isNaN(Number(km_regreso)) || Number(km_regreso) < 0)
      errs.km_regreso = t(
        "register.regreso.err_km_invalid",
        "Kilometraje inválido."
      );
    else if (
      kmAnterior &&
      !Number.isNaN(Number(kmAnterior)) &&
      Number(km_regreso) < Number(kmAnterior)
    )
      errs.km_regreso = t(
        "register.regreso.err_km_less",
        "El kilometraje de regreso no puede ser menor al de salida."
      );
    if (fuel === "")
      errs.fuel = t(
        "register.regreso.err_fuel_required",
        "El porcentaje de combustible es obligatorio."
      );
    else if (
      Number.isNaN(Number(fuel)) ||
      Number(fuel) < 0 ||
      Number(fuel) > 100
    )
      errs.fuel = t(
        "register.regreso.err_fuel_invalid",
        "Porcentaje inválido (0-100)."
      );
    if (!observations || observations.trim().length < 3)
      errs.observations = t(
        "register.regreso.err_obs",
        "Agrega una observación breve."
      );
    if (!images || images.length === 0)
      errs.images = t(
        "register.regreso.err_images",
        "Agrega al menos una imagen."
      );
    return errs;
  }, [
    id_ubicacion_regreso,
    km_regreso,
    fuel,
    observations,
    images,
    kmAnterior,
    t,
  ]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // validar
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage(
        t(
          "register.regreso.err_fix_fields",
          "Corrige los campos marcados antes de continuar."
        )
      );
      return;
    }

    setIsSubmitting(true);

    // resolver id empleado
    const idEmpleado = resolveIdEmpleado();
    if (!idEmpleado) {
      setErrorMessage(
        t(
          "register.regreso.err_user_invalid",
          "Datos de usuario inválidos. Por favor, inicia sesión de nuevo."
        )
      );
      setIsSubmitting(false);
      return;
    }

    // id_registro robusto
    const idRegistro =
      registro?.id_registro ?? registro?.id ?? registro?.registroId ?? null;
    if (!idRegistro) {
      setErrorMessage(
        t(
          "register.regreso.err_reg_invalid",
          "Datos de registro inválidos. Refresca e intenta de nuevo."
        )
      );
      setIsSubmitting(false);
      return;
    }

    // validación adicional de kilometraje comparativo (ya en validationErrors, pero doble seguro)
    if (
      kmAnterior &&
      !Number.isNaN(Number(kmAnterior)) &&
      Number(km_regreso) < Number(kmAnterior)
    ) {
      setErrorMessage(
        t(
          "register.regreso.err_km_less",
          "El kilometraje de regreso no puede ser menor al de salida."
        )
      );
      setIsSubmitting(false);
      return;
    }

    // preparar FormData
    const fd = new FormData();
    fd.append("id_registro", idRegistro);
    fd.append("id_empleado", idEmpleado);
    fd.append("id_ubicacion_regreso", id_ubicacion_regreso);
    fd.append("km_regreso", parseInt(km_regreso, 10));
    fd.append("combustible_regreso", parseInt(fuel, 10));
    fd.append("comentario_regreso", observations || "");

    // images = array of File objects
    images.forEach((file) => {
      // si tu UploadImages devuelve {file} objects, adaptarlo; aquí asumimos File[]
      fd.append("files", file);
    });

    try {
      const resp = await registrarRegreso(fd);

      if (resp) {
        await Swal.fire({
          title: t(
            "register.regreso.success_title",
            "¡Regreso registrado con éxito!"
          ),
          text: t(
            "register.regreso.success_text",
            "Regreso registrado correctamente 🚗"
          ),
          icon: "success",
          confirmButtonColor: "#03624C",
        });

        // envío de correo (no bloqueante)
        try {
          if (emailSupervisor?.supervisor_email) {
            sendNotificacionRegreso({
              to: [usuario?.email, emailSupervisor.supervisor_email].filter(
                Boolean
              ),
              employeeName: usuario?.nombre,
              vehicleName: registro?.placa,
              supervisorName: emailSupervisor?.supervisor_nombre,
              estacionamiento: estacionamientoNombre,
            }).catch((err) =>
              console.warn("sendNotificacionRegreso failed:", err)
            );
          }
        } catch (err) {
          console.warn("sendNotificacionRegreso error:", err);
        }

        navigate("/admin/panel-vehiculos", {
          state: {
            mensaje: t(
              "register.regreso.success_toast",
              "Regreso registrado con éxito 🚗✅"
            ),
          },
        });
      } else {
        throw new Error(
          t(
            "register.regreso.err_server",
            "Ocurrió un error al registrar el regreso. Intenta de nuevo."
          )
        );
      }
    } catch (err) {
      console.error("[Regreso] registrarRegreso error:", err);
      const errMsg =
        err?.response?.data?.error ||
        err?.message ||
        t(
          "register.regreso.err_server",
          "Ocurrió un error al registrar el regreso. Intenta de nuevo."
        );
      await Swal.fire({
        title: t("register.regreso.error_title", "Error"),
        text: errMsg,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/panel-vehiculos");

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
        <Box sx={{ mb: 1 }}>
          <Typography level="title-md">
            {t("register.regreso.title", "Realiza el Registro de Regreso")}
          </Typography>
          <Typography level="body-sm">
            {t(
              "register.regreso.subtitle",
              "Registra el regreso del vehículo para liberar la unidad y registrar evidencias."
            )}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormLabel>
              {t("register.regreso.field_vehicle_in_use", "Vehículo en uso")}
            </FormLabel>
            <Input
              value={`${registro?.placa ?? ""} · ${registro?.estado ?? ""}`}
              readOnly
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t("register.regreso.field_parking", "Estacionamiento")}
            </FormLabel>
            <Select
              value={id_ubicacion_regreso ?? ""}
              onChange={(_, v) => setIdUbicacionRegreso(v)}
              placeholder={t(
                "register.regreso.ph_parking",
                "Selecciona un estacionamiento..."
              )}
              indicator={<KeyboardArrowDown />}
              sx={{
                width: "100%",
                [`& .${selectClasses.indicator}`]: {
                  transition: "0.2s",
                  [`&.${selectClasses.expanded}`]: {
                    transform: "rotate(-180deg)",
                  },
                },
              }}>
              <Option value="">
                {t(
                  "register.regreso.ph_select_parking",
                  "Selecciona un estacionamiento"
                )}
              </Option>
              {estacionamientos.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.nombre_ubicacion}
                </Option>
              ))}
            </Select>
            {validationErrors.id_ubicacion_regreso && (
              <Typography level="body-xs" color="danger">
                {validationErrors.id_ubicacion_regreso}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t(
                "register.regreso.field_last_km",
                "Último kilometraje registrado"
              )}
              {kmAnterior ? (
                <>
                  &nbsp;•&nbsp;<strong>{kmAnterior} km</strong>
                </>
              ) : null}
            </FormLabel>
            <Input
              value={km_regreso}
              onChange={(e) => setKmRegreso(e.target.value)}
              placeholder={t(
                "register.regreso.ph_km",
                "Ingrese el kilometraje de regreso"
              )}
              type="number"
            />
            {validationErrors.km_regreso && (
              <Typography level="body-xs" color="danger">
                {validationErrors.km_regreso}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t("register.regreso.field_fuel", "Porcentaje de Combustible")}
            </FormLabel>
            <Input
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              placeholder={t("register.regreso.ph_fuel", "Porcentaje (%)")}
              type="number"
            />
            {validationErrors.fuel && (
              <Typography level="body-xs" color="danger">
                {validationErrors.fuel}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t("register.regreso.field_observations", "Observaciones")}
            </FormLabel>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder={t(
                "register.regreso.ph_observations",
                "Observaciones (opcional)"
              )}
              minRows={2}
              maxRows={4}
            />
            {validationErrors.observations && (
              <Typography level="body-xs" color="danger">
                {validationErrors.observations}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>
              {t("register.regreso.field_images", "Evidencias (fotos)")}
            </FormLabel>
            <UploadImages
              value={images}
              onChange={setImages}
              maxCount={6}
              maxSizeMB={6}
            />
            {validationErrors.images && (
              <Typography level="body-xs" color="danger">
                {validationErrors.images}
              </Typography>
            )}
          </FormControl>
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
              {t("register.regreso.cancel", "Cancelar")}
            </Button>
            <Button
              size="sm"
              variant="solid"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}>
              {isSubmitting
                ? t("register.regreso.saving", "Guardando...")
                : t("register.regreso.save", "Guardar")}
            </Button>
          </CardActions>
        </CardOverflow>
      </Card>
    </Stack>
  );
}
