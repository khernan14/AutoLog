import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/joy";
import { useSearchParams } from "react-router-dom";
import { obtenerRegistroActivo } from "../../services/RegistrosService";
import { STORAGE_KEYS } from "../../config/variables";
import Swal from "sweetalert2";
import SalidaForm from "../../components/RegisterForm/RegisterSalidaForm";
import {
  obtenerVehiculos,
  resolveVehiculoFromQrToken,
} from "../../services/VehiculosService";
import RegresoForm from "../../components/RegisterForm/RegisterRegresoForm";
import { getEmailSupervisor } from "../../services/AuthServices";

export default function RegisterForm() {
  const [usuario, setUsuario] = useState(null);
  const [emailSupervisor, setEmailSupervisor] = useState(null);
  const [registroActivo, setRegistroActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [vehiculoQR, setVehiculoQR] = useState(null);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (!storedUser) {
      console.warn("Usuario no encontrado en localStorage");
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUsuario(parsedUser);

    const loadAll = async () => {
      try {
        // Si tu endpoint de obtenerRegistroActivo espera id_empleado,
        // cámbialo aquí a parsedUser.id_empleado
        const [registro, vehs, vehFromToken] = await Promise.all([
          obtenerRegistroActivo(parsedUser.id),
          obtenerVehiculos(),
          token
            ? resolveVehiculoFromQrToken(token).catch((err) => {
                console.error("Error al resolver token de QR:", err);
                Swal.fire({
                  title: "Código no válido",
                  text: "El código QR es inválido o ha expirado. Selecciona el vehículo manualmente.",
                  icon: "warning",
                  confirmButtonText: "Entendido",
                });
                return null;
              })
            : Promise.resolve(null),
        ]);

        if (registro) {
          setRegistroActivo(registro);
          Swal.fire({
            title: "Tienes un registro pendiente",
            text: "Debes registrar el regreso del vehículo antes de hacer otra salida.",
            icon: "info",
            confirmButtonText: "Entendido",
          });
        }

        setVehicles(Array.isArray(vehs) ? vehs : []);

        if (vehFromToken) {
          // { id_vehiculo, placa, marca, modelo }
          setVehiculoQR(vehFromToken);
        }
      } catch (error) {
        console.error("Error al cargar datos de registro:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [token]);

  useEffect(() => {
    const loadEmailSupervisor = async () => {
      if (!usuario?.id_empleado) return;

      try {
        const data = await getEmailSupervisor(usuario.id_empleado);
        setEmailSupervisor(data);
      } catch (error) {
        console.error("Error al obtener el email del supervisor:", error);
      }
    };

    loadEmailSupervisor();
  }, [usuario]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" mb={2}>
        {registroActivo
          ? "Registrar regreso de vehículo"
          : "Registrar salida de vehículo"}
      </Typography>

      {registroActivo ? (
        <RegresoForm
          registro={registroActivo}
          usuario={usuario}
          emailSupervisor={emailSupervisor}
        />
      ) : (
        <SalidaForm
          vehicles={vehicles}
          usuario={usuario}
          emailSupervisor={emailSupervisor}
          vehiculoPreseleccionado={vehiculoQR}
        />
      )}
    </Box>
  );
}
