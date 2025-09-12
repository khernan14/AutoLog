import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Select,
  Option,
  Button,
  Input,
  Divider,
  Skeleton,
  Sheet,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/joy";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

import PermissionsTable from "../../../components/Administration/PermissionForms/PermissionsTable";
import {
  getAllUsers,
  getUserPermissions,
  updateUserPermissions,
} from "../../../services/PermissionsServices";

import StatusCard from "../../../components/common/StatusCard";

// --- Skeleton tabla de permisos ---
function PermissionsTableSkeleton() {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "md",
      }}>
      {[...Array(6)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width="100%"
          height={40}
          sx={{ mb: i === 5 ? 0 : 1 }}
        />
      ))}
    </Box>
  );
}

export default function Permissions() {
  // ---- auth/perm ----
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";

  // Ajusta estos nombres si en tu API son distintos:
  const canView = isAdmin || hasPermiso("asignar_permisos");
  const canEdit =
    isAdmin || hasPermiso("asignar_permisos") || hasPermiso("asignar_permisos");

  // ---- state principal ----
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [permsError, setPermsError] = useState(null);

  const [todosLosPermisos, setTodosLosPermisos] = useState({});
  const [permisosAsignados, setPermisosAsignados] = useState([]);
  const [permisosOriginales, setPermisosOriginales] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  // ---- carga de usuarios ----
  const loadUsuarios = useCallback(async () => {
    if (!canView) {
      setLoadingUsers(false);
      setUsersError(null); // estado controlado por la tarjeta "sin permisos"
      return;
    }

    setLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await getAllUsers();
      setUsuarios(Array.isArray(res) ? res : []);
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setUsersError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : "No se pudieron cargar los usuarios."
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [canView]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  // ---- carga de permisos del usuario seleccionado ----
  const loadPermisosUsuario = useCallback(async () => {
    if (!usuarioSeleccionado) return;
    setLoadingPerms(true);
    setPermsError(null);
    try {
      const res = await getUserPermissions(usuarioSeleccionado);
      // res.permisos esperado como { grupo: [ { nombre, asignado }, ... ], ... }
      const permisosObj = res?.permisos || {};
      const asignados = Object.values(permisosObj)
        .flat()
        .filter((p) => p?.asignado)
        .map((p) => p?.nombre);

      setTodosLosPermisos(permisosObj);
      setPermisosAsignados(asignados);
      setPermisosOriginales(asignados);
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setPermsError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : "No tienes permisos para ver los permisos de este usuario."
      );
    } finally {
      setLoadingPerms(false);
    }
  }, [usuarioSeleccionado]);

  useEffect(() => {
    loadPermisosUsuario();
  }, [loadPermisosUsuario]);

  // ---- acciones ----
  const hayCambios = useMemo(() => {
    const a = [...permisosAsignados].sort();
    const b = [...permisosOriginales].sort();
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [permisosAsignados, permisosOriginales]);

  const handleGuardarPermisos = async () => {
    if (!canEdit) {
      toast.warn("No tienes permiso para modificar permisos.");
      return;
    }
    if (!usuarioSeleccionado) return;
    try {
      await updateUserPermissions(usuarioSeleccionado, permisosAsignados);
      toast.success("Permisos actualizados correctamente");
      // sincrono el baseline
      setPermisosOriginales(permisosAsignados);
    } catch (err) {
      toast.error(err?.message || "Error al guardar permisos");
    }
  };

  // ---- view state ----
  const pageState = checkingSession
    ? "checking"
    : !canView
    ? "no-permission"
    : usersError
    ? "error-users"
    : loadingUsers
    ? "loading-users"
    : usuarios.length === 0
    ? "empty-users"
    : "data";

  const renderPageState = () => {
    if (pageState === "checking") {
      return (
        <StatusCard
          icon={<HourglassEmptyRoundedIcon />}
          title="Verificando sesión…"
          description={
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size="sm" />
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                Por favor, espera un momento.
              </Typography>
            </Stack>
          }
        />
      );
    }
    if (pageState === "no-permission") {
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title="Sin permisos para gestionar permisos"
          description="Consulta con un administrador para obtener acceso."
        />
      );
    }
    if (pageState === "error-users") {
      const isNetwork = /conexión|fetch/i.test(usersError || "");
      return (
        <StatusCard
          color={isNetwork ? "warning" : "danger"}
          icon={
            isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
          }
          title={
            isNetwork
              ? "Problema de conexión"
              : "No se pudo cargar la lista de usuarios"
          }
          description={usersError}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={loadUsuarios}
              variant="soft">
              Reintentar
            </Button>
          }
        />
      );
    }
    if (pageState === "loading-users") {
      return (
        <Sheet p={3} sx={{ textAlign: "center" }}>
          <Stack spacing={1} alignItems="center">
            <CircularProgress />
            <Typography level="body-sm">Cargando usuarios…</Typography>
          </Stack>
        </Sheet>
      );
    }
    if (pageState === "empty-users") {
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title="Sin usuarios"
          description="Aún no hay usuarios registrados."
        />
      );
    }
    return null;
  };

  // --- filtro rápido (permiso) con botón limpiar ---
  const searchInput = (
    <Input
      placeholder="Buscar permiso…"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      startDecorator={<SearchRoundedIcon />}
      endDecorator={
        busqueda ? (
          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            onClick={() => setBusqueda("")}
            aria-label="Limpiar búsqueda">
            <ClearIcon />
          </IconButton>
        ) : null
      }
      sx={{ width: { xs: "100%", sm: 320 } }}
      disabled={!usuarioSeleccionado}
    />
  );

  // --- contenido cuando sí hay usuarios (pageState === 'data') ---
  const content = (
    <>
      {/* Selector de usuario */}
      <Typography level="body-md" mb={0.75}>
        Selecciona un usuario:
      </Typography>
      <Select
        placeholder="Seleccionar usuario"
        value={usuarioSeleccionado || ""}
        onChange={(_, value) => setUsuarioSeleccionado(value || "")}
        sx={{ mb: 2, width: { xs: "100%", sm: 380 } }}>
        {usuarios.map((u) => (
          <Option key={u.id_usuario} value={u.id_usuario}>
            {u.nombre} {u.rol ? `(${u.rol})` : ""}
          </Option>
        ))}
      </Select>

      {/* Buscador y acciones */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 1.5 }}>
        {searchInput}

        <Tooltip
          title={
            !usuarioSeleccionado
              ? "Selecciona un usuario"
              : !canEdit
              ? "No tienes permisos para modificar"
              : !hayCambios
              ? "No hay cambios por guardar"
              : "Guardar cambios"
          }
          variant="soft">
          <span>
            <Button
              onClick={handleGuardarPermisos}
              startDecorator={<SaveIcon />}
              disabled={
                !usuarioSeleccionado || !canEdit || !hayCambios || loadingPerms
              }
              loading={loadingPerms}>
              Guardar cambios
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Estado de permisos del usuario */}
      {!usuarioSeleccionado ? (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title="Selecciona un usuario"
          description="Elige un usuario para ver y editar sus permisos."
        />
      ) : loadingPerms ? (
        <PermissionsTableSkeleton />
      ) : permsError ? (
        (() => {
          const isNetwork = /conexión|fetch/i.test(permsError || "");
          return (
            <StatusCard
              color={isNetwork ? "warning" : "danger"}
              icon={
                isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
              }
              title={
                isNetwork
                  ? "Problema de conexión"
                  : "No se pudieron cargar los permisos"
              }
              description={permsError}
              actions={
                <Button
                  startDecorator={<RestartAltRoundedIcon />}
                  onClick={loadPermisosUsuario}
                  variant="soft">
                  Reintentar
                </Button>
              }
            />
          );
        })()
      ) : Object.keys(todosLosPermisos || {}).length === 0 ? (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title="Sin permisos configurados"
          description="Este usuario no tiene grupos de permisos disponibles."
        />
      ) : (
        <PermissionsTable
          permisosAsignados={permisosAsignados}
          todosLosPermisos={todosLosPermisos}
          onUpdate={setPermisosAsignados}
          busquedaGlobal={busqueda}
        />
      )}
    </>
  );

  // ---- UI ----
  return (
    <Box display="flex" justifyContent="center" mt={4} px={{ xs: 2, md: 4 }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 1000,
          p: 3,
          borderRadius: "lg",
          boxShadow: "lg",
          bgcolor: "background.body",
        }}>
        <Typography level="h3" mb={1}>
          Gestión de Permisos
        </Typography>
        <Typography level="body-sm" color="neutral" sx={{ mb: 1.5 }}>
          Asigna o revoca permisos por usuario. Usa el buscador para filtrar
          rápidamente.
        </Typography>

        {pageState !== "data" ? (
          <Box mt={1.5}>{renderPageState()}</Box>
        ) : (
          content
        )}
      </Card>
    </Box>
  );
}
