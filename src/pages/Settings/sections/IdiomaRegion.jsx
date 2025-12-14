import React, { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  Button,
  CircularProgress,
} from "@mui/joy";
import { Clock, Calendar, Check, MapPin, Languages } from "lucide-react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";

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

/* ----- Helper: Intl Preview ----- */
const formatPreview = (dateFormat, timeFormat, locale, timezone) => {
  const now = new Date();

  const timeOptions = {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  };

  const datePartsOptions = {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  try {
    const timeStr = new Intl.DateTimeFormat(locale, timeOptions).format(now);
    const parts = new Intl.DateTimeFormat(
      locale,
      datePartsOptions
    ).formatToParts(now);
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const day = map.day ?? "31";
    const month = map.month ?? "12";
    const year = map.year ?? "2025";

    let dateStr = "";
    if (dateFormat === "DD/MM/YYYY") dateStr = `${day}/${month}/${year}`;
    else if (dateFormat === "MM/DD/YYYY") dateStr = `${month}/${day}/${year}`;
    else if (dateFormat === "YYYY-MM-DD") dateStr = `${year}-${month}-${day}`;
    else dateStr = `${day}/${month}/${year}`;

    return { dateStr, timeStr };
  } catch (err) {
    return { dateStr: "--/--/----", timeStr: "--:--" };
  }
};

/* ----- TimeOption ----- */
// Ahora acepta "label" como prop para recibir el texto traducido desde el padre
function TimeOption({ value, checked, example, label, onSelect }) {
  return (
    <Sheet
      component="button"
      type="button"
      onClick={() => onSelect(value)}
      variant={checked ? "soft" : "outlined"}
      sx={{
        p: 1.5,
        borderRadius: "md",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: checked ? "2px solid" : "1px solid",
        borderColor: checked ? "primary.500" : "divider",
        transition: "transform .12s, box-shadow .12s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "sm" },
        position: "relative",
        textAlign: "left",
      }}
      aria-pressed={checked}>
      <Radio
        value={value}
        checked={checked}
        aria-hidden
        sx={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0,
        }}
      />
      <Clock size={20} style={{ marginLeft: 8 }} />
      <Box sx={{ ml: 1 }}>
        <Typography level="title-sm">{label}</Typography>
        <Typography level="body-xs">{example}</Typography>
      </Box>
      {checked && <Check size={16} style={{ marginLeft: "auto" }} />}
    </Sheet>
  );
}

/* ----- Componente Principal ----- */
export default function IdiomaRegion({ initialData = {}, onSave }) {
  const { t } = useTranslation(); // 👈 Hook

  const [form, setForm] = useState({
    language: "es-HN",
    timezone: "America/Tegucigalpa",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
  });

  const [selectedLanguage, setSelectedLanguage] = useState("es-HN");
  const [savingLanguage, setSavingLanguage] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const saveTimersRef = useRef({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const newData = {
        language: initialData.language || "es-HN",
        timezone: initialData.timezone || "America/Tegucigalpa",
        dateFormat: initialData.dateFormat || "DD/MM/YYYY",
        timeFormat: initialData.timeFormat || "12h",
      };
      setForm(newData);
      setSelectedLanguage(newData.language);
    }
  }, [initialData]);

  const handleChange = (key, value) => {
    if (value === undefined || value === null) return;

    setForm((prev) => ({ ...prev, [key]: value }));

    if (saveTimersRef.current[key]) {
      clearTimeout(saveTimersRef.current[key]);
    }

    saveTimersRef.current[key] = setTimeout(async () => {
      try {
        if (onSave) {
          await onSave({ [key]: value });
          // setSnack({
          //   open: true,
          //   severity: "success",
          //   message: t("settings.region.success_save"),
          // });
        }
      } catch (error) {
        console.error(`Error guardando ${key}:`, error);
        setSnack({
          open: true,
          severity: "error",
          message: t("settings.region.error_save"),
        });
      } finally {
        delete saveTimersRef.current[key];
      }
    }, 450);
  };

  const handleLanguageSelect = (_, newValue) => {
    if (newValue) setSelectedLanguage(newValue);
  };

  const handleApplyLanguage = async () => {
    setSavingLanguage(true);
    try {
      if (onSave) await onSave({ language: selectedLanguage });

      const i18n = (window && window.i18n) || null;
      if (i18n && typeof i18n.changeLanguage === "function") {
        await i18n.changeLanguage(selectedLanguage);
        setForm((prev) => ({ ...prev, language: selectedLanguage }));
        setSnack({
          open: true,
          severity: "success",
          message: t("settings.region.language.success"),
        });
      } else {
        setSnack({
          open: true,
          severity: "info",
          message: t("settings.region.language.manual_reload"),
        });
      }
    } catch (error) {
      console.error("Error guardando idioma:", error);
      setSnack({
        open: true,
        severity: "error",
        message: t("settings.region.language.error"),
      });
    } finally {
      setSavingLanguage(false);
    }
  };

  const hasPendingLangChange = selectedLanguage !== form.language;

  const preview = useMemo(
    () =>
      formatPreview(
        form.dateFormat,
        form.timeFormat,
        selectedLanguage,
        form.timezone
      ),
    [form.dateFormat, form.timeFormat, form.timezone, selectedLanguage]
  );

  const previewAria = `${preview.timeStr} — ${preview.dateStr}`;

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm", p: 3 }}>
        <SectionHeader
          title={t("settings.region.title")}
          subtitle={t("settings.region.subtitle")}
        />
        <Divider sx={{ my: 2 }} />

        <Stack spacing={4}>
          {/* BLOQUE 1: IDIOMA Y ZONA */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              alignItems: "start",
            }}>
            {/* Idioma */}
            <FormControl>
              <FormLabel sx={{ mb: 1 }}>
                <Languages size={18} style={{ marginRight: 8 }} />{" "}
                {t("settings.region.language.label")}
              </FormLabel>

              <Select
                value={selectedLanguage}
                onChange={handleLanguageSelect}
                size="lg"
                variant="outlined"
                aria-label={t("settings.region.language.label")}>
                {LANGUAGES.map((lang) => (
                  <Option key={lang.code} value={lang.code}>
                    <Box component="span" sx={{ mr: 1.5, fontSize: "1.2em" }}>
                      {lang.flag}
                    </Box>
                    {lang.label}
                  </Option>
                ))}
              </Select>

              {/* Alerta de Recarga / Aplicar */}
              {hasPendingLangChange && (
                <Alert
                  variant="soft"
                  color="warning"
                  startDecorator={<InfoOutlinedIcon />}
                  sx={{ alignItems: "flex-start", gap: 2, mt: 2 }}
                  role="status">
                  <Box>
                    <Typography level="title-sm" color="warning">
                      {t("settings.region.language.alert_title")}
                    </Typography>
                    <Typography level="body-sm" mb={1.5}>
                      {t("settings.region.language.alert_desc")}
                    </Typography>
                    <Button
                      size="sm"
                      color="warning"
                      variant="solid"
                      startDecorator={<RestartAltRoundedIcon />}
                      onClick={handleApplyLanguage}
                      loading={savingLanguage}
                      aria-label={t("settings.region.language.apply_btn")}>
                      {t("settings.region.language.apply_btn")}
                    </Button>
                  </Box>
                </Alert>
              )}
            </FormControl>

            {/* Zona Horaria */}
            <FormControl>
              <FormLabel sx={{ mb: 1 }}>
                <MapPin size={18} style={{ marginRight: 8 }} />{" "}
                {t("settings.region.timezone.label")}
              </FormLabel>
              <Select
                value={form.timezone}
                onChange={(_, val) => handleChange("timezone", val)}
                size="lg"
                variant="outlined"
                aria-label={t("settings.region.timezone.label")}>
                {TIMEZONES.map((tz) => (
                  <Option key={tz.value} value={tz.value}>
                    {tz.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* BLOQUE 2: FORMATOS DE FECHA Y HORA */}
          <Box>
            <Typography
              level="title-md"
              startDecorator={<Calendar size={20} />}
              mb={2}>
              {t("settings.region.formats.title")}
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
                    {t("settings.region.formats.date_label")}
                  </FormLabel>
                  <Select
                    value={form.dateFormat}
                    onChange={(_, val) => handleChange("dateFormat", val)}
                    sx={{ width: "100%", maxWidth: 360 }}
                    aria-label={t("settings.region.formats.date_label")}>
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
                            {t("common.example_short")}: {fmt.label}
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
                    {t("settings.region.formats.time_label")}
                  </FormLabel>

                  <RadioGroup
                    orientation="horizontal"
                    value={form.timeFormat}
                    onChange={(e) => handleChange("timeFormat", e.target.value)}
                    sx={{ gap: 2 }}
                    aria-label={t("settings.region.formats.time_label")}>
                    {["12h", "24h"].map((fmt) => {
                      const checked = form.timeFormat === fmt;
                      return (
                        <TimeOption
                          key={fmt}
                          value={fmt}
                          checked={checked}
                          label={
                            fmt === "12h"
                              ? t("settings.region.formats.12h")
                              : t("settings.region.formats.24h")
                          }
                          example={fmt === "12h" ? "02:30 PM" : "14:30"}
                          onSelect={(v) => handleChange("timeFormat", v)}
                        />
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
                }}
                role="region"
                aria-live="polite"
                aria-label={t("settings.region.preview.title")}>
                <Typography
                  level="body-xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="1px">
                  {t("settings.region.preview.title")}
                </Typography>

                <Typography level="h2" sx={{ fontFamily: "monospace", mt: 1 }}>
                  {preview.timeStr}
                </Typography>

                <Chip variant="outlined" color="neutral" size="lg" aria-hidden>
                  {preview.dateStr}
                </Chip>

                <Typography level="body-xs" mt={2} sx={{ maxWidth: 240 }}>
                  {t("settings.region.preview.desc")}
                </Typography>

                <Typography
                  component="span"
                  sx={{ position: "absolute", left: -9999 }}
                  aria-hidden={false}>
                  {previewAria}
                </Typography>
              </Sheet>
            </Box>
          </Box>
        </Stack>
      </Card>

      <Snackbar
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert
          startDecorator={<CheckCircleRoundedIcon />}
          variant="soft"
          color={
            snack.severity === "error"
              ? "danger"
              : snack.severity === "info"
              ? "neutral"
              : "success"
          }
          onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
