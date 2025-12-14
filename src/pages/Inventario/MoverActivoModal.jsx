// src/pages/Inventario/MoverActivoModal.jsx
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";

import {
  Drawer,
  Typography,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Autocomplete,
  Sheet,
  ModalClose,
  FormHelperText,
} from "@mui/joy";

// Services
import { moverActivo } from "../../services/UbicacionesServices";
import { getBodegas } from "../../services/BodegasServices";
import { getClientes } from "../../services/ClientesServices";
import { getActiveSitesByCliente } from "../../services/SitesServices";
import { getEmpleados } from "../../services/AuthServices";

// Context
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

// Util para normalizar texto
const normalize = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// --- ESQUEMA DE VALIDACIÓN YUP ---
const validationSchema = yup.object({
  tipo_destino: yup.string().required("El tipo de destino es requerido"),
  motivo: yup.string().required("El motivo es requerido"), // Hacemos obligatorio el motivo para trazabilidad

  // Condicional: Si es Bodega, id_bodega es requerido
  id_bodega: yup.string().when("tipo_destino", {
    is: "Bodega",
    then: (schema) => schema.required("Debes seleccionar una bodega"),
    otherwise: (schema) => schema.nullable(),
  }),

  // Condicional: Si es Empleado, id_empleado es requerido
  id_empleado: yup.string().when("tipo_destino", {
    is: "Empleado",
    then: (schema) => schema.required("Debes seleccionar un empleado"),
    otherwise: (schema) => schema.nullable(),
  }),

  // Condicional: Si es Cliente, id_site es requerido
  // (Nota: id_cliente es auxiliar, lo que importa es el site)
  id_site: yup.string().when("tipo_destino", {
    is: "Cliente",
    then: (schema) => schema.required("Debes seleccionar un site"),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default function MoverActivoModal({
  open,
  onClose,
  activo,
  onSaved,
  defaultTipo = "Bodega",
  defaultClienteId = null,
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { userData } = useAuth();

  // Listas de datos
  const [clientes, setClientes] = useState([]);
  const [sites, setSites] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  // Loaders
  const [loadingBase, setLoadingBase] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  // --- FORMIK ---
  const formik = useFormik({
    initialValues: {
      tipo_destino: defaultTipo,
      id_cliente: defaultClienteId ? String(defaultClienteId) : "", // Auxiliar para cargar sites
      id_site: "",
      id_bodega: "",
      id_empleado: "",
      motivo: "",
    },
    validationSchema,
    enableReinitialize: true, // Permite reiniciar si cambian los props default
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await moverActivo({
          id_activo: activo.id,
          tipo_destino: values.tipo_destino,
          id_cliente_site:
            values.tipo_destino === "Cliente" ? values.id_site : null,
          id_bodega: values.tipo_destino === "Bodega" ? values.id_bodega : null,
          id_empleado:
            values.tipo_destino === "Empleado" ? values.id_empleado : null,
          motivo: values.motivo,
          usuario_responsable: userData?.id_usuario ?? userData?.id ?? null,
        });

        showToast(t("inventory.move.success"), "success");
        onClose?.();
        onSaved?.();
      } catch (err) {
        showToast(err?.message || t("inventory.move.errors.failed"), "danger");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- EFECTOS ---

  // 1. Cargar datos base al abrir
  useEffect(() => {
    if (open) {
      // Reset form visualmente a defaults si se reabre
      formik.resetForm({
        values: {
          tipo_destino: defaultTipo,
          id_cliente: defaultClienteId ? String(defaultClienteId) : "",
          id_site: "",
          id_bodega: "",
          id_empleado: "",
          motivo: "",
        },
      });
      loadBaseLists();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadBaseLists() {
    try {
      setLoadingBase(true);
      const [cli, bod] = await Promise.all([getClientes(), getBodegas()]);
      setClientes(Array.isArray(cli) ? cli : []);
      setBodegas(Array.isArray(bod) ? bod : []);
    } catch {
      showToast(t("inventory.move.errors.load_failed"), "danger");
    } finally {
      setLoadingBase(false);
    }
  }

  // 2. Cargar Sites cuando cambia el Cliente seleccionado
  useEffect(() => {
    const { tipo_destino, id_cliente } = formik.values;
    if (tipo_destino === "Cliente" && id_cliente) {
      setLoadingSites(true);
      getActiveSitesByCliente(id_cliente)
        .then((rows) => setSites(Array.isArray(rows) ? rows : []))
        .catch(() => setSites([]))
        .finally(() => setLoadingSites(false));
    } else {
      setSites([]);
    }
  }, [formik.values.tipo_destino, formik.values.id_cliente]);

  // 3. Cargar Empleados cuando el tipo es Empleado
  useEffect(() => {
    if (formik.values.tipo_destino === "Empleado" && open) {
      setLoadingEmpleados(true);
      getEmpleados()
        .then((rows) => setEmpleados(Array.isArray(rows) ? rows : []))
        .catch(() => setEmpleados([]))
        .finally(() => setLoadingEmpleados(false));
    }
  }, [formik.values.tipo_destino, open]);

  // 4. Limpieza de campos al cambiar Tipo de Destino
  //    (Usamos un useEffect para no ensuciar el onChange del select)
  useEffect(() => {
    const tipo = formik.values.tipo_destino;
    if (tipo === "Bodega") {
      formik.setFieldValue("id_cliente", "");
      formik.setFieldValue("id_site", "");
      formik.setFieldValue("id_empleado", "");
    } else if (tipo === "Cliente") {
      formik.setFieldValue("id_bodega", "");
      formik.setFieldValue("id_empleado", "");
    } else if (tipo === "Empleado") {
      formik.setFieldValue("id_bodega", "");
      formik.setFieldValue("id_cliente", "");
      formik.setFieldValue("id_site", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.tipo_destino]);

  // --- HELPERS PARA AUTOCOMPLETE (Values Objects) ---
  const valueBodega = useMemo(
    () =>
      bodegas.find((b) => String(b.id) === String(formik.values.id_bodega)) ||
      null,
    [bodegas, formik.values.id_bodega]
  );
  const valueCliente = useMemo(
    () =>
      clientes.find((c) => String(c.id) === String(formik.values.id_cliente)) ||
      null,
    [clientes, formik.values.id_cliente]
  );
  const valueSite = useMemo(
    () =>
      sites.find((s) => String(s.id) === String(formik.values.id_site)) || null,
    [sites, formik.values.id_site]
  );
  const valueEmpleado = useMemo(
    () =>
      empleados.find(
        (e) => String(e.id) === String(formik.values.id_empleado)
      ) || null,
    [empleados, formik.values.id_empleado]
  );

  const filterByName = (opts, { inputValue }, key = "nombre") => {
    const q = normalize(inputValue);
    return opts.filter((o) => normalize(o?.[key] || "").includes(q));
  };

  const typeOptions = [
    { value: "Bodega", label: t("inventory.move.types.warehouse") },
    { value: "Cliente", label: t("inventory.move.types.client") },
    { value: "Empleado", label: t("inventory.move.types.employee") },
  ];

  return (
    <Drawer
      anchor="right"
      size="md"
      variant="plain"
      open={open}
      onClose={() => !formik.isSubmitting && onClose()}
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
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography level="h4">{t("inventory.move.title")}</Typography>
        <ModalClose disabled={formik.isSubmitting} onClick={onClose} />
      </Stack>
      <Divider />

      <Stack
        component="form"
        onSubmit={formik.handleSubmit}
        spacing={2}
        sx={{ flex: 1, overflowY: "auto", px: 1, pt: 1 }}>
        {/* TIPO DESTINO */}
        <FormControl>
          <FormLabel>{t("inventory.move.fields.destination_type")}</FormLabel>
          <Autocomplete
            options={typeOptions}
            value={
              typeOptions.find((o) => o.value === formik.values.tipo_destino) ||
              null
            }
            onChange={(_, v) =>
              v && formik.setFieldValue("tipo_destino", v.value)
            }
            getOptionLabel={(v) => v.label}
            isOptionEqualToValue={(a, b) => a.value === b.value}
            disableClearable
            disabled={formik.isSubmitting}
          />
        </FormControl>

        {/* --- CASO BODEGA --- */}
        {formik.values.tipo_destino === "Bodega" && (
          <FormControl
            error={formik.touched.id_bodega && Boolean(formik.errors.id_bodega)}
            required>
            <FormLabel>
              {t("inventory.move.fields.destination_warehouse")}
            </FormLabel>
            <Autocomplete
              placeholder={t("common.search_placeholder")}
              options={bodegas}
              loading={loadingBase}
              value={valueBodega}
              onChange={(_, v) =>
                formik.setFieldValue("id_bodega", v?.id || "")
              }
              getOptionLabel={(o) => o?.nombre || ""}
              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
              filterOptions={(opts, state) =>
                filterByName(opts, state, "nombre")
              }
              onBlur={() => formik.setFieldTouched("id_bodega", true)}
              disabled={formik.isSubmitting}
              autoHighlight
            />
            {formik.touched.id_bodega && formik.errors.id_bodega && (
              <FormHelperText>{formik.errors.id_bodega}</FormHelperText>
            )}
          </FormControl>
        )}

        {/* --- CASO CLIENTE --- */}
        {formik.values.tipo_destino === "Cliente" && (
          <>
            <FormControl>
              <FormLabel>
                {t("inventory.move.fields.destination_client")}
              </FormLabel>
              <Autocomplete
                placeholder={t("common.search_placeholder")}
                options={clientes}
                loading={loadingBase}
                value={valueCliente}
                onChange={(_, v) => {
                  formik.setFieldValue("id_cliente", v?.id || "");
                  formik.setFieldValue("id_site", ""); // Reset site
                }}
                getOptionLabel={(o) => o?.nombre || ""}
                isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                filterOptions={(opts, state) =>
                  filterByName(opts, state, "nombre")
                }
                disabled={formik.isSubmitting}
                autoHighlight
              />
            </FormControl>

            <FormControl
              error={formik.touched.id_site && Boolean(formik.errors.id_site)}
              required>
              <FormLabel>
                {t("inventory.move.fields.destination_site")}
              </FormLabel>
              <Autocomplete
                placeholder={
                  formik.values.id_cliente
                    ? t("common.search_placeholder")
                    : t("inventory.move.hints.select_client_first")
                }
                options={sites}
                loading={loadingSites}
                value={valueSite}
                onChange={(_, v) =>
                  formik.setFieldValue("id_site", v?.id || "")
                }
                getOptionLabel={(o) => {
                  if (!o) return "";
                  const desc = (o.descripcion || "").trim();
                  return !desc || desc === "-"
                    ? o.nombre || ""
                    : `${o.nombre} - ${desc}`;
                }}
                isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                filterOptions={(opts, state) =>
                  filterByName(opts, state, "nombre")
                }
                onBlur={() => formik.setFieldTouched("id_site", true)}
                disabled={!formik.values.id_cliente || formik.isSubmitting}
                autoHighlight
              />
              {formik.touched.id_site && formik.errors.id_site && (
                <FormHelperText>{formik.errors.id_site}</FormHelperText>
              )}
            </FormControl>
          </>
        )}

        {/* --- CASO EMPLEADO --- */}
        {formik.values.tipo_destino === "Empleado" && (
          <FormControl
            error={
              formik.touched.id_empleado && Boolean(formik.errors.id_empleado)
            }
            required>
            <FormLabel>
              {t("inventory.move.fields.destination_employee")}
            </FormLabel>
            <Autocomplete
              placeholder={t("common.search_placeholder")}
              options={empleados}
              loading={loadingEmpleados}
              value={valueEmpleado}
              onChange={(_, v) =>
                formik.setFieldValue("id_empleado", v?.id || "")
              }
              getOptionLabel={(o) => {
                const parts = [
                  o?.nombre || o?.usuario_nombre || "",
                  o?.puesto ? `— ${o.puesto}` : "",
                ];
                return parts.filter(Boolean).join(" ");
              }}
              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
              filterOptions={(opts, state) => {
                const q = normalize(state.inputValue);
                return opts.filter((e) =>
                  [e?.nombre, e?.usuario_nombre, e?.puesto]
                    .filter(Boolean)
                    .map(normalize)
                    .some((t) => t.includes(q))
                );
              }}
              onBlur={() => formik.setFieldTouched("id_empleado", true)}
              disabled={formik.isSubmitting}
              autoHighlight
            />
            {formik.touched.id_empleado && formik.errors.id_empleado && (
              <FormHelperText>{formik.errors.id_empleado}</FormHelperText>
            )}
          </FormControl>
        )}

        {/* MOTIVO */}
        <FormControl
          error={formik.touched.motivo && Boolean(formik.errors.motivo)}
          required>
          <FormLabel>{t("inventory.move.fields.reason")}</FormLabel>
          <Input
            name="motivo"
            value={formik.values.motivo}
            onChange={formik.handleChange}
            onBlur={() => formik.setFieldTouched("motivo", true)} // Seguridad para Enter key
            disabled={formik.isSubmitting}
            placeholder={t("inventory.move.hints.reason_placeholder")}
          />
          {formik.touched.motivo && formik.errors.motivo && (
            <FormHelperText>{formik.errors.motivo}</FormHelperText>
          )}
        </FormControl>
      </Stack>

      {/* FOOTER */}
      <Stack direction="row" justifyContent="flex-end" spacing={1} pt={2}>
        <Button
          variant="plain"
          color="neutral"
          onClick={onClose}
          disabled={formik.isSubmitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button onClick={formik.handleSubmit} loading={formik.isSubmitting}>
          {t("common.actions.move")}
        </Button>
      </Stack>
    </Drawer>
  );
}
