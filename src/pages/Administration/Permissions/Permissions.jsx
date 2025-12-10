import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Skeleton,
  Stack,
  Autocomplete,
  AutocompleteOption,
  Snackbar,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/joy";

import SaveIcon from "@mui/icons-material/Save";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import { useAuth } from "../../../context/AuthContext"; // Ajusta la ruta si es necesario
import PermissionsTable from "../../../components/Administration/PermissionForms/PermissionsTable"; // Ajusta la ruta
import {
  getAllUsers,
  getUserPermissions,
  updateUserPermissions,
} from "../../../services/PermissionsServices"; // Ajusta la ruta

import StatusCard from "../../../components/common/StatusCard"; // Ajusta la ruta

// --- Skeleton para carga ---
function PermissionsTableSkeleton() {
  return (
    <Box sx={{ mt: 2 }}>
      {[...Array(3)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width="100%"
          height={60}
          sx={{ mb: 1, borderRadius: "md" }}
        />
      ))}
    </Box>
  );
}

export default function Permissions() {
  // ---- Auth ----
  const { userData, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const canView = isAdmin || hasPermiso("asignar_permisos");
  const canEdit = isAdmin || hasPermiso("asignar_permisos");

  // ---- Estados ----
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usuarioObj, setUsuarioObj] = useState(null); // Objeto completo del usuario seleccionado

  const [loadingPerms, setLoadingPerms] = useState(false);
  const [permsError, setPermsError] = useState(null);

  const [todosLosPermisos, setTodosLosPermisos] = useState({});
  const [permisosAsignados, setPermisosAsignados] = useState([]);
  const [permisosOriginales, setPermisosOriginales] = useState([]);

  // ---- Snackbar (Reemplazo de Toast) ----
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    color: "neutral",
    icon: null,
  });

  const showSnack = (msg, color = "success") => {
    setSnack({
      open: true,
      msg,
      color,
      icon:
        color === "success" ? <CheckCircleIcon /> : <ErrorOutlineRoundedIcon />,
    });
  };

  // ---- Cargar Usuarios ----
  const loadUsuarios = useCallback(async () => {
    if (!canView) {
      setLoadingUsers(false);
      return;
    }
    setLoadingUsers(true);
    try {
      const res = await getAllUsers();
      setUsuarios(Array.isArray(res) ? res : []);
    } catch (err) {
      showSnack("Error al cargar lista de usuarios", "danger");
    } finally {
      setLoadingUsers(false);
    }
  }, [canView]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  // ---- Cargar Permisos (Se ejecuta al seleccionar usuario) ----
  const loadPermisosUsuario = useCallback(async () => {
    if (!usuarioObj) {
      setTodosLosPermisos({});
      setPermisosAsignados([]);
      return;
    }

    setLoadingPerms(true);
    setPermsError(null);
    try {
      // Usamos el ID del objeto seleccionado
      const res = await getUserPermissions(usuarioObj.id_usuario);

      const permisosObj = res?.permisos || {};
      // Aplanamos la estructura para tener solo los nombres asignados
      const asignados = Object.values(permisosObj)
        .flat()
        .filter((p) => p?.asignado)
        .map((p) => p?.nombre);

      setTodosLosPermisos(permisosObj);
      setPermisosAsignados(asignados);
      setPermisosOriginales(asignados);
    } catch (err) {
      console.error(err);
      setPermsError("No se pudieron obtener los permisos.");
    } finally {
      setLoadingPerms(false);
    }
  }, [usuarioObj]);

  useEffect(() => {
    loadPermisosUsuario();
  }, [loadPermisosUsuario]);

  // ---- Detectar Cambios ----
  const hayCambios = useMemo(() => {
    const a = [...permisosAsignados].sort();
    const b = [...permisosOriginales].sort();
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [permisosAsignados, permisosOriginales]);

  // ---- Guardar ----
  const handleGuardarPermisos = async () => {
    if (!canEdit || !usuarioObj) return;

    try {
      await updateUserPermissions(usuarioObj.id_usuario, permisosAsignados);

      showSnack("Permisos actualizados correctamente", "success");

      // Actualizamos el estado "original" para deshabilitar el botón
      setPermisosOriginales(permisosAsignados);

      // Opcional: Recargar los permisos para asegurar sincronía
      // await loadPermisosUsuario();
    } catch (err) {
      showSnack(err?.message || "Error al guardar cambios", "danger");
    }
  };

  // ---- Renderizado: Sin Permisos ----
  if (!canView) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title="Acceso Denegado"
          description="No tienes permisos para gestionar roles."
        />
      </Box>
    );
  }

  // ---- Renderizado: UI Principal ----
  return (
    <Box
      sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Título y Descripción */}
      <Box sx={{ mb: 3 }}>
        <Typography
          level="h2"
          startDecorator={
            <ManageAccountsIcon fontSize="xl2" sx={{ color: "primary.500" }} />
          }>
          Gestión de Permisos
        </Typography>
        <Typography level="body-md" color="neutral" sx={{ mt: 1 }}>
          Configura los accesos y privilegios de los usuarios del sistema.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Tarjeta de Selección (Buscador) */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "lg",
            boxShadow: "sm",
            bgcolor: "background.surface",
          }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={2}
            alignItems="flex-end">
            <Box sx={{ flex: 1, width: "100%" }}>
              <Typography level="title-sm" mb={1}>
                Buscar Usuario
              </Typography>
              <Autocomplete
                placeholder="Busca por nombre, rol o email..."
                options={usuarios}
                loading={loadingUsers}
                getOptionLabel={(option) => `${option.nombre} (${option.rol})`}
                isOptionEqualToValue={(option, value) =>
                  option.id_usuario === value.id_usuario
                }
                value={usuarioObj}
                onChange={(_, newValue) => setUsuarioObj(newValue)}
                startDecorator={<PersonSearchIcon />}
                endDecorator={
                  loadingUsers ? <CircularProgress size="sm" /> : null
                }
                renderOption={(props, option) => (
                  <AutocompleteOption {...props}>
                    <Stack>
                      <Typography level="title-sm">{option.nombre}</Typography>
                      <Typography level="body-xs">
                        {option.rol} • {option.email}
                      </Typography>
                    </Stack>
                  </AutocompleteOption>
                )}
                sx={{ width: "100%" }}
              />
            </Box>

            {/* Botón Guardar */}
            <Button
              size="lg"
              color="primary"
              startDecorator={<SaveIcon />}
              onClick={handleGuardarPermisos}
              disabled={!usuarioObj || !hayCambios || loadingPerms}
              loading={loadingPerms}
              sx={{ width: { xs: "100%", md: "auto" } }}>
              Guardar Cambios
            </Button>
          </Stack>
        </Card>

        {/* Área de Permisos */}
        <Card
          variant="outlined"
          sx={{ minHeight: 400, borderRadius: "lg", boxShadow: "sm" }}>
          {!usuarioObj ? (
            // Estado Vacío
            <Stack
              alignItems="center"
              justifyContent="center"
              height="100%"
              spacing={2}
              py={8}
              sx={{ opacity: 0.5 }}>
              <PersonSearchIcon sx={{ fontSize: 64, color: "neutral.400" }} />
              <Typography level="h4" textColor="neutral.500">
                Selecciona un usuario
              </Typography>
              <Typography textColor="neutral.400">
                Usa el buscador de arriba para comenzar.
              </Typography>
            </Stack>
          ) : loadingPerms ? (
            // Skeleton de Carga
            <PermissionsTableSkeleton />
          ) : permsError ? (
            // Error
            <StatusCard
              color="danger"
              icon={<ErrorOutlineRoundedIcon />}
              title="Error al cargar permisos"
              description={permsError}
              actions={
                <Button
                  variant="soft"
                  onClick={loadPermisosUsuario}
                  startDecorator={<RestartAltRoundedIcon />}>
                  Reintentar
                </Button>
              }
            />
          ) : (
            // Contenido Real
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}>
                <Box>
                  <Typography level="title-lg">
                    Permisos de {usuarioObj.nombre}
                  </Typography>
                  <Typography level="body-xs">{usuarioObj.email}</Typography>
                </Box>
                <Chip variant="soft" color={hayCambios ? "warning" : "success"}>
                  {hayCambios ? "Cambios sin guardar" : "Sincronizado"}
                </Chip>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {/* Tu componente de tabla existente */}
              <PermissionsTable
                permisosAsignados={permisosAsignados}
                todosLosPermisos={todosLosPermisos}
                onUpdate={setPermisosAsignados}
                busquedaGlobal=""
              />
            </>
          )}
        </Card>
      </Stack>

      {/* Notificaciones */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        color={snack.color}
        variant="soft"
        startDecorator={snack.icon}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        {snack.msg}
      </Snackbar>
    </Box>
  );
}
