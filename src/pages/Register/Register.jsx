// src/pages/Register.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert as JoyAlert,
  Link,
} from "@mui/joy";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import SearchBar from "../../components/RegisterForm/SearchBar";
import VehicleTable from "../../components/RegisterForm/VehicleTable";

import { obtenerVehiculos } from "../../services/VehiculosService";
import { getReservasPorUsuario } from "../../services/ReservaServices";
import { obtenerRegistroActivo } from "../../services/RegistrosService";
import { STORAGE_KEYS } from "../../config/variables";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registroActivo, setRegistroActivo] = useState(null);

  const navigate = useNavigate();
  const { userData, hasPermiso } = useAuth();

  const esAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const puedeRegistrar =
    esAdmin ||
    (typeof hasPermiso === "function" && hasPermiso("registrar_uso"));

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

  // Cargar vehículos
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerVehiculos();
      if (response) {
        setVehicles(response);
      } else {
        setVehicles([]);
        setError(t("register.errors.no_list"));
      }
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      setError(t("register.errors.server"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Verificar reservas
  const verificarReservas = useCallback(async () => {
    try {
      const userLS = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      const idEmpleado = userLS?.id_empleado;
      if (!idEmpleado) return;

      const reservas = await getReservasPorUsuario(idEmpleado);
      if (reservas && reservas.length > 0 && reservas[0].total > 0) {
        Swal.fire({
          title: t("register.reservas.title"),
          text: t("register.reservas.msg"),
          icon: "warning",
          confirmButtonText: t("register.reservas.ok"),
        });
      }
    } catch (error) {
      console.error("Error al verificar reservas activas:", error);
      toast.error(t("register.errors.check_reservas"));
    }
  }, [t]);

  // Verificar registro activo
  const checkRegistroActivo = useCallback(async () => {
    const userId = getUserIdForApi();
    if (!userId) return;

    try {
      const reg = await obtenerRegistroActivo(userId);

      if (reg) {
        setRegistroActivo(reg);

        Swal.fire({
          title: t("register.registro_activo.title"),
          text: t("register.registro_activo.msg"),
          icon: "info",
          confirmButtonText: t("register.registro_activo.go"),
          showCancelButton: true,
          cancelButtonText: t("register.registro_activo.cancel"),
        }).then((res) => {
          if (res.isConfirmed) {
            navigate("/admin/panel-vehiculos/register?mode=regreso");
          }
        });
      } else {
        setRegistroActivo(null);
      }
    } catch (err) {
      console.error("[Register] Error checkRegistroActivo:", err);
    }
  }, [navigate, t]);

  useEffect(() => {
    fetchVehicles();
    verificarReservas();
    checkRegistroActivo();
  }, [fetchVehicles, verificarReservas, checkRegistroActivo]);

  const filteredVehicles = useMemo(() => {
    const searchLower = search.toLowerCase();
    return vehicles.filter(
      (veh) =>
        veh.placa?.toLowerCase().includes(searchLower) ||
        veh.marca?.toLowerCase().includes(searchLower) ||
        veh.modelo?.toLowerCase().includes(searchLower)
    );
  }, [vehicles, search]);

  const handleRegisterClick = () => {
    if (!puedeRegistrar) {
      toast.warning(t("register.no_permiso"));
      return;
    }
    navigate("/admin/panel-vehiculos/register");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" mb={2}>
        {t("register.title")}
      </Typography>

      {/* Banner superior si tiene registro activo */}
      {registroActivo && (
        <JoyAlert color="warning" variant="soft" sx={{ mb: 2 }}>
          <b>{t("register.registro_activo.banner_title")}</b>{" "}
          {registroActivo.placa} —{" "}
          {registroActivo.fecha_salida
            ? `${t("register.registro_activo.fecha")}: ${new Date(
                registroActivo.fecha_salida
              ).toLocaleString()}`
            : ""}
          {" • "}
          <Link
            component="button"
            onClick={() =>
              navigate("/admin/panel-vehiculos/register?mode=regreso")
            }
            underline="always"
            sx={{ ml: 1 }}>
            {t("register.registro_activo.go")}
          </Link>
        </JoyAlert>
      )}

      <SearchBar
        onSearch={setSearch}
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
            {t("register.no_results")}
          </Typography>
        ) : (
          <VehicleTable vehicles={filteredVehicles} />
        )}
      </Box>
    </Box>
  );
}
