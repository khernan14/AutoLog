// src/components/Users/Permissions/UserPermissionsDrawer.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next"; // 👈 i18n
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
  ModalClose,
} from "@mui/joy";

// Iconos
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";

// Services & Context
import { useToast } from "../../../context/ToastContext";
import {
  getUserPermissions,
  updateUserPermissions,
} from "../../../services/PermissionsServices";

// Configuración de Grupos en Cascada
const CASCADING_CONFIG = {
  Vehiculos: {
    isCascade: false, // Cambiar a true si quieres activar la lógica de cascada visual
    masterPermission: "gestion_vehiculos",
    titleKey: "permissions.groups.vehicles.title",
    descKey: "permissions.groups.vehicles.desc",
  },
  Usuarios: {
    isCascade: false,
    masterPermission: "gestion_usuarios",
    titleKey: "permissions.groups.users.title",
    descKey: "permissions.groups.users.desc",
  },
};

export default function UserPermissionsDrawer({
  user,
  open,
  onClose,
  onUpdateSuccess,
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionsData, setPermissionsData] = useState({});
  const [assignedList, setAssignedList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Carga ---
  const fetchPermissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setSearchTerm("");
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
      showToast(t("permissions.errors.load_failed"), "danger");
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t]);

  useEffect(() => {
    if (open) fetchPermissions();
  }, [open, fetchPermissions]);

  // --- Filtrado ---
  const filteredPermissions = useMemo(() => {
    if (!searchTerm.trim()) return permissionsData;
    const term = searchTerm.toLowerCase();
    const result = {};

    Object.entries(permissionsData).forEach(([group, perms]) => {
      const matchingPerms = perms.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(term))
      );

      if (matchingPerms.length > 0 || group.toLowerCase().includes(term)) {
        result[group] = group.toLowerCase().includes(term)
          ? perms
          : matchingPerms;
      }
    });
    return result;
  }, [permissionsData, searchTerm]);

  // --- Toggles ---
  const handleToggle = (permisoNombre) => {
    setAssignedList((prev) =>
      prev.includes(permisoNombre)
        ? prev.filter((p) => p !== permisoNombre)
        : [...prev, permisoNombre]
    );
  };

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
      showToast(t("permissions.success.updated"), "success");
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (error) {
      showToast(t("permissions.errors.save_failed"), "danger");
    } finally {
      setSaving(false);
    }
  };

  // --- Render Grupo ---
  const renderGroup = (groupName, permissions) => {
    const config = CASCADING_CONFIG[groupName];

    // 1. Grupo Especial (Cascada)
    if (config && config.isCascade) {
      const masterPerm = permissionsData[groupName]?.find(
        (p) => p.nombre === config.masterPermission
      );
      const safeMasterPerm = masterPerm || { nombre: config.masterPermission };
      const subPermissions = permissions.filter(
        (p) => p.nombre !== config.masterPermission
      );

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
                  {t(config.titleKey) || groupName}
                </Typography>
                <Typography level="body-xs">{t(config.descKey)}</Typography>
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

          {isMasterOn && (
            <Box sx={{ p: 2, pt: 1, bgcolor: "background.surface" }}>
              <Divider sx={{ mb: 1.5, opacity: 0.5 }} />
              {subPermissions.length > 0 ? (
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
              ) : (
                <Typography level="body-xs" color="neutral" fontStyle="italic">
                  {t("permissions.empty_sub_search")}
                </Typography>
              )}
            </Box>
          )}
        </Card>
      );
    }

    // 2. Grupo Normal
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
        <Card variant="soft" sx={{ bgcolor: "background.level1", p: 0 }}>
          <List sx={{ "--ListItem-paddingY": "12px" }}>
            {permissions.map((perm, idx) => (
              <React.Fragment key={perm.id}>
                {idx > 0 && <Divider />}
                <ListItem>
                  <ListItemContent>
                    <Typography level="title-sm">
                      {perm.nombre.replace(/_/g, " ")}
                    </Typography>
                    <Typography level="body-xs">
                      {perm.descripcion || t("permissions.no_desc")}
                    </Typography>
                  </ListItemContent>
                  <Switch
                    checked={assignedList.includes(perm.nombre)}
                    onChange={() => handleToggle(perm.nombre)}
                    color={
                      assignedList.includes(perm.nombre) ? "success" : "neutral"
                    }
                    variant={
                      assignedList.includes(perm.nombre) ? "solid" : "outlined"
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
      {/* Header */}
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
        <Box flex={1}>
          <Typography
            level="h4"
            startDecorator={
              <ManageAccountsRoundedIcon sx={{ color: "primary.500" }} />
            }>
            {t("permissions.title")}
          </Typography>
          <Typography level="body-sm" color="neutral" noWrap>
            {t("permissions.subtitle", { name: user?.nombre })}
          </Typography>
        </Box>
        <ModalClose disabled={saving} onClick={onClose} />
      </Box>

      {/* Buscador Sticky */}
      {Object.keys(permissionsData).length > 0 && (
        <Box
          sx={{
            p: 2,
            pb: 1,
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: "background.body",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}>
          <Input
            placeholder={t("permissions.search_placeholder")}
            startDecorator={<SearchRoundedIcon />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
            fullWidth
          />
        </Box>
      )}

      {/* Contenido */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          pt: 2,
          bgcolor: "background.body",
        }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : Object.keys(filteredPermissions).length === 0 ? (
          <Box textAlign="center" mt={4} color="neutral.400">
            <FilterListOffRoundedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography>{t("permissions.empty_search")}</Typography>
          </Box>
        ) : (
          Object.entries(filteredPermissions).map(([groupName, perms]) =>
            renderGroup(groupName, perms)
          )
        )}
      </Box>

      {/* Footer */}
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
          startDecorator={<SaveRoundedIcon />}
          onClick={handleSave}
          loading={saving}
          disabled={loading}>
          {t("common.actions.save_changes")}
        </Button>
      </Box>
    </Drawer>
  );
}
