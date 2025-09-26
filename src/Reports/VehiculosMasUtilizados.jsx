// src/pages/ComponentsReport/Vehiculos/VehiculosMasUtilizados.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Sheet,
  Typography,
  Table,
  Stack,
  Button,
  Input,
  CircularProgress,
  Alert,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { useNavigate, useLocation } from "react-router-dom";

import PaginationLite from "@/components/common/PaginationLite";
import { getVehiculosMasUtilizadosReport } from "@/services/ReportServices";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/utils/exporters";

/** Utils */
const debounced = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default function VehiculosMasUtilizados() {
  const navigate = useNavigate();
  const { search } = useLocation();

  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const [query, setQuery] = useState(qs.get("q") || "");
  const [page, setPage] = useState(Number(qs.get("p") || 1));
  const [rowsPerPage] = useState(10);

  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // sincroniza q/p en URL (sin recargar)
  useEffect(() => {
    const params = new URLSearchParams(search);
    query ? params.set("q", query) : params.delete("q");
    page > 1 ? params.set("p", String(page)) : params.delete("p");
    const s = params.toString();
    window.history.replaceState(null, "", s ? `?${s}` : "");
  }, [query, page, search]);

  // load
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getVehiculosMasUtilizadosReport();
        // esperamos [{ marca, modelo, placa, total_usos }]
        setRaw(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el reporte de vehículos más utilizados.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filtro
  const onChangeQuery = useRef(
    debounced((v) => {
      setPage(1);
      setQuery(v);
    }, 250)
  ).current;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter((r) => {
      return (
        String(r.marca || "")
          .toLowerCase()
          .includes(q) ||
        String(r.modelo || "")
          .toLowerCase()
          .includes(q) ||
        String(r.placa || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [raw, query]);

  // paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, pageSafe, rowsPerPage]);

  // columnas para export/pdf (usa formato de exporters.js)
  const columnsExport = [
    {
      label: "#",
      get: (_row, i) => (pageSafe - 1) * rowsPerPage + i + 1,
    },
    { label: "Marca", key: "marca" },
    { label: "Modelo", key: "modelo" },
    { label: "Placa", key: "placa" },
    { label: "Total de usos", key: "total_usos" },
  ];

  const filenameBase = `vehiculos_mas_utilizados_${new Date()
    .toISOString()
    .slice(0, 10)}`;

  const handleExportCSV = () =>
    exportToCSV({
      rows: filtered,
      columns: columnsExport,
      filename: `${filenameBase}.csv`,
    });

  const handleExportXLSX = () =>
    exportToXLSX({
      rows: filtered,
      columns: columnsExport,
      sheetName: "Vehículos",
      filename: `${filenameBase}.xlsx`,
    });

  const handleExportPDF = () =>
    exportToPDF({
      title: "Vehículos más utilizados",
      rows: filtered,
      columns: columnsExport,
      filename: `${filenameBase}.pdf`,
      landscape: true,
    });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          gap: 1,
          background:
            "linear-gradient(180deg, var(--joy-palette-background-level1), transparent 40%)",
          borderRadius: "xl",
        }}>
        <CircularProgress size="lg" />
        <Typography>Cargando reporte…</Typography>
      </Box>
    );
  }

  if (err) {
    return (
      <Alert color="danger" variant="soft">
        <Typography>{err}</Typography>
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        // Fondo decorativo suave
        background:
          "radial-gradient(1200px 200px at 50% -20%, var(--joy-palette-primary-softBg), transparent), radial-gradient(1200px 200px at 50% 120%, var(--joy-palette-neutral-softBg), transparent)",
        borderRadius: "xl",
        p: { xs: 1.5, md: 2 },
      }}>
      <Sheet
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: "xl",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
          backgroundColor: "background.body",
        }}>
        {/* Header con acciones */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              startDecorator={<ArrowBackRoundedIcon />}
              variant="soft"
              onClick={() => navigate("/admin/reports")}
              sx={{ borderRadius: "999px" }}>
              Regresar
            </Button>
            <Typography level="h3" sx={{ fontWeight: 800, ml: 0.5 }}>
              Vehículos más utilizados
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Input
              startDecorator={<SearchRoundedIcon />}
              placeholder="Buscar: marca, modelo o placa…"
              onChange={(e) => onChangeQuery(e.target.value)}
              defaultValue={query}
              sx={{ minWidth: { xs: 220, sm: 280 } }}
            />

            <Dropdown>
              <MenuButton
                variant="soft"
                endDecorator={<MoreHorizRoundedIcon />}
                sx={{ borderRadius: "999px" }}>
                Exportar
              </MenuButton>
              <Menu placement="bottom-end">
                <MenuItem onClick={handleExportCSV}>
                  <DownloadRoundedIcon />
                  CSV
                </MenuItem>
                <MenuItem onClick={handleExportXLSX}>
                  <DownloadRoundedIcon />
                  Excel (.xlsx)
                </MenuItem>
                <MenuItem onClick={handleExportPDF}>
                  <DownloadRoundedIcon />
                  PDF
                </MenuItem>
              </Menu>
            </Dropdown>
          </Stack>
        </Stack>

        {/* Tabla */}
        <Box
          sx={{
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "lg",
            overflow: "hidden",
          }}>
          <Table
            aria-label="Tabla de vehículos más utilizados"
            stickyHeader
            hoverRow
            sx={{
              "--TableCell-paddingX": "12px",
              "--TableCell-paddingY": "10px",
              "& thead th": {
                bgcolor: "background.level1",
                fontWeight: 700,
                color: "text.primary",
                borderBottom: "1px solid",
                borderColor: "divider",
              },
              "& tbody tr:nth-of-type(odd)": {
                bgcolor: "background.level2",
              },
              "& tbody td": {
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}>
            <thead>
              <tr>
                <th style={{ width: 64 }}>#</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Placa</th>
                <th style={{ textAlign: "right", width: 140 }}>
                  Total de usos
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r, i) => (
                <tr key={`${r.placa}-${i}`}>
                  <td>{(pageSafe - 1) * rowsPerPage + i + 1}</td>
                  <td>{r.marca || "—"}</td>
                  <td>{r.modelo || "—"}</td>
                  <td>{r.placa || "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {r.total_usos ?? 0}
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <Alert variant="soft" color="neutral">
                      <Typography level="body-sm">
                        No hay coincidencias para “{query}”.
                      </Typography>
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>

        {/* Footer: contador + paginación */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1.25, gap: 1 }}>
          <Typography level="body-sm" color="neutral">
            Mostrando{" "}
            <b>
              {pageItems.length} de {filtered.length}
            </b>{" "}
            registros
          </Typography>

          <PaginationLite
            page={pageSafe}
            count={totalPages}
            onChange={setPage}
            size="sm"
            showFirstLast
          />
        </Stack>
      </Sheet>
    </Box>
  );
}
