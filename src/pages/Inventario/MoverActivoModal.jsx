import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Autocomplete,
  Drawer,
  Sheet,
  ModalClose,
} from "@mui/joy";
import { moverActivo } from "../../services/UbicacionesServices";
import { getBodegas } from "../../services/BodegasServices";
import { getClientes } from "../../services/ClientesServices";
import { getActiveSitesByCliente } from "../../services/SitesServices";
import { getEmpleados } from "../../services/AuthServices";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

// util para buscar sin acentos/diacríticos y sin mayúsculas
const normalize = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function MoverActivoModal({
  open,
  onClose,
  activo,
  onSaved,
  defaultTipo = "Bodega",
  defaultClienteId = null,
}) {
  const { showToast } = useToast();
  const { userData } = useAuth();

  // const [tipoDestino, setTipoDestino] = useState("Bodega");
  const [tipoDestino, setTipoDestino] = useState(defaultTipo);
  const [clienteDestino, setClienteDestino] = useState(defaultClienteId || "");

  const [clientes, setClientes] = useState([]);
  const [sites, setSites] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  // const [clienteDestino, setClienteDestino] = useState("");
  const [siteDestino, setSiteDestino] = useState(""); // guarda id
  const [bodegaDestino, setBodegaDestino] = useState(""); // guarda id
  const [empleadoDestino, setEmpleadoDestino] = useState(""); // guarda id
  const [motivo, setMotivo] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingBodegas, setLoadingBodegas] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  useEffect(() => {
    if (open) {
      loadBaseLists();
      setTipoDestino(defaultTipo);
      setClienteDestino(defaultClienteId || "");
      setSiteDestino("");
      setBodegaDestino("");
      setEmpleadoDestino("");
      setMotivo("");
    }
  }, [open, defaultTipo, defaultClienteId]);

  async function loadBaseLists() {
    try {
      setLoadingClientes(true);
      setLoadingBodegas(true);
      const [cli, bod] = await Promise.all([getClientes(), getBodegas()]);
      setClientes(Array.isArray(cli) ? cli : []);
      setBodegas(Array.isArray(bod) ? bod : []);
    } catch {
      showToast("Error al cargar clientes/bodegas", "danger");
    } finally {
      setLoadingClientes(false);
      setLoadingBodegas(false);
    }
  }

  // Cargar sites al elegir cliente
  useEffect(() => {
    if (tipoDestino === "Cliente" && clienteDestino) {
      setLoadingSites(true);
      getActiveSitesByCliente(clienteDestino)
        .then((rows) => setSites(Array.isArray(rows) ? rows : []))
        .catch(() => setSites([]))
        .finally(() => setLoadingSites(false));
    } else {
      setSites([]);
    }
  }, [tipoDestino, clienteDestino]);

  // Cargar empleados solo cuando se elige "Empleado"
  useEffect(() => {
    if (tipoDestino !== "Empleado" || !open) return;
    setLoadingEmpleados(true);
    getEmpleados()
      .then((rows) => setEmpleados(Array.isArray(rows) ? rows : []))
      .catch(() => {
        setEmpleados([]);
        showToast("Error al cargar empleados", "danger");
      })
      .finally(() => setLoadingEmpleados(false));
  }, [tipoDestino, open, showToast]);

  function resetForm() {
    setTipoDestino("Bodega");
    setClienteDestino("");
    setSiteDestino("");
    setBodegaDestino("");
    setEmpleadoDestino("");
    setMotivo("");
  }

  // limpiar campos al cambiar el tipo
  useEffect(() => {
    if (tipoDestino === "Bodega") {
      setClienteDestino("");
      setSiteDestino("");
      setEmpleadoDestino("");
    } else if (tipoDestino === "Cliente") {
      setBodegaDestino("");
      setEmpleadoDestino("");
    } else if (tipoDestino === "Empleado") {
      setClienteDestino("");
      setSiteDestino("");
      setBodegaDestino("");
    }
  }, [tipoDestino]);

  // helpers para encontrar el "value" del Autocomplete (obj completo desde el id)
  const valueCliente = useMemo(
    () => clientes.find((c) => c.id === clienteDestino) || null,
    [clientes, clienteDestino]
  );
  const valueSite = useMemo(
    () => sites.find((s) => s.id === siteDestino) || null,
    [sites, siteDestino]
  );
  const valueBodega = useMemo(
    () => bodegas.find((b) => b.id === bodegaDestino) || null,
    [bodegas, bodegaDestino]
  );
  const valueEmpleado = useMemo(
    () => empleados.find((e) => e.id === empleadoDestino) || null,
    [empleados, empleadoDestino]
  );

  // filtros insensibles a acentos (Autocomplete ya filtra, pero esto mejora)
  const filterByName = (optArray, inputValue, key = "nombre") => {
    const q = normalize(inputValue);
    if (!q) return optArray;
    return optArray.filter((o) => normalize(o?.[key] || "").includes(q));
  };

  function isValid() {
    if (tipoDestino === "Bodega") return !!bodegaDestino;
    if (tipoDestino === "Cliente") return !!clienteDestino && !!siteDestino;
    if (tipoDestino === "Empleado") return !!empleadoDestino;
    return false;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!isValid()) {
      showToast("Completa los campos requeridos según el destino", "warning");
      return;
    }
    setSaving(true);
    try {
      await moverActivo({
        id_activo: activo.id,
        tipo_destino: tipoDestino,
        id_cliente_site: tipoDestino === "Cliente" ? siteDestino : null,
        id_bodega: tipoDestino === "Bodega" ? bodegaDestino : null,
        id_empleado: tipoDestino === "Empleado" ? empleadoDestino : null,
        motivo,
        usuario_responsable: userData?.id_usuario ?? userData?.id ?? null,
      });
      showToast("Activo movido correctamente", "success");
      onClose?.();
      onSaved?.();
    } catch (err) {
      showToast(err?.message || "Error al mover activo", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      anchor="right"
      size="md"
      variant="plain"
      open={open}
      onClose={onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: "transparent",
            p: { md: 3, sm: 0 },
            boxShadow: "none",
          },
        },
      }}>
      <Sheet
        sx={{
          borderRadius: "md",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
          overflow: "auto",
          width: { xs: "100%", sm: 520 },
        }}>
        <Typography level="title-lg">Mover Activo</Typography>
        <ModalClose />
        <Divider />
        <Stack spacing={1.5} mt={1}>
          {/* Tipo destino */}
          <FormControl required>
            <FormLabel>Tipo destino</FormLabel>
            <Autocomplete
              options={["Bodega", "Cliente", "Empleado"]}
              value={tipoDestino}
              onChange={(_, v) => v && setTipoDestino(v)}
              getOptionLabel={(v) => v}
              isOptionEqualToValue={(a, b) => a === b}
              disabled={saving}
              disablePortal
              slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
            />
          </FormControl>

          {/* Bodega */}
          {tipoDestino === "Bodega" && (
            <FormControl required>
              <FormLabel>Bodega destino</FormLabel>
              <Autocomplete
                placeholder="Escribe para buscar bodega…"
                options={bodegas}
                loading={loadingBodegas}
                value={valueBodega}
                onChange={(_, v) => setBodegaDestino(v?.id || "")}
                getOptionLabel={(o) => o?.nombre || ""}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                filterOptions={(opts, state) =>
                  filterByName(opts, state.inputValue, "nombre")
                }
                disabled={saving}
                disablePortal
                clearOnBlur={false}
                autoHighlight
                renderInput={(params) => <Input {...params} />}
                slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
              />
            </FormControl>
          )}

          {/* Cliente + Site */}
          {tipoDestino === "Cliente" && (
            <>
              <FormControl required>
                <FormLabel>Cliente destino</FormLabel>
                <Autocomplete
                  placeholder="Escribe para buscar cliente…"
                  options={clientes}
                  loading={loadingClientes}
                  value={valueCliente}
                  onChange={(_, v) => {
                    setClienteDestino(v?.id || "");
                    setSiteDestino("");
                  }}
                  getOptionLabel={(o) => o?.nombre || ""}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  filterOptions={(opts, state) =>
                    filterByName(opts, state.inputValue, "nombre")
                  }
                  disabled={saving}
                  disablePortal
                  clearOnBlur={false}
                  autoHighlight
                  renderInput={(params) => <Input {...params} />}
                  slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Site destino</FormLabel>
                <Autocomplete
                  placeholder={
                    clienteDestino
                      ? "Escribe para buscar site…"
                      : "Selecciona un cliente primero"
                  }
                  options={sites}
                  loading={loadingSites}
                  value={valueSite}
                  onChange={(_, v) => setSiteDestino(v?.id || "")}
                  getOptionLabel={(o) => {
                    if (!o) return "";
                    const desc = (o.descripcion || "").trim();

                    // Si la descripción está vacía o es solo "-"
                    if (!desc || desc === "-") {
                      return o.nombre || "";
                    }

                    return `${o.nombre} - ${desc}`;
                  }}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  filterOptions={(opts, state) =>
                    filterByName(opts, state.inputValue, "nombre")
                  }
                  disabled={!clienteDestino || saving}
                  disablePortal
                  clearOnBlur={false}
                  autoHighlight
                  renderInput={(params) => <Input {...params} />}
                  slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
                />
              </FormControl>
            </>
          )}

          {/* Empleado */}
          {tipoDestino === "Empleado" && (
            <FormControl required>
              <FormLabel>Empleado destino</FormLabel>
              <Autocomplete
                placeholder="Escribe para buscar empleado…"
                options={empleados}
                loading={loadingEmpleados}
                value={valueEmpleado}
                onChange={(_, v) => setEmpleadoDestino(v?.id || "")}
                getOptionLabel={(o) =>
                  [
                    o?.nombre || o?.usuario_nombre || "",
                    o?.puesto ? `— ${o.puesto}` : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                isOptionEqualToValue={(o, v) => o.id === v.id}
                filterOptions={(opts, state) => {
                  const q = normalize(state.inputValue);
                  return opts.filter((e) =>
                    [e?.nombre, e?.usuario_nombre, e?.puesto]
                      .filter(Boolean)
                      .map(normalize)
                      .some((t) => t.includes(q))
                  );
                }}
                disabled={saving}
                disablePortal
                clearOnBlur={false}
                autoHighlight
                renderInput={(params) => <Input {...params} />}
                slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
              />
            </FormControl>
          )}

          <FormControl required>
            <FormLabel>Motivo</FormLabel>
            <Input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={saving}
              placeholder="(ej: Cambio de equipo / salida del cliente)"
            />
          </FormControl>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button variant="plain" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            disabled={saving || !isValid()}>
            Mover
          </Button>
        </Stack>
      </Sheet>
    </Drawer>
  );
}
