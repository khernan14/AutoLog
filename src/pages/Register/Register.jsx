import { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import SearchBar from "../../components/RegisterForm/SearchBar";
import VehicleTable from "../../components/RegisterForm/VehicleTable";

import { obtenerVehiculos } from "../../services/VehiculosService";
import { getReservasPorUsuario } from "../../services/ReservaServices";
import { STORAGE_KEYS } from "../../config/variables";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ usar userData (no user) y hasPermiso del contexto real
  const { userData, hasPermiso } = useAuth();
  const esAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const puedeRegistrar =
    esAdmin ||
    (typeof hasPermiso === "function" && hasPermiso("registrar_uso"));

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

  useEffect(() => {
    fetchVehicles();
    verificarReservas();
  }, [fetchVehicles, verificarReservas]);

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

      {/* ✅ botón controlado por permiso y ancho del input más corto */}
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
