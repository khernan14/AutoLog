import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Stack,
  Table,
  Sheet,
  Button,
  IconButton,
  Input,
  Tooltip,
  CircularProgress,
} from "@mui/joy";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { getBodegas } from "../../services/BodegasServices";
import BodegaFormModal from "./BodegaFormModal";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import StatusCard from "../../components/common/StatusCard";
import useIsMobile from "../../hooks/useIsMobile"; // ← ajusta la ruta si es necesario

export default function BodegasList() {
  // ---- state ----
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile(768);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // ---- deps ----
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (perm) => isAdmin || hasPermiso(perm),
    [isAdmin, hasPermiso]
  );

  // Permisos
  const canView = can("ver_bodegas") || can("gestionar_bodegas");
  const canCreate = can("crear_bodegas") || can("gestionar_bodegas");
  const canEdit = can("editar_bodegas") || can("gestionar_bodegas");

  // ---- load ----
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
      const data = await getBodegas();
      if (Array.isArray(data)) setRows(data);
      else setError("No se pudieron cargar las bodegas.");
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- handlers ----
  const onNew = () => {
    if (!canCreate)
      return showToast(
        "No tienes permiso para crear bodegas. Solicítalo al administrador.",
        "warning"
      );
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (row) => {
    if (!canEdit)
      return showToast("No tienes permiso para editar bodegas.", "warning");
    setEditing(row);
    setOpenForm(true);
  };

  const clearSearch = () => setSearch("");

  // ---- filter ----
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    const src = Array.isArray(rows) ? rows : [];
    return src.filter(
      (r) =>
        (r.nombre || "").toLowerCase().includes(s) ||
        (r.ciudad || "").toLowerCase().includes(s) ||
        (r.descripcion || "").toLowerCase().includes(s)
    );
  }, [rows, search]);

  // ---- view state ----
  const viewState = checkingSession
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
          title="Sin permisos para ver bodegas"
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
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title="Sin bodegas"
          description="Aún no hay bodegas registradas."
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
      }}>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
          mb={2}>
          <Typography level="h4">Bodegas</Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Input
              placeholder="Buscar por nombre, ciudad o descripción…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                search && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={clearSearch}
                    aria-label="Limpiar búsqueda">
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ width: { xs: "100%", sm: 320 } }}
            />

            <Tooltip
              title={
                canCreate
                  ? "Crear bodega"
                  : "No tienes permiso para crear. Solicítalo al administrador."
              }
              variant="solid"
              placement="bottom-end">
              <span>
                <Button
                  startDecorator={<AddRoundedIcon />}
                  onClick={onNew}
                  disabled={!canCreate}
                  aria-disabled={!canCreate}
                  variant={canCreate ? "solid" : "soft"}
                  color={canCreate ? "primary" : "neutral"}>
                  Nueva bodega
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Contenido principal */}
        <Card
          variant="plain"
          sx={{ overflowX: "auto", width: "100%", background: "white" }}>
          {viewState !== "data" ? (
            <Box p={2}>{renderStatus()}</Box>
          ) : isMobile ? (
            // ====== MÓVIL: tarjetas ======
            <Stack spacing={2} p={2}>
              {filtered.map((r) => (
                <Sheet
                  key={r.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: "md", cursor: "pointer" }}
                  onClick={() => navigate(`${r.id}`)}>
                  <Stack spacing={1}>
                    <Typography level="title-md">{r.nombre}</Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                      {r.ciudad || "—"}
                    </Typography>
                    {r.descripcion && (
                      <Typography level="body-sm" sx={{ mt: 0.5 }}>
                        {r.descripcion}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Button
                        size="sm"
                        variant="plain"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`${r.id}`);
                        }}>
                        Ver detalle
                      </Button>

                      <Tooltip
                        title={
                          canEdit
                            ? "Editar bodega"
                            : "No tienes permiso para editar."
                        }
                        variant="soft"
                        placement="top">
                        <span>
                          {/* <IconButton
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(r);
                            }}
                            disabled={!canEdit}
                            aria-disabled={!canEdit}
                            variant={canEdit ? "soft" : "plain"}
                            color={canEdit ? "primary" : "neutral"}>
                            <EditRoundedIcon />
                          </IconButton> */}
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Sheet>
              ))}
            </Stack>
          ) : (
            // ====== ESCRITORIO: tabla ======
            <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Descripción</th>
                  <th style={{ width: 64 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`${r.id}`)}>
                    <td>{r.nombre}</td>
                    <td>{r.ciudad || "—"}</td>
                    <td>{r.descripcion || "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Tooltip
                        title={
                          canEdit
                            ? "Editar bodega"
                            : "No tienes permiso para editar."
                        }
                        variant="soft"
                        placement="left">
                        <span>
                          <IconButton
                            onClick={() => onEdit(r)}
                            disabled={!canEdit}
                            aria-disabled={!canEdit}
                            variant={canEdit ? "soft" : "plain"}
                            color={canEdit ? "primary" : "neutral"}>
                            <EditRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* Modal crear/editar */}
        {openForm && (
          <BodegaFormModal
            open={openForm}
            onClose={() => setOpenForm(false)}
            editing={editing}
            onSaved={() => {
              setOpenForm(false);
              setEditing(null);
              load();
            }}
          />
        )}
      </Box>
    </Sheet>
  );
}
