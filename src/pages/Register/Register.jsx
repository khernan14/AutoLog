// src/pages/Register.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, CircularProgress, Alert as JoyAlert } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import SearchBar from "../../components/RegisterForm/SearchBar";
import VehicleTable from "../../components/RegisterForm/VehicleTable";

import {
  obtenerVehiculos,
  ListarVehiculosEmpleado,
} from "../../services/VehiculosService";
import { getReservasPorUsuario } from "../../services/ReservaServices";
import { obtenerRegistroActivo } from "../../services/RegistrosService";
import { STORAGE_KEYS } from "../../config/variables";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registroActivo, setRegistroActivo] = useState(null); // <-- nuevo
  const navigate = useNavigate();

  const { userData, hasPermiso } = useAuth();
  const esAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const puedeRegistrar =
    esAdmin ||
    (typeof hasPermiso === "function" && hasPermiso("registrar_uso"));

  // helper robusto para obtener id empleado (igual que en otras páginas)
  const getUserIdForApi = () =>
    userData?.id_empleado ??
    userData?.id ??
    userData?.id_usuario ??
    (() => {
      try {
        const stored =
          localStorage.getItem(STORAGE_KEYS.USER) ||
          localStorage.getItem("user");
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return parsed?.id_empleado ?? parsed?.id ?? parsed?.id_usuario ?? null;
      } catch {
        return null;
      }
    })();

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerVehiculos();
      if (response) {
        setVehicles(response);
      } else {
        setVehicles([]);
        setError("No se pudo obtener la lista de vehículos.");
      }
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarReservas = useCallback(async () => {
    try {
      const userLS = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      const idEmpleado = userLS?.id_empleado;
      if (!idEmpleado) return;

      const reservas = await getReservasPorUsuario(idEmpleado);
      if (reservas && reservas.length > 0 && reservas[0].total > 0) {
        Swal.fire({
          title: "Reservas Pendientes",
          text: "Tienes una o más reservas activas pendientes. Por favor realiza el registro correspondiente.",
          icon: "warning",
          confirmButtonText: "Entendido",
        });
      }
    } catch (error) {
      console.error("Error al verificar reservas activas:", error);
      toast.error("No se pudo verificar tus reservas activas.");
    }
  }, []);

  // ---- NUEVO: verificar registro activo al cargar la página (mostrar alerta desde la tabla) ----
  const checkRegistroActivo = useCallback(async () => {
    const userId = getUserIdForApi();
    if (!userId) {
      console.warn("[Register] No hay userId para checkRegistroActivo");
      return;
    }
    try {
      const reg = await obtenerRegistroActivo(userId);
      if (reg) {
        // guardamos para mostrar banner/usar en UI si quieres
        setRegistroActivo(reg);

        // mostramos Swal inmediatamente (igual que en el formulario)
        Swal.fire({
          title: "Tienes un registro pendiente",
          text: "Debes registrar el regreso del vehículo antes de hacer otra salida.",
          icon: "info",
          confirmButtonText: "Ir al registro",
          showCancelButton: true,
          cancelButtonText: "Cerrar",
        }).then((res) => {
          if (res.isConfirmed) {
            // llevar al formulario de regreso (si tu ruta es esa)
            navigate("/admin/panel-vehiculos/register?mode=regreso");
            // o si usas otra ruta:
            // navigate("/admin/panel-vehiculos/register-regreso");
          }
        });
      } else {
        setRegistroActivo(null);
      }
    } catch (err) {
      console.error("[Register] Error checkRegistroActivo:", err);
      // no bloqueamos la página por esto
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    fetchVehicles();
    verificarReservas();
    checkRegistroActivo();
  }, [fetchVehicles, verificarReservas, checkRegistroActivo]);

  const handleSearchChange = (value) => setSearch(value);

  const handleRegisterClick = () => {
    if (!puedeRegistrar) {
      toast.warning("No tienes permiso para registrar uso de vehículos.");
      return;
    }
    if (vehicles.length === 0 && !esAdmin) {
      toast.error(
        "No puedes registrar vehículos porque no tienes permiso para ver los vehículos."
      );
      return;
    }
    navigate("/admin/panel-vehiculos/register");
  };

  const filteredVehicles = useMemo(() => {
    const searchLower = search.toLowerCase();
    return vehicles.filter(
      (veh) =>
        veh.placa?.toLowerCase().includes(searchLower) ||
        veh.marca?.toLowerCase().includes(searchLower) ||
        veh.modelo?.toLowerCase().includes(searchLower)
    );
  }, [vehicles, search]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" mb={2}>
        Registro de uso de vehículos
      </Typography>

      {/* Si hay un registro activo mostramos un banner claro arriba */}
      {registroActivo && (
        <JoyAlert
          color="warning"
          variant="soft"
          sx={{ mb: 2 }}
          startDecorator={null}>
          <strong>Tienes un registro pendiente:</strong>{" "}
          {registroActivo.placa ? `${registroActivo.placa}` : ""}
          {" • "}
          {registroActivo.fecha_salida
            ? `Salida: ${new Date(
                registroActivo.fecha_salida
              ).toLocaleString()}`
            : ""}
          {" — "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // navegar directo al formulario de regreso (ajusta la ruta si hace falta)
              navigate("/admin/panel-vehiculos/register?mode=regreso");
            }}
            style={{
              color: "inherit",
              textDecoration: "underline",
              marginLeft: 8,
            }}>
            Ir al registro
          </a>
        </JoyAlert>
      )}

      <SearchBar
        onSearch={handleSearchChange}
        onAdd={handleRegisterClick}
        canAdd={!!puedeRegistrar}
        inputMaxWidth={320}
      />

      <Box mt={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="danger" textAlign="center">
            {error}
          </Typography>
        ) : filteredVehicles.length === 0 ? (
          <Typography textAlign="center" color="neutral">
            No se encontraron vehículos que coincidan con la búsqueda.
          </Typography>
        ) : (
          <VehicleTable vehicles={filteredVehicles} />
        )}
      </Box>
    </Box>
  );
}
