import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Select,
  Option,
  CircularProgress, // Todavía se usa para la carga inicial de usuarios
  Button,
  Input,
  Divider, // Nuevo: para separación visual
  Skeleton, // Nuevo: para el esqueleto de carga de la tabla
} from "@mui/joy";
import PermissionsTable from "../../../components/Administration/PermissionForms/PermissionsTable";
import {
  getAllUsers,
  getUserPermissions,
  updateUserPermissions,
} from "../../../services/PermissionsServices";
import { toast } from "react-toastify";
import SaveIcon from "@mui/icons-material/Save"; // Nuevo: icono para el botón de guardar

export default function Permissions() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [permisosAsignados, setPermisosAsignados] = useState([]);
  const [permisosOriginales, setPermisosOriginales] = useState([]);
  const [todosLosPermisos, setTodosLosPermisos] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true); // Nuevo estado para la carga inicial de usuarios
  const [error, setError] = useState(null);

  const cargarUsuarios = async () => {
    setLoadingUsers(true); // Iniciar carga de usuarios
    try {
      const res = await getAllUsers();
      setUsuarios(res);
      setError(null);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setError("No tienes permisos para ver los usuarios.");
      toast.error("No tienes permisos para ver los usuarios.");
    } finally {
      setLoadingUsers(false); // Finalizar carga de usuarios
    }
  };

  const cargarPermisos = async () => {
    if (!usuarioSeleccionado) return;
    setLoading(true); // Iniciar carga de permisos
    try {
      const res = await getUserPermissions(usuarioSeleccionado);
      if (res && res.permisos) {
        const asignados = Object.values(res.permisos)
          .flat()
          .filter((p) => p.asignado)
          .map((p) => p.nombre);

        setPermisosAsignados(asignados);
        setPermisosOriginales(asignados);
        setTodosLosPermisos(res.permisos);
        setError(null);
      }
    } catch (error) {
      console.error("Error al cargar permisos:", error);
      setError("No tienes permisos para ver los permisos de este usuario.");
      toast.error("No tienes permisos para ver los permisos.");
    } finally {
      setLoading(false); // Finalizar carga de permisos
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    cargarPermisos();
  }, [usuarioSeleccionado]);

  const handleGuardarPermisos = async () => {
    setLoading(true);
    try {
      const res = await updateUserPermissions(
        usuarioSeleccionado,
        permisosAsignados
      );
      if (res) {
        toast.success("Permisos actualizados correctamente");
        setPermisosOriginales(permisosAsignados);
      }
    } catch (error) {
      console.error("Error al guardar permisos:", error);
      toast.error("Error al guardar permisos");
    } finally {
      setLoading(false);
    }
  };

  const hayCambios = () => {
    const a = [...permisosAsignados].sort();
    const b = [...permisosOriginales].sort();
    return JSON.stringify(a) !== JSON.stringify(b);
  };

  // Componente Skeleton para la tabla de permisos
  const PermissionsTableSkeleton = () => (
    <Box
      sx={{
        mt: 3,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "md",
      }}>
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={40} />
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 900,
          p: 3,
          borderRadius: "lg",
          boxShadow: "lg",
        }}>
        {" "}
        {/* Mejora en Card */}
        <Typography level="h3" mb={2}>
          {" "}
          {/* Aumento de nivel para el título */}
          Gestión de Permisos
        </Typography>
        {error ? (
          <Box
            textAlign="center"
            mt={4}
            p={2}
            variant="soft"
            color="danger"
            sx={{ borderRadius: "md" }}>
            {" "}
            {/* Estilo para el mensaje de error */}
            <Typography color="danger" level="body-md" mb={2}>
              {error}
            </Typography>
            <Button onClick={cargarUsuarios} variant="outlined">
              Reintentar
            </Button>
          </Box>
        ) : (
          <>
            <Typography level="body-md" mb={1}>
              Selecciona un usuario:
            </Typography>
            {loadingUsers ? ( // Mostrar CircularProgress mientras se cargan los usuarios
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size="sm" />
              </Box>
            ) : (
              <Select
                placeholder="Seleccionar usuario"
                value={usuarioSeleccionado || ""}
                onChange={(e, value) => setUsuarioSeleccionado(value)}
                sx={{ mb: 2 }}>
                {usuarios.map((u) => (
                  <Option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombre} ({u.rol})
                  </Option>
                ))}
              </Select>
            )}
            <Typography level="body-md" mb={1}>
              Buscar permiso:
            </Typography>
            <Input
              placeholder="Escribe para buscar un permiso..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            />
            <Divider sx={{ mb: 3 }} /> {/* Nuevo: Separador visual */}
            {/* Nuevo: Condición para mostrar el Skeleton o la tabla real */}
            {loading ? (
              <PermissionsTableSkeleton />
            ) : (
              usuarioSeleccionado && (
                <PermissionsTable
                  permisosAsignados={permisosAsignados}
                  todosLosPermisos={todosLosPermisos}
                  onUpdate={setPermisosAsignados}
                  busquedaGlobal={busqueda}
                />
              )
            )}
            {usuarioSeleccionado && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  onClick={handleGuardarPermisos}
                  loading={loading}
                  disabled={!hayCambios() || loading}
                  color="primary"
                  variant="solid"
                  startDecorator={<SaveIcon />}>
                  Guardar cambios
                </Button>
              </Box>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}
