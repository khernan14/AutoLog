import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  getUbicaciones,
  ListarVehiculosEmpleado,
} from "../../services/VehiculosService";
import {
  obtenerCombustibleActual,
  obtenerKmActual,
  registrarSalida,
  SubirImagenesRegistro,
} from "../../services/RegistrosService";
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
} from "@mui/joy";
import Select, { selectClasses } from "@mui/joy/Select";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function SalidaForm({ vehicles, usuario }) {
  const [vehicleSelected, setVehicleSelected] = useState("");
  const [listVehicles, setListVehicles] = useState([]);
  const [kmActual, setKmActual] = useState("");
  const [kmManual, setKmManual] = useState(false);
  const [fuelActual, setFuelActual] = useState("");
  const [fuelManual, setFuelManual] = useState(false);
  const [observations, setObservations] = useState("");
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario || !usuario.id_empleado) return;

    const loadListVehicles = async () => {
      const data = await ListarVehiculosEmpleado(usuario.id_empleado);
      if (data) setListVehicles(data);
    };
    loadListVehicles();
  }, [usuario]);

  const handleVehicleChange = async (_, value) => {
    setVehicleSelected(value);

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
      console.error("Error obteniendo km actual:", error);
      setKmActual("");
      setKmManual(true);
      setFuelActual("");
      setFuelManual(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !kmActual ||
      !vehicleSelected ||
      !fuelActual ||
      !observations ||
      !images.length
    ) {
      Swal.fire({
        title: "Error",
        text: "Por favor, rellena todos los campos obligatorios",
        icon: "warning",
        confirmButtonColor: "#FFFA8D",
        confirmButtonText: "Aceptar",
      });
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
      <Card component={"form"} onSubmit={handleSubmit}>
        <>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">
              Realiza el Registro de Salida
            </Typography>
            <Typography level="body-sm">
              Realiza el registro de salida de tu vehículo en el sistema de
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
                  <FormLabel>Vehiculo</FormLabel>
                  <FormControl
                    sx={{
                      display: { sm: "flex-column", md: "flex-row" },
                      gap: 2,
                    }}>
                    <Select
                      value={vehicleSelected}
                      onChange={handleVehicleChange}
                      placeholder="Selecciona Un Vehiculo..."
                      indicator={<KeyboardArrowDown />}
                      sx={{
                        width: { xs: "157%", md: 280 },
                        [`& .${selectClasses.indicator}`]: {
                          transition: "0.2s",
                          [`&.${selectClasses.expanded}`]: {
                            transform: "rotate(-180deg)",
                          },
                        },
                      }}>
                      <Option value="">Selecciona un vehiculo</Option>
                      {listVehicles?.map((v) => (
                        <Option key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControl>
                    <FormLabel>Kilometraje Actual</FormLabel>
                    <Input
                      sx={{
                        width: { xs: "118%", md: 280 },
                      }}
                      size="sm"
                      type="text"
                      placeholder="Ingrese el Kilometraje"
                      value={kmActual}
                      onChange={(e) => setKmActual(e.target.value)}
                      readOnly={!kmManual}
                    />
                  </FormControl>
                </Stack>
                {/* Otro campo */}
                <Stack direction="row" spacing={2}>
                  <FormControl>
                    <FormLabel>Porcentaje de Combustible</FormLabel>
                    <Input
                      sx={{
                        width: { xs: "118%", md: 280 },
                      }}
                      size="sm"
                      type="number"
                      placeholder="Porcentaje (%)"
                      value={fuelActual}
                      onChange={(e) => setFuelActual(e.target.value)}
                      readOnly={!fuelManual}
                    />
                  </FormControl>
                </Stack>
                {/* Otro campo */}
                <Stack direction="row" spacing={2}>
                  <FormControl>
                    <FormLabel>Observaciones</FormLabel>
                    <Textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      maxRows={3}
                      placeholder="Obervaciones"
                      minRows={2}
                      sx={{
                        width: { xs: "100%", md: 280 },
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
                <UploadImages images={images} setImages={setImages} />
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
            <Button size="sm" variant="solid" type="submit">
              Guardar
            </Button>
          </CardActions>
        </CardOverflow>
      </Card>
    </Stack>
  );
}
