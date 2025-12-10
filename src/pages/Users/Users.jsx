// src/pages/Configuracion/Usuarios/Users.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Sheet,
  CircularProgress,
  Table,
  IconButton,
  Checkbox,
  Chip,
  Tooltip,
  Input,
  Switch,
} from "@mui/joy";

import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SecurityRoundedIcon from "@mui/icons-material/Security";

import Swal from "sweetalert2";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import {
  getUsers as getUsersService,
  createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  restoreUser as restoreUserService,
  getUserSupervisors,
} from "../../services/AuthServices";
import UserPermissionsDrawer from "../../components/Users/Permissions/UserPermissionsDrawer";

import { getCiudades } from "../../services/RegistrosService";
import { sendMail, sendRecoveryPassword } from "../../services/MailServices";

import StatusCard from "../../components/common/StatusCard";
import UserFormModal from "../../components/Users/UserForm/UserFormModal";

// ⭐ Hook de foco/highlight reutilizable
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";

// Normalizador para ignorar mayúsculas/tildes
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function Users() {
  // ---- data ----
  const [users, setUsers] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [supervisores, setSupervisores] = useState([]);

  // ---- ui state ----
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  // toolbar state
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // selection / modal
  const [selected, setSelected] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [permDrawerOpen, setPermDrawerOpen] = useState(false);
  const [permUser, setPermUser] = useState(null);

  // ---- auth/perm ----
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const can = useCallback(
    (perm) => isAdmin || hasPermiso(perm),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_usuarios");
  const canCreate = can("crear_usuario");
  const canEdit = can("editar_usuario");
  const canDelete = can("eliminar_usuario");
  const canRestore = can("restaurar_usuario");

  const { showToast } = useToast();

  // ---- load ----
  const load = useCallback(async () => {
    setChecking(checkingSession);
    if (checkingSession) {
      setLoading(true);
      return;
    }

    if (!canView) {
      setError(null); // deja a la tarjeta “sin permisos”
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [usersRes, ciudadesRes, supervisoresRes] = await Promise.all([
        getUsersService(),
        getCiudades(),
        getUserSupervisors(),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setCiudades(Array.isArray(ciudadesRes) ? ciudadesRes : []);
      setSupervisores(Array.isArray(supervisoresRes) ? supervisoresRes : []);
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : "No se pudo cargar la lista de usuarios."
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- helpers ----
  const getCiudadNombre = useCallback(
    (idCiudad) =>
      ciudades.find((c) => String(c.id) === String(idCiudad))?.nombre || "",
    [ciudades]
  );

  // ---- actions ----
  const onNew = () => {
    if (!canCreate)
      return showToast("No tienes permiso para crear usuarios.", "warning");
    setEditingUser(null);
    setOpenModal(true);
  };

  const onEdit = (user) => {
    if (!canEdit)
      return showToast("No tienes permiso para editar usuarios.", "warning");
    setEditingUser({
      ...user,
      ciudad: String(user.id_ciudad ?? user.ciudad),
      supervisor_id:
        user.supervisor_id != null ? String(user.supervisor_id) : "",
    });
    setOpenModal(true);
  };

  const onDelete = async (id) => {
    if (!canDelete)
      return showToast("No tienes permiso para eliminar usuarios.", "warning");

    const res = await Swal.fire({
      title: "¿Inactivar usuario?",
      text: "El usuario será marcado como Inactivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, inactivar",
    });
    if (!res.isConfirmed) return;

    try {
      const r = await deleteUserService(id);
      if (r && !r.error) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === id ? { ...u, estatus: "Inactivo" } : u
          )
        );
        setSelected((prev) => prev.filter((x) => x !== id));
        showToast("Usuario inactivado correctamente", "success");
      } else {
        showToast("Error al inactivar el usuario.", "danger");
      }
    } catch {
      showToast(
        "Error de conexión al intentar inactivar el usuario.",
        "danger"
      );
    }
  };

  const onRestore = async (id) => {
    if (!canRestore)
      return showToast("No tienes permiso para restaurar usuarios.", "warning");

    const res = await Swal.fire({
      title: "¿Restaurar usuario?",
      text: "El usuario será marcado como Activo.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, restaurar",
    });
    if (!res.isConfirmed) return;

    try {
      const r = await restoreUserService(id);
      if (r && !r.error) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === id ? { ...u, estatus: "Activo" } : u
          )
        );
        showToast("Usuario restaurado correctamente", "success");
      } else {
        showToast("Error al restaurar el usuario.", "danger");
      }
    } catch {
      showToast(
        "Error de conexión al intentar restaurar el usuario.",
        "danger"
      );
    }
  };

  const onBulkDelete = async () => {
    if (!canDelete)
      return showToast("No tienes permiso para inactivar usuarios.", "warning");
    if (selected.length === 0) return;

    const res = await Swal.fire({
      title: "¿Inactivar seleccionados?",
      text: "Los usuarios seleccionados serán marcados como Inactivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, inactivar",
    });
    if (!res.isConfirmed) return;

    try {
      await Promise.all(selected.map((id) => deleteUserService(id)));
      setUsers((prev) =>
        prev.map((u) =>
          selected.includes(u.id_usuario) ? { ...u, estatus: "Inactivo" } : u
        )
      );
      setSelected([]);
      showToast("Usuarios inactivados correctamente", "success");
    } catch {
      showToast(
        "Error de conexión al inactivar usuarios seleccionados.",
        "danger"
      );
    }
  };

  const onResetPassword = async (email) => {
    if (!email) {
      return showToast("El usuario no tiene un correo válido.", "warning");
    }

    const res = await Swal.fire({
      title: "¿Reiniciar contraseña?",
      text: `Se enviará un correo de restablecimiento a: ${email}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, enviar correo",
      cancelButtonText: "Cancelar",
    });

    if (!res.isConfirmed) return;

    try {
      await sendRecoveryPassword(email);

      showToast(
        "Si el correo está registrado, se envió un enlace para restablecer la contraseña.",
        "success"
      );
    } catch (error) {
      console.error(error);
      showToast(
        "No se pudo solicitar el reinicio de contraseña. Intenta de nuevo.",
        "danger"
      );
    }
  };

  const onManagePermissions = (user) => {
    if (!isAdmin && !hasPermiso("asignar_permisos")) {
      return showToast("No tienes permiso para gestionar accesos.", "warning");
    }
    setPermUser(user);
    setPermDrawerOpen(true);
  };

  const onSubmitUser = async (payload) => {
    if (payload?.id_usuario) {
      if (!canEdit)
        return showToast("No tienes permiso para editar usuarios.", "warning");
    } else {
      if (!canCreate)
        return showToast("No tienes permiso para crear usuarios.", "warning");
    }

    setSaving(true);
    try {
      if (payload?.id_usuario) {
        // === actualizar ===
        const r = await updateUserService(payload);
        if (!r || r.error) throw new Error(r?.error || "Error al actualizar");

        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === payload.id_usuario
              ? {
                  ...u,
                  ...payload,
                  ciudad: getCiudadNombre(payload.id_ciudad ?? payload.ciudad),
                }
              : u
          )
        );

        showToast("Usuario actualizado correctamente", "success");
      } else {
        // === crear ===
        const r = await createUserService(payload);
        if (!r || r.error) throw new Error(r?.error || "Error al crear");

        const ciudadNombre = getCiudadNombre(
          payload.id_ciudad ?? payload.ciudad
        );
        const nuevoUsuario = { ...r, ...payload, ciudad: ciudadNombre };

        try {
          await sendMail({
            to: nuevoUsuario.email,
            nombre: nuevoUsuario.nombre,
            usuario: nuevoUsuario.username,
            password: r.password || payload.password,
          });
        } catch (e) {
          showToast(
            "Usuario creado, pero el correo no se pudo enviar.",
            "warning"
          );
        }

        setUsers((prev) => [...prev, nuevoUsuario]);
        showToast("Usuario creado correctamente", "success");
      }

      setOpenModal(false);
      setEditingUser(null);
    } catch (err) {
      showToast(err?.message || "Error al guardar el usuario.", "danger");
    } finally {
      setSaving(false);
    }
  };

  // ---- filtered ----
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    return (users || []).filter((u) => {
      const matchesStatus = showInactive
        ? true
        : (u.estatus || "Activo") === "Activo";
      const text = `${u.nombre || ""} ${u.email || ""} ${u.username || ""} ${
        u.rol || ""
      } ${u.puesto || ""} ${u.ciudad || ""}`.toLowerCase();
      const matchesSearch = text.includes(s);
      return matchesStatus && matchesSearch;
    });
  }, [users, showInactive, search]);

  // ⭐ Hook de highlight (sin paginación: todo en una "página")
  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: filtered,
    perPage: filtered.length || 1,
    setPage: () => {}, // no hay paginación aquí
    matchRow: (u, token) => {
      const t = normalize(token);
      return (
        String(u.id_usuario) === token ||
        normalize(u.email) === t ||
        normalize(u.username) === t
      );
    },
    getRowId: (u) => u.id_usuario,
    highlightMs: 4000,
  });

  // Leer ?focus= de la URL, limpiar filtros y pedir foco
  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;

    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });

    // Aseguramos que el usuario sea visible
    setSearch("");
    setShowInactive(true);

    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // ---- view state ----
  const viewState = checking
    ? "checking"
    : !canView
    ? "no-permission"
    : error
    ? "error"
    : loading
    ? "loading"
    : filtered.length === 0
    ? "empty"
    : "data";

  const renderStatus = () => {
    if (viewState === "checking") {
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
    if (viewState === "no-permission") {
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title="Sin permisos para ver usuarios"
          description="Consulta con un administrador para obtener acceso."
        />
      );
    }
    if (viewState === "error") {
      const isNetwork = /conexión|failed to fetch/i.test(error || "");
      return (
        <StatusCard
          color={isNetwork ? "warning" : "danger"}
          icon={
            isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
          }
          title={
            isNetwork ? "Problema de conexión" : "No se pudo cargar la lista"
          }
          description={error}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={load}
              variant="soft">
              Reintentar
            </Button>
          }
        />
      );
    }
    if (viewState === "empty") {
      const noData = (users || []).length === 0;
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title={noData ? "Sin usuarios" : "No hay coincidencias"}
          description={
            noData
              ? "Aún no hay usuarios registrados."
              : "Ajusta la búsqueda o alterna 'ver inactivos' para ver resultados."
          }
        />
      );
    }
    return null;
  };

  // ==== selección para la tabla ====
  const allIds = useMemo(
    () => (filtered || []).map((u) => u.id_usuario),
    [filtered]
  );
  const hasSelection = selected.length > 0;
  const allSelectedInPage =
    allIds.length > 0 && allIds.every((id) => selected.includes(id));

  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      if (allSelectedInPage) {
        // quitar los visibles
        return prev.filter((id) => !allIds.includes(id));
      }
      // agregar visibles
      const set = new Set(prev);
      allIds.forEach((id) => set.add(id));
      return Array.from(set);
    });
  };

  // ---- UI ----
  return (
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 4 },
        pb: { xs: 2, sm: 2, md: 4 },
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        minHeight: "100dvh",
        bgcolor: "background.body",
      }}>
      <Box sx={{ width: "100%" }}>
        {/* ===== Toolbar estilo ActivosList (pero para usuarios) ===== */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
          mb={2}>
          <Box>
            <Typography
              level="body-xs"
              sx={{ textTransform: "uppercase", opacity: 0.7 }}>
              Usuarios
            </Typography>
            <Typography level="h4">Gestión de usuarios</Typography>
            <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.25 }}>
              Mostrando {filtered.length} de {users.length || 0} usuarios
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            {/* Buscar */}
            <Input
              size="sm"
              placeholder="Buscar por nombre, correo, usuario…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                search && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda">
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ width: { xs: "100%", sm: 260 } }}
            />

            {/* Ver inactivos */}
            <Tooltip
              title="Incluir usuarios inactivos en la lista"
              variant="soft">
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: "999px",
                  border: "1px solid",
                  borderColor: "divider",
                }}>
                <Switch
                  size="sm"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
                <Typography level="body-xs" sx={{ whiteSpace: "nowrap" }}>
                  Ver inactivos
                </Typography>
              </Stack>
            </Tooltip>

            {/* Inactivar seleccionados */}
            {hasSelection && (
              <Tooltip
                title={
                  canDelete
                    ? "Inactivar usuarios seleccionados"
                    : "No tienes permiso para inactivar usuarios"
                }
                variant="soft">
                <span>
                  <Button
                    size="sm"
                    variant="soft"
                    color="danger"
                    startDecorator={<DeleteForeverRoundedIcon />}
                    disabled={!canDelete}
                    onClick={onBulkDelete}
                    sx={{ borderRadius: "999px" }}>
                    Inactivar ({selected.length})
                  </Button>
                </span>
              </Tooltip>
            )}

            {/* Nuevo usuario */}
            <Tooltip
              title={
                canCreate
                  ? "Crear usuario"
                  : "No tienes permiso para crear usuarios"
              }
              variant="soft"
              placement="top-end">
              <span>
                <Button
                  size="sm"
                  startDecorator={<AddRoundedIcon />}
                  onClick={onNew}
                  disabled={!canCreate}
                  aria-disabled={!canCreate}
                  variant={canCreate ? "solid" : "soft"}
                  color={canCreate ? "primary" : "neutral"}
                  sx={{ borderRadius: "999px" }}>
                  Nuevo
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Contenedor principal */}
        <Card
          variant="plain"
          sx={{
            overflowX: "auto",
            width: "100%",
            background: "background.surface",
          }}>
          {viewState !== "data" ? (
            <Box p={2}>{renderStatus()}</Box>
          ) : (
            <Table
              size="sm"
              stickyHeader
              hoverRow
              sx={{
                minWidth: 880,
                "--TableCell-headBackground":
                  "var(--joy-palette-background-level5)",
                "--TableCell-headColor": "var(--joy-palette-text-secondary)",
                "--TableCell-headFontWeight": 600,
                "--TableCell-headBorderBottom":
                  "1px solid var(--joy-palette-divider)",
                "--TableRow-hoverBackground":
                  "var(--joy-palette-background-level1)",
              }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelectedInPage}
                      indeterminate={
                        !allSelectedInPage &&
                        hasSelection &&
                        filtered.length > 0
                      }
                      onChange={toggleSelectAllVisible}
                    />
                  </th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Puesto</th>
                  <th>Ciudad</th>
                  <th>Estatus</th>
                  <th style={{ width: 140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isInactive = (u.estatus || "Activo") !== "Activo";
                  return (
                    <tr
                      key={u.id_usuario}
                      ref={u.id_usuario === highlightId ? focusedRef : null}
                      style={
                        u.id_usuario === highlightId
                          ? {
                              backgroundColor: "rgba(59, 130, 246, 0.12)",
                              boxShadow:
                                "0 0 0 2px rgba(37, 99, 235, 0.6) inset",
                              transition:
                                "background-color 0.25s ease, box-shadow 0.25s ease",
                            }
                          : undefined
                      }>
                      <td>
                        <Checkbox
                          checked={selected.includes(u.id_usuario)}
                          onChange={() => toggleSelectOne(u.id_usuario)}
                        />
                      </td>
                      <td>{u.nombre || "—"}</td>
                      <td>{u.username || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>{u.rol || "—"}</td>
                      <td>{u.puesto || "—"}</td>
                      <td>{u.ciudad || "—"}</td>
                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={isInactive ? "neutral" : "success"}>
                          {u.estatus || "Activo"}
                        </Chip>
                      </td>
                      <td>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          justifyContent="flex-end">
                          {/* Editar */}
                          <Tooltip
                            title={canEdit ? "Editar usuario" : "Sin permiso"}
                            variant="soft">
                            <span>
                              <IconButton
                                size="sm"
                                onClick={() => onEdit(u)}
                                disabled={!canEdit}
                                aria-disabled={!canEdit}
                                variant={canEdit ? "soft" : "plain"}
                                color={canEdit ? "primary" : "neutral"}>
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Gestionar permisos" variant="soft">
                            <IconButton
                              size="sm"
                              color="warning" // Un color distintivo
                              variant="soft"
                              onClick={() => onManagePermissions(u)}>
                              <SecurityRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Inactivar / Restaurar */}
                          {!isInactive && (
                            <Tooltip
                              title={
                                canDelete ? "Inactivar usuario" : "Sin permiso"
                              }
                              variant="soft">
                              <span>
                                <IconButton
                                  size="sm"
                                  onClick={() => onDelete(u.id_usuario)}
                                  disabled={!canDelete}
                                  aria-disabled={!canDelete}
                                  variant={canDelete ? "soft" : "plain"}
                                  color={canDelete ? "danger" : "neutral"}>
                                  <DeleteForeverRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {isInactive && (
                            <Tooltip
                              title={
                                canRestore ? "Restaurar usuario" : "Sin permiso"
                              }
                              variant="soft">
                              <span>
                                <IconButton
                                  size="sm"
                                  onClick={() => onRestore(u.id_usuario)}
                                  disabled={!canRestore}
                                  aria-disabled={!canRestore}
                                  variant={canRestore ? "soft" : "plain"}
                                  color={canRestore ? "success" : "neutral"}>
                                  <RestoreFromTrashRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card>

        {/* Modal / Drawer crear/editar */}
        {openModal && (
          <UserFormModal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setEditingUser(null);
            }}
            onSubmit={onSubmitUser}
            initialValues={editingUser || undefined}
            ciudades={ciudades}
            supervisores={supervisores}
            saving={saving}
            onResetPassword={onResetPassword}
          />
        )}

        <UserPermissionsDrawer
          open={permDrawerOpen}
          onClose={() => {
            setPermDrawerOpen(false);
            setPermUser(null);
          }}
          user={permUser}
          onUpdateSuccess={() => {
            // Opcional: si necesitas recargar la lista de usuarios, llama a load()
            // load();
          }}
        />
      </Box>
    </Sheet>
  );
}
