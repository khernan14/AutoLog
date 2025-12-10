import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemContent,
  Switch,
  Button,
  CircularProgress,
  Stack,
  Card,
  Input,
} from "@mui/joy";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveIcon from "@mui/icons-material/Save";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import { useToast } from "../../../context/ToastContext";
import {
  getUserPermissions,
  updateUserPermissions,
} from "../../../services/PermissionsServices";

// ⚙️ CONFIGURACIÓN DE GRUPOS "EN CASCADA"
const CASCADING_CONFIG = {
  Vehiculos: {
    isCascade: false,
    masterPermission: "gestion_vehiculos",
    title: "Gestión de Flota y Vehículos",
    description: "Habilita el acceso al módulo de vehículos.",
  },
  Usuarios: {
    isCascade: false,
    masterPermission: "gestion_usuarios",
    title: "Administración de Usuarios",
    description: "Permite gestionar el personal y accesos.",
  },
};

export default function UserPermissionsDrawer({
  user,
  open,
  onClose,
  onUpdateSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionsData, setPermissionsData] = useState({});
  const [assignedList, setAssignedList] = useState([]);

  // 🔍 Estado para el buscador
  const [searchTerm, setSearchTerm] = useState("");

  const { showToast } = useToast();

  // --- Cargar Permisos ---
  const fetchPermissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setSearchTerm(""); // Limpiar búsqueda al abrir
    try {
      const res = await getUserPermissions(user.id_usuario);
      const rawGroups = res?.permisos || {};
      setPermissionsData(rawGroups);

      const currentAssigned = Object.values(rawGroups)
        .flat()
        .filter((p) => p.asignado)
        .map((p) => p.nombre);

      setAssignedList(currentAssigned);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar permisos", "danger");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (open) fetchPermissions();
  }, [open, fetchPermissions]);

  // --- Lógica de Filtrado (Buscador) ---
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return permissionsData;

    const term = searchTerm.toLowerCase();
    const result = {};

    Object.entries(permissionsData).forEach(([group, perms]) => {
      // Filtramos los permisos dentro del grupo
      const matchingPerms = perms.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(term))
      );

      // Si el grupo tiene coincidencias (o el nombre del grupo coincide), lo mostramos
      if (matchingPerms.length > 0 || group.toLowerCase().includes(term)) {
        // Si coincide por nombre de grupo, mostramos todos sus permisos
        // Si coincide por permisos, mostramos solo los que coinciden
        result[group] = group.toLowerCase().includes(term)
          ? perms
          : matchingPerms;
      }
    });

    return result;
  }, [permissionsData, searchTerm]);

  // --- Manejar Toggle Individual ---
  const handleToggle = (permisoNombre) => {
    setAssignedList((prev) => {
      const exists = prev.includes(permisoNombre);
      return exists
        ? prev.filter((p) => p !== permisoNombre)
        : [...prev, permisoNombre];
    });
  };

  // --- Manejar Toggle Maestro ---
  const handleMasterToggle = (masterPerm, childrenPerms) => {
    const isMasterActive = assignedList.includes(masterPerm);
    if (isMasterActive) {
      const childrenNames = childrenPerms.map((p) => p.nombre);
      setAssignedList((prev) =>
        prev.filter((p) => p !== masterPerm && !childrenNames.includes(p))
      );
    } else {
      setAssignedList((prev) => [...prev, masterPerm]);
    }
  };

  // --- Guardar ---
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserPermissions(user.id_usuario, assignedList);
      showToast("Permisos actualizados correctamente", "success");
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (error) {
      showToast("Error al guardar cambios", "danger");
    } finally {
      setSaving(false);
    }
  };

  // --- Renderizado de Grupo ---
  const renderGroup = (groupName, permissions) => {
    const config = CASCADING_CONFIG[groupName];

    // 1. Caso Especial: Grupo en Cascada (Vehículos, Usuarios)
    if (config && config.isCascade) {
      const masterPerm = permissionsData[groupName]?.find(
        (p) => p.nombre === config.masterPermission
      );

      // Si estamos filtrando y el permiso maestro se filtró (no aparece), buscamos en la data original
      // para asegurar que el switch principal siempre exista si hay hijos visibles.
      const safeMasterPerm = masterPerm || { nombre: config.masterPermission };

      const subPermissions = permissions.filter(
        (p) => p.nombre !== config.masterPermission
      );

      // Si por culpa del filtro no quedó nada en este grupo, no renderizamos
      if (!masterPerm && subPermissions.length === 0) return null;

      const isMasterOn = assignedList.includes(safeMasterPerm.nombre);

      return (
        <Card
          variant="outlined"
          key={groupName}
          sx={{
            mb: 2,
            p: 0,
            overflow: "hidden",
            borderColor: isMasterOn ? "primary.300" : "divider",
          }}>
          <Box
            sx={{
              p: 2,
              bgcolor: isMasterOn ? "primary.50" : "transparent",
              transition: "0.2s",
            }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center">
              <Box>
                <Typography
                  level="title-md"
                  color={isMasterOn ? "primary" : "neutral"}>
                  {config.title || groupName}
                </Typography>
                <Typography level="body-xs">{config.description}</Typography>
              </Box>
              <Switch
                checked={isMasterOn}
                onChange={() =>
                  handleMasterToggle(
                    safeMasterPerm.nombre,
                    permissionsData[groupName].filter(
                      (p) => p.nombre !== config.masterPermission
                    )
                  )
                }
                color={isMasterOn ? "primary" : "neutral"}
                variant={isMasterOn ? "solid" : "outlined"}
                sx={{ ml: 2 }}
              />
            </Stack>
          </Box>

          {/* Sub-permisos: Visibles si Master ON */}
          {isMasterOn && (
            <Box sx={{ p: 2, pt: 1, bgcolor: "background.surface" }}>
              <Divider sx={{ mb: 1.5, opacity: 0.5 }} />

              {subPermissions.length > 0 ? (
                <>
                  <Typography
                    level="body-xs"
                    fontWeight="bold"
                    mb={1}
                    textTransform="uppercase"
                    letterSpacing="1px">
                    Capacidades habilitadas:
                  </Typography>
                  <List size="sm">
                    {subPermissions.map((perm) => (
                      <ListItem key={perm.id}>
                        <ListItemContent>
                          <Typography level="body-sm">
                            {perm.nombre.replace(/_/g, " ")}
                          </Typography>
                          <Typography level="body-xs" textColor="neutral.500">
                            {perm.descripcion}
                          </Typography>
                        </ListItemContent>
                        <Switch
                          size="sm"
                          checked={assignedList.includes(perm.nombre)}
                          onChange={() => handleToggle(perm.nombre)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography level="body-xs" color="neutral" fontStyle="italic">
                  No hay sub-permisos que coincidan con la búsqueda.
                </Typography>
              )}
            </Box>
          )}
        </Card>
      );
    }

    // 2. Caso Normal: Lista Simple
    return (
      <Box key={groupName} sx={{ mb: 3 }}>
        <Typography
          level="title-sm"
          sx={{
            mb: 1,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontSize: "xs",
          }}>
          {groupName}
        </Typography>
        <Card variant="soft" sx={{ bgcolor: "background.level1" }}>
          <List>
            {permissions.map((perm, idx) => (
              <React.Fragment key={perm.id}>
                {idx > 0 && <Divider />}
                <ListItem>
                  <ListItemContent>
                    <Typography level="title-sm">
                      {perm.nombre.replace(/_/g, " ")}
                    </Typography>
                    <Typography level="body-xs">
                      {perm.descripcion || "Sin descripción"}
                    </Typography>
                  </ListItemContent>
                  <Switch
                    checked={assignedList.includes(perm.nombre)}
                    onChange={() => handleToggle(perm.nombre)}
                    color={
                      assignedList.includes(perm.nombre) ? "success" : "neutral"
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={saving ? undefined : onClose}
      size="md"
      slotProps={{
        content: {
          sx: {
            width: { xs: "100%", md: "500px" },
            p: 0,
            display: "flex",
            flexDirection: "column",
          },
        },
      }}>
      {/* Header Fijo */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "background.surface",
        }}>
        <IconButton
          variant="plain"
          color="neutral"
          onClick={onClose}
          disabled={saving}>
          <CloseRoundedIcon />
        </IconButton>
        <Box flex={1}>
          <Typography
            level="h4"
            startDecorator={
              <ManageAccountsIcon sx={{ color: "primary.500" }} />
            }>
            Permisos
          </Typography>
          <Typography level="body-sm" color="neutral" noWrap>
            Configurando a: <b>{user?.nombre}</b>
          </Typography>
        </Box>
        {loading && <CircularProgress size="sm" />}
      </Box>

      {/* Buscador Sticky */}
      <Box
        sx={{
          p: 2,
          pb: 1,
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.body",
        }}>
        <Input
          placeholder="Buscar permiso..."
          startDecorator={<SearchRoundedIcon />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          variant="outlined"
          fullWidth
        />
      </Box>

      {/* Contenido Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          pt: 1,
          bgcolor: "background.body",
        }}>
        {Object.keys(filteredPermissions).length === 0 && !loading ? (
          <Box textAlign="center" mt={4} opacity={0.6}>
            <SearchRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography>No se encontraron permisos.</Typography>
          </Box>
        ) : (
          Object.entries(filteredPermissions).map(([groupName, perms]) =>
            renderGroup(groupName, perms)
          )
        )}
      </Box>

      {/* Footer Fijo */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.surface",
        }}>
        <Button
          fullWidth
          size="lg"
          startDecorator={<SaveIcon />}
          onClick={handleSave}
          loading={saving}
          disabled={loading}>
          Guardar Permisos
        </Button>
      </Box>
    </Drawer>
  );
}
