import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Sheet,
  CircularProgress,
} from "@mui/joy";

import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

import Swal from "sweetalert2";

import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

// 🔧 Ajusta si tu servicio tiene otros nombres
import {
  getUsers as getUsersService,
  createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  restoreUser as restoreUserService,
  getUserSupervisors,
} from "../../../services/AuthServices";
import { getCiudades } from "../../../services/RegistrosService";
import { sendMail } from "../../../services/MailServices";

import StatusCard from "../../../components/common/StatusCard";
import UserToolbar from "./UserToolbar";
import UserTable from "./UserTable";
import UserFormModal from "./UserFormModal";

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

  // ---- auth/perm ----
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
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
        getUsersService(), // 🔧 ajusta si se llama distinto
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

  const onSubmitUser = async (payload) => {
    // payload: { id_usuario?, nombre, email, username, password?, rol, puesto, id_ciudad/ciudad, supervisor_id }
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

        // Enviar correo ANTES del toast de éxito (si falla, no rompemos el flujo)
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
        {/* Toolbar */}
        <UserToolbar
          search={search}
          onSearch={setSearch}
          showInactive={showInactive}
          onToggleInactive={setShowInactive}
          onNew={onNew}
          canCreate={canCreate}
          selectedCount={selected.length}
          onBulkDelete={onBulkDelete}
          canBulkDelete={canDelete}
        />

        {/* Contenedor principal */}
        <Card
          variant="plain"
          sx={{ overflowX: "auto", width: "100%", background: "white" }}>
          {viewState !== "data" ? (
            <Box p={2}>{renderStatus()}</Box>
          ) : (
            <UserTable
              users={filtered}
              selected={selected}
              setSelected={setSelected}
              onEdit={canEdit ? onEdit : undefined}
              onDelete={canDelete ? onDelete : undefined}
              onRestore={canRestore ? onRestore : undefined}
              canEdit={canEdit}
              canDelete={canDelete}
              canRestore={canRestore}
            />
          )}
        </Card>

        {/* Modal crear/editar */}
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
          />
        )}
      </Box>
    </Sheet>
  );
}
