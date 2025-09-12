import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Card, Typography, Stack, Button, Sheet, CircularProgress,
} from "@mui/joy";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Swal from "sweetalert2";

import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

import {
  getCountries,
  addCountry,
  updateCountry,
  deleteCountry,
} from "../../../services/LocationServices";

// Ajusta la ruta si tu StatusCard vive en otro lugar
import StatusCard from "../../../components/common/StatusCard";

import CountriesTable from "../../../components/Administration/Locations/Countries/CountriesTable";
import CountriesModal from "../../../components/Administration/Locations/Countries/CountriesModal";
import CountriesToolBar from "../../../components/Administration/Locations/Countries/CountriesToolBar";

export default function Countries() {
  // ---- state ----
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [editCountry, setEditCountry] = useState(null);

  const [search, setSearch] = useState("");

  // ---- auth/perm ----
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback((perm) => isAdmin || hasPermiso(perm), [isAdmin, hasPermiso]);

  // Fallbacks por ausencia de eliminar_paises en tu DB
  const canView = can("ver_paises");
  const canCreate = can("crear_paises");
  const canEdit = can("editar_paises");
  const canDelete = can("eliminar_paises") || canEdit;

  // ---- toast ----
  const { showToast } = useToast();

  // ---- load ----
  const loadCountries = useCallback(async () => {
    if (checkingSession) { setLoading(true); return; }

    if (!canView) {
      setError(null);  // dejemos a la tarjeta de "sin permisos" encargarse del mensaje
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCountries();
      if (Array.isArray(data)) {
        setCountries(data);
      } else {
        setError("No se pudieron cargar los países.");
      }
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setError(/failed to fetch|network/i.test(msg) ? "No hay conexión con el servidor." : msg);
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView]);

  useEffect(() => { loadCountries(); }, [loadCountries]);

  // ---- actions ----
  const onNew = () => {
    if (!canCreate) {
      showToast("No tienes permiso para crear países. Solicítalo al administrador.", "warning");
      return;
    }
    setEditCountry(null);
    setOpenModal(true);
  };

  const onEdit = (country) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar países.", "warning");
      return;
    }
    setEditCountry(country);
    setOpenModal(true);
  };

  const onDelete = async (id) => {
    if (!canDelete) {
      showToast("No tienes permiso para eliminar países.", "warning");
      return;
    }
    const res = await Swal.fire({
      title: "¿Eliminar país?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!res.isConfirmed) return;

    try {
      const r = await deleteCountry(id);
      if (r && !r.error) {
        setCountries((prev) => prev.filter((c) => c.id !== id));
        showToast("País eliminado correctamente", "success");
      } else {
        showToast("Error al eliminar el país.", "danger");
      }
    } catch {
      showToast("Error de conexión al intentar eliminar el país.", "danger");
    }
  };

  const onSubmitCountry = async (payload) => {
    const nombre = payload?.nombre?.trim();
    if (!nombre) return showToast("El nombre del país es obligatorio", "warning");

    // crear
    if (!payload?.id) {
      if (!canCreate) return showToast("No tienes permiso para crear países.", "warning");
      try {
        const r = await addCountry({ nombre });
        if (r && !r.error) {
          showToast("País agregado correctamente", "success");
          setOpenModal(false);
          setEditCountry(null);
          loadCountries();
        } else {
          showToast("Error al agregar el país.", "danger");
        }
      } catch {
        showToast("Error de conexión al guardar el país.", "danger");
      }
      return;
    }

    // actualizar
    if (!canEdit) return showToast("No tienes permiso para editar países.", "warning");
    try {
      const r = await updateCountry(payload.id, { id: payload.id, nombre });
      if (r && !r.error) {
        showToast("País actualizado correctamente", "success");
        setOpenModal(false);
        setEditCountry(null);
        loadCountries();
      } else {
        showToast("Error al actualizar el país.", "danger");
      }
    } catch {
      showToast("Error de conexión al actualizar el país.", "danger");
    }
  };

  // ---- filtered ----
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    return (Array.isArray(countries) ? countries : []).filter((c) =>
      (c?.nombre || "").toLowerCase().includes(s)
    );
  }, [countries, search]);

  // ---- view state ----
  const viewState =
    checkingSession
      ? "checking"
      : !canView
        ? "no-permission"
        : error
          ? "error"
          : !loading && filtered.length === 0
            ? "empty"
            : loading
              ? "loading"
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
          title="Sin permisos para ver países"
          description="Consulta con un administrador para obtener acceso."
        />
      );
    }
    if (viewState === "error") {
      const isNetwork = /conexión|failed to fetch/i.test(error || "");
      return (
        <StatusCard
          color={isNetwork ? "warning" : "danger"}
          icon={isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />}
          title={isNetwork ? "Problema de conexión" : "No se pudo cargar la lista"}
          description={error}
          actions={
            <Button startDecorator={<RestartAltRoundedIcon />} onClick={loadCountries} variant="soft">
              Reintentar
            </Button>
          }
        />
      );
    }
    if (viewState === "empty") {
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title="Sin países"
          description="Aún no hay países registrados."
        />
      );
    }
    if (viewState === "loading") {
      return (
        <Sheet p={3} sx={{ textAlign: "center" }}>
          <Stack spacing={1} alignItems="center">
            <CircularProgress />
            <Typography level="body-sm">Cargando…</Typography>
          </Stack>
        </Sheet>
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
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <CountriesToolBar
          onSearch={(text) => setSearch(text)}
          onAdd={onNew}
          canAdd={canCreate}
        />

        {/* Contenedor principal */}
        <Card variant="plain" sx={{ overflowX: "auto", width: "100%", background: "white" }}>
          {viewState !== "data" ? (
            <Box p={2}>{renderStatus()}</Box>
          ) : (
            <CountriesTable
              countries={filtered}
              onEdit={canEdit ? onEdit : undefined}
              onDelete={canDelete ? onDelete : undefined}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </Card>

        {/* Modal crear/editar */}
        {openModal && (
          <CountriesModal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setEditCountry(null);
            }}
            initialValues={editCountry || undefined}
            onSubmit={onSubmitCountry}
          />
        )}
      </Box>
    </Sheet>
  );
}
