import { useState, useEffect } from "react";
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

export default function RegisterRegresoForm({
  registro,
  usuario,
  emailSupervisor,
}) {
  const [kmAnterior, setKmAnterior] = useState("");
  const [km_regreso, setkm_regreso] = useState("");
  const [id_ubicacion_regreso, setIdUbicacionRegreso] = useState("");
  const [fuel, setFuel] = useState("");
  const [observations, setObservations] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // nuevo estado
  const [errorMessage, setErrorMessage] = useState("");
  const [estacionamientos, setEstacionamientos] = useState([]);

  const navigate = useNavigate();

  const estacionamientoNombre =
    estacionamientos.find((e) => e.id === id_ubicacion_regreso)
      ?.nombre_ubicacion || "Desconocido";

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const data = await getParkings();
        setEstacionamientos(data);
      } catch (error) {
        console.error("Error al obtener estacionamientos:", error);
      }
    };

    fetchParkings();
  }, []);

  useEffect(() => {
    // resuelve idEmpleado e idVehiculo de forma robusta
    const idEmpleado =
      usuario?.id_empleado ?? usuario?.id ?? usuario?.id_usuario ?? null;
    const idVehiculo =
      registro?.id_vehiculo ?? registro?.id ?? registro?.idVehiculo ?? null;

    if (!idEmpleado || !idVehiculo) return;

    const loadKmActual = async () => {
      try {
        const data = await obtenerKmActual(idVehiculo);
        setKmAnterior(
          data?.km_regreso !== undefined ? String(data.km_regreso) : "0"
        );
      } catch (error) {
        console.error("Error al obtener km actual:", error);
      }
    };

    loadKmActual();
  }, [usuario, registro]);
  //   setIsSubmitting(true); // nuevo cambio

  //   if (
  //     !km_regreso ||
  //     !fuel ||
  //     !observations ||
  //     !images.length ||
  //     !id_ubicacion_regreso
  //   ) {
  //     setErrorMessage("Por favor, rellena todos los campos obligatorios.");
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   if (parseInt(km_regreso) < parseInt(kmAnterior)) {
  //     setErrorMessage(
  //       "El kilometraje de regreso no puede ser menor al de salida."
  //     );
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   const datosEntrada = {
  //     id_registro: registro.id_registro,
  //     id_empleado: usuario.id_empleado,
  //     id_ubicacion_regreso,
  //     km_regreso: parseInt(km_regreso),
  //     combustible_regreso: parseInt(fuel),
  //     comentario_regreso: observations,
  //   };

  //   try {
  //     const registerReturn = await registrarEntrada(datosEntrada);
  //     const onlyFiles = images.map((f) => f.file);

  //     if (registerReturn) {
  //       // 🔔 Enviar correo de regreso
  //       const emailData = {
  //         to: [usuario.email, emailSupervisor?.supervisor_email].filter(
  //           Boolean
  //         ),
  //         employeeName: usuario.nombre,
  //         vehicleName: registro.placa,
  //         supervisorName: emailSupervisor?.supervisor_nombre,
  //         estacionamiento: estacionamientoNombre,
  //       };

  //       try {
  //         await sendNotificacionRegreso(emailData);
  //       } catch (err) {
  //         console.warn("No se pudo enviar el correo de regreso:", err);
  //       }

  //       // 📷 Subir imágenes
  //       const imageData = await SubirImagenesRegistro(
  //         registro.id_registro,
  //         onlyFiles
  //       );

  //       if (imageData) {
  //         Swal.fire(
  //           "Proceso completo",
  //           "Regreso registrado y fotos subidas exitosamente",
  //           "success"
  //         ).then(() => {
  //           navigate("/admin/panel-vehiculos", {
  //             state: { mensaje: "Regreso registrado con éxito 🚗✅" },
  //           });
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     Swal.fire("Error", "Ocurrió un error durante el registro", "error");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (
      !km_regreso ||
      !fuel ||
      !observations ||
      !images.length ||
      !id_ubicacion_regreso
    ) {
      setErrorMessage("Por favor, rellena todos los campos obligatorios.");
      setIsSubmitting(false);
      return;
    }

    const idEmpleado =
      usuario?.id_empleado ?? usuario?.id ?? usuario?.id_usuario ?? null;

    // fallback: intenta leer del localStorage (por si el RegisterForm no pasó userData por props)
    if (!idEmpleado) {
      try {
        const stored =
          localStorage.getItem("user") ||
          localStorage.getItem("USER") ||
          localStorage.getItem("usuario");
        if (stored) {
          const parsed = JSON.parse(stored);
          idEmpleado =
            parsed?.id_empleado ??
            parsed?.id ??
            parsed?.id_usuario ??
            idEmpleado;
        }
      } catch (err) {
        console.warn("No se pudo parsear user de localStorage:", err);
      }
    }

    if (!idEmpleado) {
      setErrorMessage(
        "Datos de usuario inválidos. Por favor, inicia sesión de nuevo."
      );
      setIsSubmitting(false);
      return;
    }

    // igual para registro
    const idRegistro =
      registro?.id_registro ?? registro?.id ?? registro?.id_registro;
    if (!idRegistro) {
      setErrorMessage(
        "Datos de registro inválidos. Refresca e intenta de nuevo."
      );
      setIsSubmitting(false);
      return;
    }

    if (parseInt(km_regreso) < parseInt(kmAnterior)) {
      setErrorMessage(
        "El kilometraje de regreso no puede ser menor al de salida."
      );
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("id_registro", idRegistro);
    formData.append("id_empleado", idEmpleado);
    formData.append("id_ubicacion_regreso", id_ubicacion_regreso);
    formData.append("km_regreso", parseInt(km_regreso));
    formData.append("combustible_regreso", parseInt(fuel));
    formData.append("comentario_regreso", observations);

    images.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const register = await registrarRegreso(formData);

      if (register) {
        Swal.fire({
          title: "¡Regreso registrado con éxito!",
          text: "Regreso registrado con éxito 🚗",
          icon: "success",
          confirmButtonColor: "#03624C",
        }).then(() => {
          navigate("/admin/panel-vehiculos", {
            state: { mensaje: "Regreso registrado con éxito 🚗✅" },
          });
        });

        if (emailSupervisor?.supervisor_email) {
          sendNotificacionRegreso({
            to: [usuario.email, emailSupervisor?.supervisor_email].filter(
              Boolean
            ),
            employeeName: usuario.nombre,
            vehicleName: registro.placa,
            supervisorName: emailSupervisor?.supervisor_nombre,
            estacionamiento: estacionamientoNombre,
          });
        }
      }
    } catch (error) {
      console.error("Error al registrar el regreso:", error);
      const errorMessage =
        error?.response?.data?.error || // si usas axios
        error?.message || // mensaje de JS
        "Ocurrió un error al registrar el regreso. Intenta de nuevo.";

      Swal.fire({
        title: "Error",
        text: errorMessage,
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

      <Card component={"form"} onSubmit={handleSubmit}>
        <>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">
              Realiza el Registro de Regreso
            </Typography>
            <Typography level="body-sm">
              Realiza el registro de regreso de tu vehículo en el sistema de
              registro de vehículos. Este proceso es importante para que el
              vehículo esté registrado en el sistema y se puedan realizar las
              operaciones correspondientes.
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ my: 1 }}>
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <Stack width={"60%"} spacing={1}>
                  <FormLabel>Vehiculo En Uso</FormLabel>
                  <FormControl
                    sx={{
                      display: { sm: "flex-column", md: "flex-row" },
                      gap: 2,
                    }}>
                    <Input
                      sx={{
                        width: { xs: "118%", md: 280 },
                      }}
                      size="sm"
                      type="text"
                      placeholder="Ingrese el Kilometraje"
                      value={`${registro.placa} - Estado: ${registro.estado}`}
                      readOnly
                    />
                  </FormControl>
                </Stack>
                <Stack width={"60%"} spacing={1}>
                  <FormLabel>Estacionamiento</FormLabel>
                  <FormControl
                    sx={{
                      display: { sm: "flex-column", md: "flex-row" },
                      gap: 2,
                    }}>
                    <Select
                      value={id_ubicacion_regreso}
                      onChange={(_, value) =>
                        setIdUbicacionRegreso(Number(value))
                      }
                      placeholder="Selecciona un estacionamiento..."
                      indicator={<KeyboardArrowDown />}
                      sx={{
                        width: { xs: "118%", md: 280 },
                        [`& .${selectClasses.indicator}`]: {
                          transition: "0.2s",
                          [`&.${selectClasses.expanded}`]: {
                            transform: "rotate(-180deg)",
                          },
                        },
                      }}>
                      <Option value="">Selecciona un estacionamiento</Option>
                      {estacionamientos.map((e) => (
                        <Option key={e.id} value={e.id}>
                          {e.nombre_ubicacion}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack width={"60%"} spacing={1}>
                  <FormControl>
                    <FormLabel>
                      {kmAnterior && (
                        <div>
                          Último kilometraje registrado:{" "}
                          <strong>{kmAnterior} km</strong>
                        </div>
                      )}
                    </FormLabel>
                    <Input
                      sx={{
                        width: { xs: "118%", md: 280 },
                      }}
                      size="sm"
                      type="text"
                      placeholder="Ingrese el Kilometraje"
                      value={km_regreso}
                      onChange={(e) => setkm_regreso(e.target.value)}
                    />
                  </FormControl>
                </Stack>
                {/* Otro campo */}
                <Stack width={"60%"} spacing={1}>
                  <FormControl>
                    <FormLabel>Porcentaje de Combustible</FormLabel>
                    <Input
                      sx={{
                        width: { xs: "118%", md: 280 },
                      }}
                      size="sm"
                      type="number"
                      placeholder="Porcentaje (%)"
                      value={fuel}
                      onChange={(e) => setFuel(e.target.value)}
                    />
                  </FormControl>
                </Stack>
                {/* Otro campo */}
                <Stack width={"60%"} spacing={1}>
                  <FormControl>
                    <FormLabel>Observaciones</FormLabel>
                    <Textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      maxRows={3}
                      placeholder="Obervaciones"
                      minRows={2}
                      sx={{
                        width: { xs: "118%", md: 280 },
                        "--Textarea-focusedInset": "var(--any, )",
                        "--Textarea-focusedThickness": "0.25rem",
                        "--Textarea-focusedHighlight": "rgba(13,110,253,.25)",
                        "&::before": {
                          transition: "box-shadow .15s ease-in-out",
                        },
                        "&:focus-within": {
                          borderColor: "#86b7fe",
                        },
                      }}
                    />
                  </FormControl>
                </Stack>
                {/* Otro campo */}
                <UploadImages value={images} onChange={setImages} />
              </Stack>
            </Stack>
          </Stack>
        </>
        <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="solid"
              type="submit"
              loading={isSubmitting} // MUI Joy soporta esto
              disabled={isSubmitting} // para evitar doble clic
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </CardActions>
        </CardOverflow>
      </Card>
    </Stack>
  );
}
