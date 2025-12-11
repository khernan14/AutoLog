import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  Stack,
  Typography,
  Divider,
  Box,
  Sheet,
  Radio,
  RadioGroup,
  Select,
  Option,
  AspectRatio,
  Tooltip,
  Button,
  Alert,
  Snackbar,
} from "@mui/joy";
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Type,
  Palette,
  LayoutTemplate,
} from "lucide-react";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { SectionHeader } from "./_shared/SectionHeader.jsx";
import { useColorScheme } from "@mui/joy/styles";
import { useAppTheme } from "@/context/AppThemeContext";
import { useSettings } from "../../../context/SettingsContext.jsx";

import PreviewPanel from "./modals/PreviewPanel.jsx";

/* ----- Constantes ----- */
const BRAND_COLORS = [
  { value: "default", label: "Azul Tecnasa", hex: "#0B6BCB" },
  { value: "indigo", label: "Índigo", hex: "#6366f1" },
  { value: "forest", label: "Bosque", hex: "#10b981" },
  { value: "teams", label: "Teams", hex: "#6264A7" },
  { value: "orange", label: "Naranja", hex: "#f97316" },
  { value: "rose", label: "Rose", hex: "#e11d48" },
  { value: "purple", label: "Purple", hex: "#a855f7" },
  { value: "cyan", label: "Cyan", hex: "#06b6d4" },
  { value: "slate", label: "Slate", hex: "#64748b" },
  { value: "neon", label: "Neon", hex: "#d946ef" },
];

const FONTS = [
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Inter, ui-sans-serif, system-ui, sans-serif", label: "Inter" },
  { value: "Roboto, system-ui, sans-serif", label: "Roboto" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
];

/* ----- Helpers ----- */
const getHex = (val) =>
  BRAND_COLORS.find((c) => c.value === val)?.hex ?? BRAND_COLORS[0].hex;

/* ----- Componente principal ----- */
export default function Apariencia({ initialData = {}, onSave }) {
  const { reload } = useSettings();
  const { mode, setMode } = useColorScheme();
  const { brand, setBrand, font, setFont } = useAppTheme();

  const [selectedFont, setSelectedFont] = useState(font);
  const [savingFont, setSavingFont] = useState(false);

  // Snackbar state
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Logs controlados: solo cuando cambia brand/font (útil en dev)
  useEffect(() => {
    console.log("AppTheme (Apariencia):", { brand, font });
  }, [brand, font]);

  // Inicialización con initialData
  useEffect(() => {
    if (initialData) {
      if (initialData.mode && initialData.mode !== mode)
        setMode(initialData.mode);
      if (initialData.brand && initialData.brand !== brand)
        setBrand(initialData.brand);
      if (initialData.font) {
        setFont(initialData.font);
        setSelectedFont(initialData.font);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  /* ---------- Handlers memoizados ---------- */
  const handleModeChange = useCallback(
    async (event) => {
      const newMode = event.target.value;
      setMode(newMode);
      try {
        await onSave({ mode: newMode });
        // setSnack({
        //   open: true,
        //   message: `Tema guardado: ${newMode}`,
        //   severity: "success",
        // });
      } catch (e) {
        console.error(e);
        setSnack({
          open: true,
          message: "Error guardando tema",
          severity: "danger",
        });
      }
    },
    [onSave, setMode]
  );

  const handleBrandChange = useCallback(
    async (newBrand) => {
      setBrand(newBrand);
      try {
        await onSave({ brand: newBrand });
        // setSnack({
        //   open: true,
        //   message: `Color guardado: ${newBrand}`,
        //   severity: "success",
        // });
      } catch (e) {
        console.error(e);
        // setSnack({
        //   open: true,
        //   message: "Error guardando color",
        //   severity: "danger",
        // });
      }
    },
    [onSave, setBrand]
  );

  const handleFontSelect = useCallback((_, newFont) => {
    if (newFont) setSelectedFont(newFont);
  }, []);

  const handleApplyFont = useCallback(async () => {
    setSavingFont(true);
    try {
      await onSave({ font: selectedFont });
      // setSnack({
      //   open: true,
      //   message: `Fuente guardada: ${selectedFont.split(",")[0]}`,
      //   severity: "success",
      // });
      // Forzar reload para aplicar la fuente globalmente
      window.location.reload();
    } catch (error) {
      console.error("Error guardando fuente:", error);
      setSavingFont(false);
      setSnack({
        open: true,
        message: "Error guardando fuente",
        severity: "danger",
      });
    }
  }, [onSave, selectedFont]);

  const hasPendingFontChange = selectedFont !== font;

  /* ---------- Memoizaciones locales ---------- */
  const brandHex = useMemo(() => getHex(brand), [brand]);
  const fontsMemo = useMemo(() => FONTS, []);
  const brandColorsMemo = useMemo(() => BRAND_COLORS, []);

  /* ---------- Helpers para accesibilidad de swatches ---------- */
  const makeOnBrandClick = useCallback(
    (value) => (e) => {
      e.preventDefault();
      handleBrandChange(value);
    },
    [handleBrandChange]
  );

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
        <SectionHeader
          title="Apariencia del Sistema"
          subtitle="Personaliza la interfaz visual para adaptarla a tus preferencias."
        />

        <Divider sx={{ my: 2 }} />

        <Box>
          {/* ------------------ COLUMNA PRINCIPAL ------------------ */}
          <Stack spacing={4}>
            {/* TEMA */}
            {/* ---------- TEMA (tarjetas estilo imagen: contorno acento, preview y accesible) ---------- */}
            <Box>
              <Typography
                level="title-md"
                mb={2}
                startDecorator={<LayoutTemplate size={20} />}>
                Tema
              </Typography>

              <RadioGroup
                orientation="horizontal"
                value={mode || "light"}
                onChange={handleModeChange}
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "stretch",
                }}>
                {[
                  {
                    value: "system",
                    label: "Sistema",
                    desc: "Se ajusta a tu dispositivo",
                    previewType: "system",
                    badge: "AUTO",
                  },
                  {
                    value: "dark",
                    label: "Modo Oscuro",
                    desc: "Ideal para poca luz",
                    previewType: "dark",
                  },
                  {
                    value: "light",
                    label: "Modo Claro",
                    desc: "Limpio y brillante",
                    previewType: "light",
                  },
                ].map((item) => {
                  const checked = mode === item.value;
                  // brandHex viene del scope superior (memoizado)
                  return (
                    <Box
                      key={item.value}
                      component="label"
                      sx={{
                        // tamaño y borde exterior con color de acento si está seleccionado
                        width: { xs: "100%", sm: 220 },
                        borderRadius: 18,
                        background: "background.surface",
                        p: 2,
                        boxShadow: checked
                          ? `0 12px 40px ${brandHex}22` // glow sutil con color de acento (22 = alpha)
                          : "0 6px 18px rgba(15,23,42,0.06)",
                        border: checked
                          ? `2px solid ${brandHex}`
                          : "1px solid transparent",
                        transition:
                          "box-shadow 160ms ease, border-color 160ms ease",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25,
                        overflow: "hidden",
                        // en dark mode no seleccionada, mostrar borde blanco sutil
                        ...(mode === "dark" && !checked
                          ? { border: "1px solid rgba(255,255,255,0.06)" }
                          : {}),
                        // evitar la animación que rompía la selección; solo ligero lift en hover
                        "&:hover": {
                          boxShadow: checked
                            ? `0 18px 48px ${brandHex}22`
                            : "0 8px 24px rgba(15,23,42,0.08)",
                        },
                        "&:focus-within": {
                          boxShadow: `0 0 0 6px ${brandHex}22`,
                        },
                        position: "relative",
                      }}>
                      {/* Radio accesible: ocupa toda la tarjeta y permite clic en cualquier parte de ella */}
                      <Radio
                        value={item.value}
                        overlay
                        disableIcon
                        sx={{
                          position: "absolute",
                          inset: 0,
                          opacity: 0,
                          zIndex: 5,
                          cursor: "pointer",
                        }}
                        aria-label={`Seleccionar tema ${item.label}`}
                      />

                      {/* Mini preview (cabecera) */}
                      <Box
                        aria-hidden
                        sx={{
                          borderRadius: 12,
                          p: 1.25,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          minHeight: 92,
                          bgcolor:
                            item.previewType === "dark"
                              ? "neutral.900"
                              : "background.body",
                        }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}>
                          {item.badge && (
                            <Box
                              sx={{
                                px: 1,
                                py: "2px",
                                borderRadius: 999,
                                bgcolor: "neutral.100",
                                fontSize: 11,
                                fontWeight: 700,
                                color: "neutral.600",
                                boxShadow: "sm",
                              }}>
                              {item.badge}
                            </Box>
                          )}
                        </Box>

                        {/* preview interior con shapes que simulan widgets */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                            justifyContent: "space-between",
                            mt: 0.5,
                          }}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.75,
                              alignItems: "center",
                            }}>
                            <Box
                              sx={{
                                width: 60,
                                height: 48,
                                borderRadius: 8,
                                bgcolor:
                                  item.previewType === "dark"
                                    ? "#0b1220"
                                    : "#f3f4f6",
                              }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 0.5,
                                  p: 1,
                                }}>
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: 6,
                                    borderRadius: 2,
                                    bgcolor:
                                      item.previewType === "dark"
                                        ? "#163026"
                                        : "#ffffff",
                                  }}
                                />
                                <Box
                                  sx={{
                                    width: "80%",
                                    height: 6,
                                    borderRadius: 2,
                                    bgcolor:
                                      item.previewType === "dark"
                                        ? "#163026"
                                        : "#ffffff",
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  bgcolor:
                                    item.previewType === "dark"
                                      ? "#143022"
                                      : "#ffffff",
                                }}
                              />
                              <Box
                                sx={{
                                  width: 36,
                                  height: 18,
                                  borderRadius: 6,
                                  bgcolor:
                                    item.previewType === "dark"
                                      ? "#0f2a18"
                                      : "#f8fafc",
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Bolita grande: usa el color de acento si está seleccionado, si no usa color por defecto */}
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              bgcolor: checked
                                ? brandHex
                                : item.previewType === "dark"
                                ? "#144122"
                                : "#34d399",
                              boxShadow: checked
                                ? `0 10px 30px ${brandHex}33`
                                : item.previewType === "dark"
                                ? "0 2px 6px rgba(0,0,0,0.5)"
                                : "0 6px 18px rgba(52,211,153,0.18)",
                              flexShrink: 0,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Pie: título, descripción y radio-indicador */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 0.5,
                        }}>
                        <Box>
                          <Typography level="body-md" fontWeight="lg">
                            {item.label}
                          </Typography>
                          <Typography level="body-xs" textColor="neutral.500">
                            {item.desc}
                          </Typography>
                        </Box>

                        {/* indicador circular */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}>
                          {!checked ? (
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                border: "2px solid",
                                borderColor: "neutral.400",
                                bgcolor: "transparent",
                                boxShadow: "none",
                              }}
                              aria-hidden
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                bgcolor: brandHex,
                                boxShadow: `0 10px 30px ${brandHex}33`,
                                border: "4px solid rgba(255,255,255,0.03)",
                                transform: "translateY(-4px)",
                              }}
                              aria-hidden>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: "white",
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </RadioGroup>
            </Box>

            {/* COLOR DE ACENTO */}
            <Box>
              <Typography
                level="title-md"
                mb={2}
                startDecorator={<Palette size={20} />}>
                Color de acento
              </Typography>

              <Stack
                direction="row"
                gap={2}
                flexWrap="wrap"
                alignItems="center">
                {brandColorsMemo.map((color) => {
                  const isSelected = brand === color.value;
                  return (
                    <Tooltip
                      key={color.value}
                      title={color.label}
                      variant="soft"
                      arrow
                      placement="top">
                      <Box
                        component="button"
                        aria-pressed={isSelected}
                        aria-label={`Seleccionar color ${color.label}`}
                        onClick={makeOnBrandClick(color.value)}
                        tabIndex={0}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: color.hex,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition:
                            "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s",
                          boxShadow: isSelected
                            ? "0 0 0 4px var(--joy-palette-background-surface), 0 0 0 6px var(--joy-palette-primary-500)"
                            : "sm",
                          border: "none",
                          "&:hover": {
                            transform: "scale(1.12)",
                            boxShadow: "md",
                          },
                          "&:active": { transform: "scale(0.96)" },
                          "&:focus": {
                            outline: "none",
                            boxShadow: "0 0 0 4px rgba(0,0,0,0.08)",
                          },
                        }}>
                        {isSelected && (
                          <Check
                            color="white"
                            strokeWidth={3}
                            size={22}
                            style={{
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Stack>
            </Box>

            {/* TIPOGRAFÍA (AHORA CON PREVIEW AL LADO DEL SELECT) */}
            <Box>
              <Typography
                level="title-md"
                mb={2}
                startDecorator={<Type size={20} />}>
                Tipografía
              </Typography>

              {/* Grid: selector + preview al lado */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 300px" },
                  gap: 2,
                  alignItems: "start",
                }}>
                {/* Columna izquierda: Select, descripción, y alerta/botón */}
                <Box>
                  <Select
                    value={selectedFont}
                    onChange={handleFontSelect}
                    size="lg"
                    variant="outlined"
                    sx={{ "&:hover": { borderColor: "neutral.400" } }}>
                    {fontsMemo.map((f) => (
                      <Option
                        key={f.value}
                        value={f.value}
                        sx={{ fontFamily: f.value }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.25,
                          }}>
                          <span style={{ fontFamily: f.value }}>{f.label}</span>
                          <small
                            style={{
                              fontSize: 12,
                              color: "var(--joy-palette-neutral-500)",
                            }}>
                            Aa — Ejemplo rápido
                          </small>
                        </Box>
                      </Option>
                    ))}
                  </Select>

                  <Typography level="body-xs" color="neutral" sx={{ mt: 1 }}>
                    Define el estilo de letra para toda la aplicación. El panel
                    a la derecha muestra una vista previa de la fuente
                    seleccionada.
                  </Typography>

                  {hasPendingFontChange && (
                    <Alert
                      variant="soft"
                      color="warning"
                      startDecorator={<InfoOutlinedIcon />}
                      sx={{ alignItems: "flex-start", gap: 2, mt: 2 }}>
                      <Box>
                        <Typography level="title-sm" color="warning">
                          Cambio pendiente
                        </Typography>
                        <Typography level="body-sm" mb={1}>
                          Es necesario reiniciar la aplicación para aplicar la
                          nueva fuente correctamente.
                        </Typography>
                        <Button
                          size="sm"
                          color="warning"
                          variant="solid"
                          startDecorator={<RestartAltRoundedIcon />}
                          onClick={handleApplyFont}
                          loading={savingFont}>
                          Aplicar y Reiniciar
                        </Button>
                      </Box>
                    </Alert>
                  )}
                </Box>

                {/* Columna derecha: Preview que usa la fuente seleccionada */}
                <Box>
                  <PreviewPanel
                    brandHex={brandHex}
                    themeMode={mode}
                    fontFamily={selectedFont}
                  />
                </Box>
              </Box>
            </Box>
          </Stack>

          {/* ------------------ COLUMNA DERECHA ORIGINAL (vacía ahora) ------------------ */}
          <Box>
            {/* Antes aquí estaba el Preview principal — ahora está pegado al select de fuentes */}
          </Box>
        </Box>
      </Card>

      {/* ------------------ SNACKBAR DE CONFIRMACIÓN ------------------ */}
      <Snackbar
        open={snack.open}
        onClose={closeSnack}
        closeButton
        placement="bottom-end"
        sx={{ zIndex: 1400 }}>
        <Alert variant="soft" color={snack.severity}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
