// src/pages/Clientes/ClientesList.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Box,
  Typography,
  Stack,
  Button,
  Table,
  Sheet,
  Input,
  Chip,
  Drawer,
  FormControl,
  FormLabel,
  Select,
  Option,
  Divider,
  Avatar,
  Tooltip,
  ModalClose,
  IconButton,
  CircularProgress,
} from "@mui/joy";

// Iconos
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"; // Nuevo icono para acciones

// Context & Hooks
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import useIsMobile from "../../hooks/useIsMobile";
import usePermissions from "../../hooks/usePermissions";
import { getViewState } from "../../utils/viewState";
import ResourceState from "../../components/common/ResourceState";

// Services
import {
  getClientes,
  createCliente,
} from "../../services/ClientesServices.jsx";

const ESTATUS = ["Activo", "Inactivo"];

export default function ClientesList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    estatus: "Activo",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [sortKey, setSortKey] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");

  const isMobile = useIsMobile(768);
  const { showToast } = useToast();
  const { checkingSession } = useAuth();
  const searchInputRef = useRef(null);

  const { canAny } = usePermissions();
  const canView = canAny("ver_companias");
  const canCreate = canAny("crear_companias");

  // --- LOGICA DE CARGA (Igual que antes) ---
  const loadClientes = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canView) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getClientes();
      if (data) setRows(data);
      else setError(t("clients.errors.load_failed"));
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, t]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  // --- LOGICA FORMULARIO (Igual que antes) ---
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  // Atajos
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || e.target.isContentEditable;
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (!isTyping && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (
        !isTyping &&
        ctrlOrMeta &&
        e.shiftKey &&
        e.key.toLowerCase() === "n"
      ) {
        e.preventDefault();
        if (canCreate) newCliente();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [canCreate]);

  function newCliente() {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setForm({ codigo: "", nombre: "", descripcion: "", estatus: "Activo" });
    setLogoFile(null);
    setLogoPreview(null);
    setOpen(true);
  }

  function onLogoChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type))
      return showToast(t("clients.errors.image_only"), "warning");
    if (f.size > 2 * 1024 * 1024)
      return showToast(t("clients.errors.image_size"), "warning");
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    if (!form.codigo.trim())
      return showToast(t("clients.errors.code_required"), "warning");
    if (!form.nombre.trim())
      return showToast(t("clients.errors.name_required"), "warning");

    setSaving(true);
    try {
      await createCliente(form, logoFile);
      showToast(t("clients.success.created"), "success");
      setOpen(false);
      loadClientes();
    } catch (err) {
      showToast(err?.message || t("clients.errors.create_failed"), "danger");
    } finally {
      setSaving(false);
    }
  }

  // --- FILTROS Y ORDEN ---
  const filtered = useMemo(() => {
    const src = Array.isArray(rows) ? rows : [];
    const q = (search || "").trim().toLowerCase();
    return src.filter((r) => {
      const matchSearch =
        !q ||
        (r.codigo || "").toLowerCase().includes(q) ||
        (r.nombre || "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "todos" ? true : r.estatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const sortedRows = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = (a?.[sortKey] ?? "").toString().toLowerCase();
      const vb = (b?.[sortKey] ?? "").toString().toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key) => {
    if (!key) return;
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const viewState = getViewState({
    checkingSession,
    canView,
    error,
    loading,
    hasData: Array.isArray(sortedRows) && sortedRows.length > 0,
  });

  // --- RENDER ---
  return (
    <Box
      component="main"
      sx={{
        px: { xs: 2, md: 4 },
        pt: 3,
        pb: 8,
        maxWidth: 1200,
        mx: "auto",
        minHeight: "100vh",
      }}>
      {/* HEADER SECTION */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}>
        <Box>
          <Typography
            level="body-sm"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "text.tertiary",
            }}>
            {t("clients.module_name")}
          </Typography>
          <Typography
            level="h2"
            sx={{ fontSize: "1.75rem", fontWeight: "xl", mt: 0.5 }}>
            {t("clients.title")}
          </Typography>
          <Typography level="body-sm" color="neutral" sx={{ mt: 0.5 }}>
            {t("common.showing_results", {
              count: sortedRows.length,
              total: rows.length,
            })}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap">
          <Input
            placeholder={t("clients.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startDecorator={<SearchRoundedIcon />}
            endDecorator={
              search && (
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => setSearch("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )
            }
            sx={{ minWidth: { xs: "100%", md: 260 } }}
            inputRef={searchInputRef}
          />

          <Select
            value={statusFilter}
            onChange={(_, v) => setStatusFilter(v || "todos")}
            sx={{ minWidth: 140 }}>
            <Option value="todos">{t("common.status.all")}</Option>
            <Option value="Activo">{t("common.status.active")}</Option>
            <Option value="Inactivo">{t("common.status.inactive")}</Option>
          </Select>

          {canCreate && (
            <Button
              startDecorator={<AddRoundedIcon />}
              onClick={newCliente}
              variant="solid"
              color="primary">
              {t("clients.actions.new")}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* 🟢 TABLA MODERNA */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          overflow: "hidden", // Recorta bordes
          bgcolor: "background.surface",
          minHeight: 400,
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
        }}>
        {viewState !== "data" ? (
          <Box p={4} display="flex" justifyContent="center">
            <ResourceState
              state={viewState}
              error={error}
              onRetry={loadClientes}
              emptyIcon={
                <BusinessRoundedIcon
                  sx={{ fontSize: 48, color: "neutral.300" }}
                />
              }
              emptyTitle={t("clients.empty.title")}
              emptyDescription={t("clients.empty.desc")}
            />
          </Box>
        ) : isMobile ? (
          // MÓVIL (Cards)
          <Stack spacing={2} p={2}>
            {sortedRows.map((r) => (
              <Card key={r.id} variant="outlined" sx={{ boxShadow: "none" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={r.logo_url} size="lg" variant="rounded">
                    {r.nombre?.[0]}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography level="title-md" noWrap>
                      {r.nombre}
                    </Typography>
                    <Typography level="body-xs" color="neutral">
                      {r.codigo}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Chip
                    size="sm"
                    variant="soft"
                    color={r.estatus === "Activo" ? "success" : "neutral"}>
                    {r.estatus === "Activo"
                      ? t("common.status.active")
                      : t("common.status.inactive")}
                  </Chip>
                  <Button
                    size="sm"
                    variant="plain"
                    component={Link}
                    to={`/admin/clientes/${r.id}/informacion`}>
                    {t("common.actions.view_details")}
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          // ESCRITORIO (Tabla Rediseñada)
          <Table
            hoverRow
            stickyHeader
            sx={{
              // 1. Padding amplio para que respire
              "--TableCell-paddingX": "24px",
              "--TableCell-paddingY": "16px",

              // 2. Encabezados sutiles y modernos
              "& thead th": {
                bgcolor: "background.surface", // Mismo color de fondo para que se vea limpio
                color: "text.tertiary",
                fontWeight: "md",
                textTransform: "uppercase",
                fontSize: "xs",
                letterSpacing: "0.08em",
                borderBottom: "1px solid",
                borderColor: "divider",
              },

              // 3. Filas
              "& tbody tr": {
                transition: "background-color 0.2s",
              },
              "& tbody tr:hover": {
                bgcolor: "background.level1", // Hover suave
                cursor: "pointer",
              },

              // 4. Quitar bordes verticales para look limpio
              "& tbody td": {
                borderBottom: "1px solid",
                borderColor: "neutral.outlinedBorder",
              },
              // Quitar el borde de la última fila
              "& tbody tr:last-child td": {
                borderBottom: "none",
              },
            }}>
            <thead>
              <tr>
                {/* Columnas definidas manualmente para mejor control */}
                <th style={{ width: "35%" }}>
                  <Link
                    component="button"
                    underline="none"
                    color="neutral"
                    fontWeight="inherit"
                    onClick={() => handleSort("nombre")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      "&:hover": { color: "text.primary" },
                    }}>
                    {t("clients.columns.name")} / {t("clients.columns.logo")}
                    <ArrowDropDownIcon
                      sx={{
                        opacity: sortKey === "nombre" ? 1 : 0,
                        transition: "0.2s",
                        transform:
                          sortKey === "nombre" && sortDir === "desc"
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  </Link>
                </th>
                <th style={{ width: "15%" }}>
                  <Link
                    component="button"
                    underline="none"
                    color="neutral"
                    fontWeight="inherit"
                    onClick={() => handleSort("codigo")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      "&:hover": { color: "text.primary" },
                    }}>
                    {t("clients.columns.code")}
                    <ArrowDropDownIcon
                      sx={{
                        opacity: sortKey === "codigo" ? 1 : 0,
                        transition: "0.2s",
                        transform:
                          sortKey === "codigo" && sortDir === "desc"
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  </Link>
                </th>
                <th style={{ width: "30%" }}>
                  {t("clients.columns.description")}
                </th>
                <th style={{ width: "10%" }}>
                  <Link
                    component="button"
                    underline="none"
                    color="neutral"
                    fontWeight="inherit"
                    onClick={() => handleSort("estatus")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      "&:hover": { color: "text.primary" },
                    }}>
                    {t("clients.columns.status")}
                    <ArrowDropDownIcon
                      sx={{
                        opacity: sortKey === "estatus" ? 1 : 0,
                        transition: "0.2s",
                        transform:
                          sortKey === "estatus" && sortDir === "desc"
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  </Link>
                </th>
                <th style={{ width: "10%" }}></th> {/* Acciones */}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r) => (
                <tr
                  key={r.id}
                  onClick={(e) => {
                    // Navegación programática al hacer clic en la fila (excepto si clica un botón interno)
                    if (!e.target.closest("button") && !e.target.closest("a")) {
                      // Simulamos click en el link invisible o usamos navigate
                      // navigate(`/admin/clientes/${r.id}/informacion`) // Si tuvieras navigate importado
                    }
                  }}>
                  {/* Columna 1: Avatar + Nombre (Combinados para diseño moderno) */}
                  <td>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={r.logo_url}
                        variant="rounded"
                        size="sm"
                        sx={{ borderRadius: "md", boxShadow: "sm" }}>
                        {r.nombre?.[0]}
                      </Avatar>
                      <Box>
                        <Typography
                          fontWeight="lg"
                          level="title-sm"
                          component={Link}
                          to={`/admin/clientes/${r.id}/informacion`}
                          sx={{
                            textDecoration: "none",
                            color: "text.primary",
                            "&:hover": { color: "primary.500" },
                          }}>
                          {r.nombre}
                        </Typography>
                      </Box>
                    </Box>
                  </td>

                  {/* Columna 2: Código */}
                  <td>
                    <Typography
                      level="body-sm"
                      sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                      {r.codigo}
                    </Typography>
                  </td>

                  {/* Columna 3: Descripción */}
                  <td>
                    <Typography
                      level="body-sm"
                      color="neutral"
                      noWrap
                      sx={{ maxWidth: 300 }}>
                      {r.descripcion || "—"}
                    </Typography>
                  </td>

                  {/* Columna 4: Estatus */}
                  <td>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={r.estatus === "Activo" ? "success" : "neutral"}
                      startDecorator={
                        r.estatus === "Activo" ? (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "success.500",
                            }}
                          />
                        ) : null
                      }>
                      {r.estatus === "Activo"
                        ? t("common.status.active")
                        : t("common.status.inactive")}
                    </Chip>
                  </td>

                  {/* Columna 5: Acciones rápidas */}
                  <td style={{ textAlign: "right" }}>
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="neutral"
                      component={Link}
                      to={`/admin/clientes/${r.id}/informacion`}>
                      <MoreHorizRoundedIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Sheet>

      {/* DRAWER DE CREACIÓN */}
      <Drawer
        open={open}
        onClose={() => !saving && setOpen(false)}
        anchor="right"
        size="sm"
        slotProps={{
          content: {
            sx: {
              bgcolor: "background.surface",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              boxShadow: "xl",
            },
          },
        }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between">
          <Typography level="h4">{t("clients.create_title")}</Typography>
          <ModalClose onClick={() => setOpen(false)} />
        </Stack>
        <Divider />

        <Stack
          component="form"
          onSubmit={onSubmit}
          spacing={2.5}
          sx={{ flex: 1, overflowY: "auto", px: 1, pt: 1 }}>
          <FormControl required>
            <FormLabel>{t("clients.form.code")}</FormLabel>
            <Input
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              disabled={saving}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>{t("clients.form.name")}</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              disabled={saving}
            />
          </FormControl>
          <FormControl>
            <FormLabel>{t("clients.form.description")}</FormLabel>
            <Input
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              disabled={saving}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>{t("clients.form.status")}</FormLabel>
            <Select
              value={form.estatus}
              onChange={(_, v) => setForm({ ...form, estatus: v })}>
              <Option value="Activo">{t("common.status.active")}</Option>
              <Option value="Inactivo">{t("common.status.inactive")}</Option>
            </Select>
          </FormControl>

          <Box
            sx={{
              p: 2,
              border: "1px dashed",
              borderColor: "neutral.outlinedBorder",
              borderRadius: "md",
            }}>
            <FormLabel sx={{ mb: 1.5 }}>{t("clients.form.logo")}</FormLabel>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={logoPreview} size="lg" variant="rounded" />
              <Stack>
                <Button component="label" variant="soft" size="sm">
                  {t("common.actions.upload")}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={onLogoChange}
                  />
                </Button>
                {logoPreview && (
                  <Button
                    variant="plain"
                    color="danger"
                    size="sm"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    sx={{ mt: 1 }}>
                    {t("common.actions.remove")}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1} pt={2}>
          <Button
            variant="plain"
            color="neutral"
            onClick={() => setOpen(false)}
            disabled={saving}>
            {t("common.actions.cancel")}
          </Button>
          <Button onClick={onSubmit} loading={saving}>
            {t("common.actions.save")}
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
