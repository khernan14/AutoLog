// src/pages/Configuracion/Usuarios/Users.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 👈 i18n
import Swal from "sweetalert2";

import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Sheet,
  Table,
  IconButton,
  Checkbox,
  Chip,
  Tooltip,
  Input,
  Switch,
  CircularProgress,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Divider,
} from "@mui/joy";

// Iconos
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import SecurityRoundedIcon from "@mui/icons-material/Security";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded"; // Icono empty
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";

// Context & Services
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  getUsers as getUsersService,
  createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  restoreUser as restoreUserService,
  getUserSupervisors,
} from "@/services/AuthServices";
import { getCiudades } from "@/services/RegistrosService";
import { sendMail, sendRecoveryPassword } from "@/services/MailServices";

// Componentes
import StatusCard from "@/components/common/StatusCard";
import UserFormModal from "@/components/Users/UserForm/UserFormModal";
import UserPermissionsDrawer from "@/components/Users/Permissions/UserPermissionsDrawer";
import useRowFocusHighlight from "@/hooks/useRowFocusHighlight";

// Normalizador
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function Users() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userData, checkingSession, hasPermiso } = useAuth();

  // --- Permisos ---
  const isAdmin = (userData?.rol || "").toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_usuarios");
  const canCreate = can("crear_usuario");
  const canEdit = can("editar_usuario");
  const canDelete = can("eliminar_usuario");
  const canRestore = can("restaurar_usuario");
  const canAssignPerms = isAdmin || can("asignar_permisos");

  // --- Estado ---
  const [users, setUsers] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [supervisores, setSupervisores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selected, setSelected] = useState([]);

  // Modales
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [permDrawerOpen, setPermDrawerOpen] = useState(false);
  const [permUser, setPermUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- Carga ---
  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canView) {
      setError(null);
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
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("users.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, t]);

  useEffect(() => {
    load();
  }, [load]);

  // --- Helper ---
  const getCiudadNombre = useCallback(
    (id) => ciudades.find((c) => String(c.id) === String(id))?.nombre || "",
    [ciudades]
  );

  // --- Filtrado ---
  const filtered = useMemo(() => {
    const s = normalize(search);
    return users.filter((u) => {
      const matchesStatus = showInactive
        ? true
        : (u.estatus || "Activo") === "Activo";
      const text = normalize(
        `${u.nombre} ${u.email} ${u.username} ${u.rol} ${u.puesto} ${u.ciudad}`
      );
      return matchesStatus && text.includes(s);
    });
  }, [users, showInactive, search]);

  // --- Highlight ---
  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: filtered,
    matchRow: (u, token) =>
      String(u.id_usuario) === token ||
      normalize(u.username) === normalize(token),
    getRowId: (u) => u.id_usuario,
    highlightMs: 4000,
  });

  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });
    setSearch("");
    setShowInactive(true);
    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // --- Selección ---
  const allIds = useMemo(() => filtered.map((u) => u.id_usuario), [filtered]);
  const allSelectedInPage =
    allIds.length > 0 && allIds.every((id) => selected.includes(id));

  const toggleSelectOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      if (allSelectedInPage) return prev.filter((id) => !allIds.includes(id));
      const set = new Set(prev);
      allIds.forEach((id) => set.add(id));
      return Array.from(set);
    });
  };

  // --- Acciones ---
  const onNew = () => {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditingUser(null);
    setOpenModal(true);
  };

  const onEdit = (user) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditingUser({
      ...user,
      ciudad: String(user.id_ciudad ?? user.ciudad),
      supervisor_id: user.supervisor_id ? String(user.supervisor_id) : "",
    });
    setOpenModal(true);
  };

  const onDelete = async (id) => {
    if (!canDelete) return showToast(t("common.no_permission"), "warning");

    const res = await Swal.fire({
      title: t("users.actions.confirm_deactivate"),
      text: t("users.actions.deactivate_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: t("common.actions.cancel"),
      confirmButtonText: t("common.actions.deactivate"),
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
        showToast(t("users.success.deactivated"), "success");
      } else {
        showToast(t("users.errors.deactivate_failed"), "danger");
      }
    } catch {
      showToast(t("common.network_error"), "danger");
    }
  };

  const onRestore = async (id) => {
    if (!canRestore) return showToast(t("common.no_permission"), "warning");

    const res = await Swal.fire({
      title: t("users.actions.confirm_restore"),
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonText: t("common.actions.cancel"),
      confirmButtonText: t("common.actions.restore"),
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
        showToast(t("users.success.restored"), "success");
      } else {
        showToast(t("users.errors.restore_failed"), "danger");
      }
    } catch {
      showToast(t("common.network_error"), "danger");
    }
  };

  const onBulkDelete = async () => {
    if (!canDelete) return showToast(t("common.no_permission"), "warning");
    if (!selected.length) return;

    const res = await Swal.fire({
      title: t("users.actions.confirm_bulk_deactivate"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: t("common.actions.cancel"),
      confirmButtonText: t("common.actions.deactivate"),
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
      showToast(t("users.success.bulk_deactivated"), "success");
    } catch {
      showToast(t("users.errors.bulk_failed"), "danger");
    }
  };

  const onResetPassword = async (email) => {
    if (!email) return showToast(t("users.errors.no_email"), "warning");

    const res = await Swal.fire({
      title: t("users.actions.confirm_reset_pass"),
      text: t("users.actions.reset_pass_warning", { email }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.actions.send"),
      cancelButtonText: t("common.actions.cancel"),
    });

    if (!res.isConfirmed) return;

    try {
      await sendRecoveryPassword(email);
      showToast(t("users.success.reset_pass_sent"), "success");
    } catch {
      showToast(t("users.errors.reset_pass_failed"), "danger");
    }
  };

  const onSubmitUser = async (payload) => {
    if (payload?.id_usuario && !canEdit)
      return showToast(t("common.no_permission"), "warning");
    if (!payload?.id_usuario && !canCreate)
      return showToast(t("common.no_permission"), "warning");

    setSaving(true);
    try {
      if (payload?.id_usuario) {
        // Update
        const r = await updateUserService(payload);
        if (!r || r.error) throw new Error(r?.error);
        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === payload.id_usuario
              ? { ...u, ...payload, ciudad: getCiudadNombre(payload.id_ciudad) }
              : u
          )
        );
        showToast(t("users.success.updated"), "success");
      } else {
        // Create
        const r = await createUserService(payload);
        if (!r || r.error) throw new Error(r?.error);
        const newUser = {
          ...r,
          ...payload,
          ciudad: getCiudadNombre(payload.id_ciudad),
        };

        try {
          await sendMail({
            to: newUser.email,
            nombre: newUser.nombre,
            usuario: newUser.username,
            password: r.password || payload.password,
          });
        } catch {
          showToast(t("users.warnings.email_failed"), "warning");
        }
        setUsers((prev) => [...prev, newUser]);
        showToast(t("users.success.created"), "success");
      }
      setOpenModal(false);
      setEditingUser(null);
    } catch (err) {
      showToast(err?.message || t("users.errors.save_failed"), "danger");
    } finally {
      setSaving(false);
    }
  };

  // --- Render Status ---
  const viewState = checkingSession
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
    if (viewState === "checking")
      return (
        <StatusCard
          icon={<HourglassEmptyRoundedIcon />}
          title={t("common.verifying_session")}
          description={<CircularProgress size="sm" />}
        />
      );
    if (viewState === "no-permission")
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title={t("common.no_permission")}
          description={t("common.contact_admin")}
        />
      );
    if (viewState === "error")
      return (
        <StatusCard
          color="danger"
          icon={<ErrorOutlineRoundedIcon />}
          title={t("common.error_title")}
          description={error}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={load}
              variant="soft">
              {t("common.retry")}
            </Button>
          }
        />
      );
    // if (viewState === "empty")
    //   return (
    //     <StatusCard
    //       color="neutral"
    //       icon={<PeopleRoundedIcon />}
    //       title={t("users.empty.title")}
    //       description={t("users.empty.desc")}
    //     />
    //   );
    if (viewState === "loading")
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    return null;
  };

  return (
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
        pb: 4,
        px: { xs: 2, md: 4 },
        minHeight: "100dvh",
        bgcolor: "background.body",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <Box sx={{ width: "100%", maxWidth: 1400 }}>
        {/* HEADER */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          mb={3}>
          <Box>
            <Typography level="h3" fontWeight="lg">
              {t("users.title")}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {t("users.subtitle")}
            </Typography>
            <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.7 }}>
              {t("users.stats", {
                filtered: filtered.length,
                total: users.length,
              })}
            </Typography>
          </Box>

          {/* TOOLBAR */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap">
            <Input
              placeholder={t("users.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                search && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    onClick={() => setSearch("")}>
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ width: { xs: "100%", sm: 260 } }}
            />

            <Tooltip title={t("users.tooltips.show_inactive")} variant="soft">
              <Sheet
                variant="outlined"
                sx={{
                  borderRadius: "lg",
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                <Switch
                  size="sm"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
                <Typography level="body-xs">
                  {t("users.labels.inactive")}
                </Typography>
              </Sheet>
            </Tooltip>

            {selected.length > 0 && canDelete && (
              <Button
                color="danger"
                variant="soft"
                startDecorator={<DeleteForeverRoundedIcon />}
                onClick={onBulkDelete}>
                {t("common.actions.deactivate_selected", {
                  count: selected.length,
                })}
              </Button>
            )}

            {canCreate && (
              <Button
                startDecorator={<AddRoundedIcon />}
                onClick={onNew}
                variant="solid"
                color="primary">
                {t("users.actions.new")}
              </Button>
            )}
          </Stack>
        </Stack>

        {/* DATA TABLE */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "lg",
            overflow: "hidden",
            bgcolor: "background.surface",
            minHeight: "auto",
          }}>
          {filtered.length === 0 && (
            <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
              <Typography level="h4" color="neutral">
                🔍 {t("common.no_data_title")}
              </Typography>
              <Typography level="body-md">
                {t("common.no_data_desc")}
              </Typography>
              <Button
                variant="soft"
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearch("");
                }}>
                {t("common.clear_filters")}
              </Button>
            </Box>
          )}
          {viewState !== "data" ? (
            <Box p={4} display="flex" justifyContent="center">
              {renderStatus()}
            </Box>
          ) : (
            <Table
              stickyHeader
              hoverRow
              sx={{
                "--TableCell-paddingX": "16px",
                "--TableCell-paddingY": "12px",
                "& thead th": {
                  bgcolor: "background.level1",
                  color: "text.tertiary",
                  fontWeight: "md",
                  textTransform: "uppercase",
                  fontSize: "xs",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                },
              }}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: "center" }}>
                    <Checkbox
                      checked={allSelectedInPage}
                      indeterminate={!allSelectedInPage && selected.length > 0}
                      onChange={toggleSelectAllVisible}
                    />
                  </th>
                  <th>{t("users.columns.name")}</th>
                  <th>{t("users.columns.username")}</th>
                  <th>{t("users.columns.email")}</th>
                  <th>{t("users.columns.role")}</th>
                  <th>{t("users.columns.city")}</th>
                  <th>{t("users.columns.status")}</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isInactive = u.estatus !== "Activo";
                  const isHighlighted = u.id_usuario === highlightId;
                  return (
                    <tr
                      key={u.id_usuario}
                      ref={isHighlighted ? focusedRef : null}
                      style={
                        isHighlighted
                          ? { backgroundColor: "var(--joy-palette-primary-50)" }
                          : undefined
                      }>
                      <td style={{ textAlign: "center" }}>
                        <Checkbox
                          checked={selected.includes(u.id_usuario)}
                          onChange={() => toggleSelectOne(u.id_usuario)}
                        />
                      </td>
                      <td>
                        <Typography fontWeight="md">
                          {u.nombre || "—"}
                        </Typography>
                      </td>
                      <td>{u.username || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>{u.rol || "—"}</td>
                      <td>{u.ciudad || "—"}</td>
                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={isInactive ? "neutral" : "success"}>
                          {u.estatus || "Activo"}
                        </Chip>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Dropdown>
                          <MenuButton
                            slots={{ root: IconButton }}
                            slotProps={{
                              root: {
                                variant: "plain",
                                color: "neutral",
                                size: "sm",
                              },
                            }}>
                            <MoreVertRoundedIcon />
                          </MenuButton>
                          <Menu placement="bottom-end" size="sm">
                            {canEdit && (
                              <MenuItem onClick={() => onEdit(u)}>
                                <EditRoundedIcon /> {t("common.actions.edit")}
                              </MenuItem>
                            )}
                            {canAssignPerms && (
                              <MenuItem
                                onClick={() => {
                                  setPermUser(u);
                                  setPermDrawerOpen(true);
                                }}>
                                <SecurityRoundedIcon />{" "}
                                {t("users.actions.permissions")}
                              </MenuItem>
                            )}
                            {canEdit && (
                              <MenuItem
                                onClick={() => onResetPassword(u.email)}>
                                <LockResetRoundedIcon />{" "}
                                {t("users.actions.reset_pass")}
                              </MenuItem>
                            )}
                            <Divider />
                            {!isInactive
                              ? canDelete && (
                                  <MenuItem
                                    onClick={() => onDelete(u.id_usuario)}
                                    color="danger">
                                    <DeleteForeverRoundedIcon />{" "}
                                    {t("common.actions.deactivate")}
                                  </MenuItem>
                                )
                              : canRestore && (
                                  <MenuItem
                                    onClick={() => onRestore(u.id_usuario)}
                                    color="success">
                                    <RestoreFromTrashRoundedIcon />{" "}
                                    {t("common.actions.restore")}
                                  </MenuItem>
                                )}
                          </Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Sheet>

        {/* Modales */}
        {openModal && (
          <UserFormModal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setEditingUser(null);
            }}
            onSubmit={onSubmitUser}
            initialValues={editingUser}
            ciudades={ciudades}
            supervisores={supervisores}
            saving={saving}
          />
        )}

        <UserPermissionsDrawer
          open={permDrawerOpen}
          onClose={() => {
            setPermDrawerOpen(false);
            setPermUser(null);
          }}
          user={permUser}
        />
      </Box>
    </Sheet>
  );
}
