// src/pages/RegisterForm.jsx
import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/joy";
import { useSearchParams } from "react-router-dom";
import { obtenerRegistroActivo } from "../../services/RegistrosService";
import Swal from "sweetalert2";
import SalidaForm from "../../components/RegisterForm/RegisterSalidaForm";
import {
  obtenerVehiculos,
  resolveVehiculoFromQrToken,
} from "../../services/VehiculosService";
import RegresoForm from "../../components/RegisterForm/RegisterRegresoForm";
import { getEmailSupervisor } from "../../services/AuthServices";
import { useAuth } from "../../context/AuthContext";

/**
 * RegisterForm - Página que decide si mostrar formulario de salida o de regreso.
 * Normaliza registroActivo para evitar falsos negativos/positivos.
 */
export default function RegisterForm() {
  const { userData, checkingSession } = useAuth();

  const [emailSupervisor, setEmailSupervisor] = useState(null);
  const [registroActivo, setRegistroActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [vehiculoQR, setVehiculoQR] = useState(null);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Helper para extraer id usable por la API
  const getUserIdForApi = () =>
    userData?.id_empleado ?? userData?.id ?? userData?.id_usuario ?? null;

  // Normalizador: devuelve true si el objeto parece un "registro pendiente"
  const isValidRegistro = (r) => {
    if (!r) return false;
    // el backend puede devolver diferentes shape: id_registro, id, idRegistro...
    return (
      !!r.id_registro ||
      !!r.id ||
      !!r.idRegistro ||
      !!r.id_vehiculo ||
      !!r.idVehiculo
    );
  };

  useEffect(() => {
    // Espera a que Auth termine de comprobar
    if (checkingSession) return;

    const userId = getUserIdForApi();
    if (!userId) {
      console.warn(
        "[RegisterForm] Usuario no autenticado o falta id en userData"
      );
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadAll = async () => {
      try {
        const [registro, vehs, vehFromToken] = await Promise.all([
          // obtenerRegistroActivo espera un id (ajusta si tu API necesita otro campo)
          obtenerRegistroActivo(userId),
          obtenerVehiculos(),
          token
            ? resolveVehiculoFromQrToken(token).catch((err) => {
                console.error(
                  "[RegisterForm] resolveVehiculoFromQrToken error:",
                  err
                );
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

        // Normalizamos: si registro viene vacío o con estructura inesperada lo ponemos en null
        const normalizedRegistro = isValidRegistro(registro) ? registro : null;

        if (normalizedRegistro) {
          // Guardamos tal cual (puedes normalizar más si quieres)
          setRegistroActivo(normalizedRegistro);

          // Aviso al usuario (mantienes tu SweetAlert)
          Swal.fire({
            title: "Tienes un registro pendiente",
            text: "Debes registrar el regreso del vehículo antes de hacer otra salida.",
            icon: "info",
            confirmButtonText: "Entendido",
          });
        } else {
          setRegistroActivo(null);
        }

        setVehicles(Array.isArray(vehs) ? vehs : []);

        if (vehFromToken) {
          setVehiculoQR(vehFromToken);
        }
      } catch (error) {
        console.error(
          "[RegisterForm] Error al cargar datos de registro:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingSession, token, userData]);

  // Cargar email del supervisor
  useEffect(() => {
    const loadEmailSupervisor = async () => {
      const userId = getUserIdForApi();
      if (!userId) return;

      try {
        const data = await getEmailSupervisor(userId);
        setEmailSupervisor(data);
      } catch (error) {
        console.error(
          "[RegisterForm] Error al obtener el email del supervisor:",
          error
        );
      }
    };

    if (!checkingSession && userData) {
      loadEmailSupervisor();
    }
  }, [checkingSession, userData]);

  // Spinner mientras auth o datos cargan
  if (checkingSession || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si no está autenticado
  if (!userData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography level="h5">No autenticado</Typography>
        <Typography level="body-sm">
          Inicia sesión para registrar salidas/regresos.
        </Typography>
      </Box>
    );
  }

  // DEBUG: mostrar en consola la decisión antes de render
  console.log("[RegisterForm] registroActivo:", registroActivo);

  // Determina explícitamente si debemos mostrar el formulario de regreso
  const isRegreso = Boolean(
    registroActivo &&
      (registroActivo.id_registro ||
        registroActivo.id ||
        registroActivo.idRegistro ||
        registroActivo.id_vehiculo ||
        registroActivo.idVehiculo)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" mb={2}>
        {isRegreso
          ? "Registrar regreso de vehículo"
          : "Registrar salida de vehículo"}
      </Typography>

      {isRegreso ? (
        <RegresoForm
          registro={registroActivo}
          usuario={userData}
          emailSupervisor={emailSupervisor}
        />
      ) : (
        <SalidaForm
          vehicles={vehicles}
          usuario={userData}
          emailSupervisor={emailSupervisor}
          vehiculoPreseleccionado={vehiculoQR}
        />
      )}
    </Box>
  );
}
