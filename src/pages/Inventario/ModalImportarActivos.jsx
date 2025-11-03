// src/pages/Inventario/ImportarActivosDrawer.jsx
import { useState, useMemo, useRef } from "react";
import {
  Drawer,
  Sheet,
  Typography,
  Divider,
  Textarea,
  Button,
  Table,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@mui/joy";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import * as XLSX from "xlsx";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createActivoEnBodega } from "../../services/ActivosBodegaServices";

export default function ImportarActivosDrawer({
  open,
  onClose,
  idBodega,
  onSaved,
}) {
  const { userData } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);

  // ---- PEGAR ----
  const [raw, setRaw] = useState("");
  const pastedRows = useMemo(
    () =>
      raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split("\t")),
    [raw]
  );

  const handleImportPasted = async () => {
    if (!pastedRows.length) {
      showToast("Pegá primero las filas 😅", "warning");
      return;
    }
    setSaving(true);
    let created = 0;
    try {
      for (const cols of pastedRows) {
        const [nombre, modelo, serial, tipo, estatus] = cols;
        if (!nombre) continue;
        await createActivoEnBodega({
          nombre: nombre.trim(),
          modelo: modelo || null,
          serial_number: serial || null,
          tipo: tipo || "Otro",
          estatus: estatus || "Activo",
          id_bodega: idBodega,
          usuario_responsable: userData?.id_usuario ?? userData?.id ?? null,
        });
        created++;
      }
      showToast(`Se importaron ${created} activos`, "success");
      onSaved?.();
      onClose?.();
      setRaw("");
    } catch (err) {
      showToast(err?.message || "Error al importar", "danger");
    } finally {
      setSaving(false);
    }
  };

  // ---- EXCEL ----
  const [fileRows, setFileRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    nombre: "",
    modelo: "",
    serial: "",
    tipo: "",
    estatus: "",
  });

  const fileInputRef = useRef(null);
  const [isOver, setIsOver] = useState(false);

  const parseExcelFile = async (file) => {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (!json.length) {
      showToast("El archivo está vacío", "warning");
      return;
    }
    const hdrs = Object.keys(json[0]);
    setHeaders(hdrs);
    setFileRows(json);

    const autoMap = (target) => {
      const lower = target.toLowerCase();
      const exact = hdrs.find((h) => h.toLowerCase() === lower);
      if (exact) return exact;
      const contains = hdrs.find((h) => h.toLowerCase().includes(lower));
      return contains || "";
    };

    setMapping({
      nombre: autoMap("nombre"),
      modelo: autoMap("modelo"),
      serial: autoMap("serie"),
      tipo: autoMap("tipo"),
      estatus: autoMap("estatus"),
    });
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await parseExcelFile(file);
    } catch (err) {
      console.error(err);
      showToast("No se pudo leer el archivo 😢", "danger");
    } finally {
      // limpiar para poder subir el mismo archivo otra vez
      e.target.value = "";
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      await parseExcelFile(file);
    } catch (err) {
      console.error(err);
      showToast("No se pudo leer el archivo 😢", "danger");
    }
  };

  const handleImportFile = async () => {
    if (!fileRows.length) {
      showToast("Subí primero un Excel 😅", "warning");
      return;
    }
    if (!mapping.nombre) {
      showToast("Mapeá al menos la columna de Nombre", "warning");
      return;
    }

    setSaving(true);
    let created = 0;
    try {
      for (const r of fileRows) {
        const nombre = (r[mapping.nombre] || "").trim();
        if (!nombre) continue;

        await createActivoEnBodega({
          nombre,
          modelo: r[mapping.modelo] || null,
          serial_number: r[mapping.serial] || null,
          tipo: r[mapping.tipo] || "Otro",
          estatus: r[mapping.estatus] || "Activo",
          id_bodega: idBodega,
          usuario_responsable: userData?.id_usuario ?? userData?.id ?? null,
        });
        created++;
      }
      showToast(`Se importaron ${created} activos`, "success");
      onSaved?.();
      onClose?.();
      setFileRows([]);
      setHeaders([]);
    } catch (err) {
      showToast(err?.message || "Error al importar Excel", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      size="200"
      sx={[
        open
          ? {
              "--Drawer-transitionDuration": "0.4s",
              "--Drawer-transitionFunction":
                "cubic-bezier(0.79,0.14,0.15,0.86)",
            }
          : {
              "--Drawer-transitionDuration": "0.2s",
              "--Drawer-transitionFunction": "cubic-bezier(0.77,0,0.18,1)",
            },
      ]}>
      <Sheet
        sx={{
          width: { xs: "100dvw", sm: 480, md: 720 },
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          height: "100dvh",
        }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography level="title-lg">Importar activos</Typography>
          <Button size="sm" variant="plain" onClick={onClose}>
            Cerrar
          </Button>
        </Stack>
        <Divider />

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <TabList>
            <Tab>Pegar</Tab>
            <Tab>Excel</Tab>
          </TabList>

          {/* TAB PEGAR */}
          <TabPanel value={0} sx={{ p: 0, pt: 1.5 }}>
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Orden esperado: <b>Nombre | Modelo | Serie | Tipo | Estatus</b>
            </Typography>
            <Textarea
              minRows={5}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              disabled={saving}
              placeholder="Impresora HP[TAB]LaserJet 2030[TAB]SN-123[TAB]Impresora[TAB]Activo"
            />

            {pastedRows.length > 0 && (
              <Table
                size="sm"
                stickyHeader
                sx={{ mt: 1, maxHeight: 240, overflow: "auto" }}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Modelo</th>
                    <th>Serie</th>
                    <th>Tipo</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {pastedRows.map((r, i) => (
                    <tr key={i}>
                      <td>{r[0] || ""}</td>
                      <td>{r[1] || ""}</td>
                      <td>{r[2] || ""}</td>
                      <td>{r[3] || "Otro"}</td>
                      <td>{r[4] || "Activo"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            <Stack direction="row" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={handleImportPasted} loading={saving}>
                Importar pegado
              </Button>
            </Stack>
          </TabPanel>

          {/* TAB EXCEL */}
          <TabPanel value={1} sx={{ p: 0, pt: 1.5 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFileChange}
              style={{ display: "none" }}
            />

            <Sheet
              variant={isOver ? "soft" : "outlined"}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOver(false);
              }}
              onDrop={handleDrop}
              sx={{
                p: 1.5,
                borderRadius: "md",
                borderStyle: "dashed",
                borderColor: isOver
                  ? "primary.outlinedColor"
                  : "neutral.outlinedBorder",
                bgcolor: isOver ? "background.level1" : "background.body",
                mb: 1.5,
              }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Button
                  size="sm"
                  variant="soft"
                  startDecorator={<UploadRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}>
                  Seleccionar archivo
                </Button>
                <Typography level="body-sm" color="neutral">
                  o arrastra tu .xlsx / .csv aquí
                </Typography>
              </Stack>
              <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.7 }}>
                Lee la primera hoja y te deja mapear columnas.
              </Typography>
            </Sheet>

            {headers.length > 0 && (
              <>
                <Typography level="body-sm">Mapea las columnas:</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  {[
                    ["nombre", "Nombre *"],
                    ["modelo", "Modelo"],
                    ["serial", "Serie"],
                    ["tipo", "Tipo"],
                    ["estatus", "Estatus"],
                  ].map(([key, label]) => (
                    <FormControl key={key} sx={{ minWidth: 140 }}>
                      <FormLabel>{label}</FormLabel>
                      <Select
                        value={mapping[key] ?? ""}
                        onChange={(_, v) =>
                          setMapping((m) => ({ ...m, [key]: v }))
                        }>
                        <Option value="">— Ninguna —</Option>
                        {headers.map((h) => (
                          <Option key={h} value={h}>
                            {h}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  ))}
                </Stack>
              </>
            )}

            {fileRows.length > 0 && (
              <Table
                size="sm"
                stickyHeader
                sx={{ maxHeight: 240, overflow: "auto" }}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Modelo</th>
                    <th>Serie</th>
                    <th>Tipo</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {fileRows.map((r, i) => (
                    <tr key={i}>
                      <td>{mapping.nombre ? r[mapping.nombre] : ""}</td>
                      <td>{mapping.modelo ? r[mapping.modelo] : ""}</td>
                      <td>{mapping.serial ? r[mapping.serial] : ""}</td>
                      <td>{mapping.tipo ? r[mapping.tipo] : "Otro"}</td>
                      <td>{mapping.estatus ? r[mapping.estatus] : "Activo"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            <Stack direction="row" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={handleImportFile} loading={saving}>
                Importar Excel
              </Button>
            </Stack>
          </TabPanel>
        </Tabs>
      </Sheet>
    </Drawer>
  );
}
