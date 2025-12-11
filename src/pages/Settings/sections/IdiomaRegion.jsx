import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Stack,
  Typography,
  Divider,
  Box,
  Select,
  Option,
  RadioGroup,
  Sheet,
  Radio,
  FormControl,
  FormLabel,
  Snackbar,
  Alert,
  Chip,
} from "@mui/joy";
import { Globe, Clock, Calendar, Check, MapPin, Languages } from "lucide-react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

/* ----- Constantes ----- */
const LANGUAGES = [
  { code: "es-HN", label: "Español (Honduras)", flag: "🇭🇳" },
  { code: "es-MX", label: "Español (Latinoamérica)", flag: "🇲🇽" },
  { code: "en-US", label: "English (United States)", flag: "🇺🇸" },
];

const TIMEZONES = [
  {
    value: "America/Tegucigalpa",
    label: "(GMT-06:00) Tegucigalpa, Centroamérica",
  },
  { value: "America/Mexico_City", label: "(GMT-06:00) Ciudad de México" },
  { value: "America/Bogota", label: "(GMT-05:00) Bogotá, Lima, Quito" },
  {
    value: "America/New_York",
    label: "(GMT-05:00) Hora del Este (EE. UU. y Canadá)",
  },
  { value: "UTC", label: "(GMT+00:00) UTC Tiempo Universal Coordinado" },
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "31/12/2025" },
  { value: "MM/DD/YYYY", label: "12/31/2025" },
  { value: "YYYY-MM-DD", label: "2025-12-31" },
];

/* ----- Helper de Formato (Preview) ----- */
const formatPreview = (dateFormat, timeFormat, locale, timezone) => {
  const now = new Date();

  // Opciones base para Intl.DateTimeFormat
  const optsDate = { timeZone: timezone };
  const optsTime = { timeZone: timezone, hour: "numeric", minute: "2-digit" };

  if (timeFormat === "12h") optsTime.hour12 = true;
  if (timeFormat === "24h") optsTime.hour12 = false;

  // Formatear Fecha (Aproximación manual para coincidir con el string DD/MM/YYYY)
  // Intl es bueno pero a veces restrictivo con el orden exacto, así que lo armamos:
  const day = now.toLocaleString(locale, { ...optsDate, day: "2-digit" });
  const month = now.toLocaleString(locale, { ...optsDate, month: "2-digit" });
  const year = now.toLocaleString(locale, { ...optsDate, year: "numeric" });

  let dateStr = "";
  if (dateFormat === "DD/MM/YYYY") dateStr = `${day}/${month}/${year}`;
  else if (dateFormat === "MM/DD/YYYY") dateStr = `${month}/${day}/${year}`;
  else if (dateFormat === "YYYY-MM-DD") dateStr = `${year}-${month}-${day}`;

  // Formatear Hora
  const timeStr = now.toLocaleString(locale, optsTime);

  return { dateStr, timeStr };
};

export default function IdiomaRegion({ initialData = {}, onSave }) {
  // Estado local del formulario
  const [form, setForm] = useState({
    language: "es-HN",
    timezone: "America/Tegucigalpa",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
  });

  const [snack, setSnack] = useState({ open: false });

  // Sincronizar DB -> Estado Local
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm((prev) => ({
        language: initialData.language || prev.language,
        timezone: initialData.timezone || prev.timezone,
        dateFormat: initialData.dateFormat || prev.dateFormat,
        timeFormat: initialData.timeFormat || prev.timeFormat,
      }));
    }
  }, [initialData]);

  // Handler genérico de cambio y guardado
  const handleChange = async (key, value) => {
    if (!value) return;

    // 1. Actualizar visualmente
    setForm((prev) => ({ ...prev, [key]: value }));

    // 2. Guardar en DB
    try {
      await onSave({ [key]: value });
      // setSnack({ open: true }); // Opcional: mostrar snackbar en cada cambio
    } catch (error) {
      console.error(`Error guardando ${key}:`, error);
    }
  };

  // Calcular preview en vivo
  const preview = useMemo(
    () =>
      formatPreview(
        form.dateFormat,
        form.timeFormat,
        form.language,
        form.timezone
      ),
    [form]
  );

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm", p: 3 }}>
        <SectionHeader
          title="Idioma y Región"
          subtitle="Ajusta las preferencias de localización, formatos de fecha y zona horaria."
        />
        <Divider sx={{ my: 2 }} />

        <Stack spacing={4}>
          {/* --- BLOQUE 1: IDIOMA Y ZONA --- */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}>
            {/* Idioma */}
            <FormControl>
              <FormLabel sx={{ mb: 1 }}>
                <Languages size={18} style={{ marginRight: 8 }} /> Idioma
              </FormLabel>
              <Select
                value={form.language}
                onChange={(_, val) => handleChange("language", val)}
                size="lg"
                variant="outlined">
                {LANGUAGES.map((lang) => (
                  <Option key={lang.code} value={lang.code}>
                    <Box component="span" sx={{ mr: 1.5, fontSize: "1.2em" }}>
                      {lang.flag}
                    </Box>
                    {lang.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Zona Horaria */}
            <FormControl>
              <FormLabel sx={{ mb: 1 }}>
                <MapPin size={18} style={{ marginRight: 8 }} /> Zona Horaria
              </FormLabel>
              <Select
                value={form.timezone}
                onChange={(_, val) => handleChange("timezone", val)}
                size="lg"
                variant="outlined">
                {TIMEZONES.map((tz) => (
                  <Option key={tz.value} value={tz.value}>
                    {tz.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* --- BLOQUE 2: FORMATOS DE FECHA Y HORA --- */}
          <Box>
            <Typography
              level="title-md"
              startDecorator={<Calendar size={20} />}
              mb={2}>
              Formatos Regionales
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                gap: 4,
              }}>
              {/* Controles Izquierda */}
              <Stack spacing={3}>
                {/* Formato de Fecha */}
                <FormControl>
                  <FormLabel
                    sx={{
                      fontSize: "xs",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                    Fecha
                  </FormLabel>
                  <Select
                    value={form.dateFormat}
                    onChange={(_, val) => handleChange("dateFormat", val)}
                    sx={{ width: "100%", maxWidth: 300 }}>
                    {DATE_FORMATS.map((fmt) => (
                      <Option key={fmt.value} value={fmt.value}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}>
                          <span>{fmt.value}</span>
                          <Typography level="body-xs" color="neutral">
                            Ej: {fmt.label}
                          </Typography>
                        </Box>
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                {/* Formato de Hora (Tarjetas) */}
                <FormControl>
                  <FormLabel
                    sx={{
                      fontSize: "xs",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      mb: 1.5,
                    }}>
                    Hora
                  </FormLabel>
                  <RadioGroup
                    orientation="horizontal"
                    value={form.timeFormat}
                    onChange={(e) => handleChange("timeFormat", e.target.value)}
                    sx={{ gap: 2 }}>
                    {["12h", "24h"].map((fmt) => {
                      const checked = form.timeFormat === fmt;
                      return (
                        <Sheet
                          key={fmt}
                          variant={checked ? "soft" : "outlined"}
                          color={checked ? "primary" : "neutral"}
                          sx={{
                            p: 1.5,
                            borderRadius: "md",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            border: checked ? "2px solid" : "1px solid",
                            borderColor: checked ? "primary.500" : "divider",
                            transition: "all 0.2s",
                            "&:hover": { bgcolor: "background.level1" },
                          }}>
                          <Radio
                            value={fmt}
                            overlay
                            disableIcon
                            sx={{ position: "absolute", inset: 0 }}
                          />
                          <Clock size={20} />
                          <Box>
                            <Typography level="title-sm">
                              {fmt === "12h" ? "12 Horas" : "24 Horas"}
                            </Typography>
                            <Typography level="body-xs">
                              {fmt === "12h" ? "02:30 PM" : "14:30"}
                            </Typography>
                          </Box>
                          {checked && (
                            <Check
                              size={16}
                              className="ml-2 text-primary-600"
                            />
                          )}
                        </Sheet>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              </Stack>

              {/* Preview Panel (Derecha) */}
              <Sheet
                variant="soft"
                color="neutral"
                sx={{
                  p: 3,
                  borderRadius: "lg",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "neutral.300",
                }}>
                <Typography
                  level="body-xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="1px">
                  Vista Previa
                </Typography>

                <Typography level="h2" sx={{ fontFamily: "monospace", mt: 1 }}>
                  {preview.timeStr}
                </Typography>

                <Chip variant="outlined" color="neutral" size="lg">
                  {preview.dateStr}
                </Chip>

                <Typography level="body-xs" mt={2} sx={{ maxWidth: 200 }}>
                  Así se mostrarán las fechas y horas en tus reportes y
                  dashboard.
                </Typography>
              </Sheet>
            </Box>
          </Box>
        </Stack>
      </Card>

      <Snackbar
        open={snack.open}
        onClose={() => setSnack({ open: false })}
        autoHideDuration={2000}
        color="success"
        variant="soft"
        startDecorator={<CheckCircleRoundedIcon />}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        Configuración guardada
      </Snackbar>
    </Stack>
  );
}
