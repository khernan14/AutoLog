// src/pages/Settings/sections/Accesibilidad.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  Stack,
  Typography,
  Switch,
  Slider,
  Divider,
  Button,
  List,
  ListItem,
  ListItemDecorator,
  ListItemContent,
} from "@mui/joy";

import { SectionHeader } from "./_shared/SectionHeader.jsx";

// Iconos
import FormatSizeRoundedIcon from "@mui/icons-material/FormatSizeRounded";
import ContrastRoundedIcon from "@mui/icons-material/ContrastRounded";
import AnimationRoundedIcon from "@mui/icons-material/AnimationRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

export default function Accesibilidad({ initialData, onSave, saving }) {
  const { t } = useTranslation();

  const [baseState, setBaseState] = useState({
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
  });

  const [form, setForm] = useState({
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
  });

  useEffect(() => {
    if (initialData) {
      const data = {
        fontSize: initialData.fontSize || "medium",
        reducedMotion: initialData.reducedMotion || false,
        highContrast: initialData.highContrast || false,
      };
      setBaseState(data);
      setForm(data);
    }
  }, [initialData]);

  // Preview en tiempo real
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (form.fontSize === "small") html.style.fontSize = "90%";
    else if (form.fontSize === "large") html.style.fontSize = "110%";
    else html.style.fontSize = "100%";

    if (form.reducedMotion) body.classList.add("reduce-motion");
    else body.classList.remove("reduce-motion");

    if (form.highContrast) body.classList.add("high-contrast");
    else body.classList.remove("high-contrast");
  }, [form]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(baseState) !== JSON.stringify(form);
  }, [baseState, form]);

  const handleFontChange = (event, newValue) => {
    const sizes = ["small", "medium", "large"];
    setForm((prev) => ({ ...prev, fontSize: sizes[newValue] }));
  };

  const getSliderValue = () => {
    const map = { small: 0, medium: 1, large: 2 };
    return map[form.fontSize] ?? 1;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveClick = async () => {
    await onSave(form);
    setBaseState(form);
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
        <SectionHeader
          title={t("settings.accessibility.title")}
          subtitle={t("settings.accessibility.subtitle")}
        />

        <List sx={{ "--ListItem-paddingY": "1rem" }}>
          {/* ITEM 1: TAMAÑO DE TEXTO (SLIDER) */}
          <ListItem
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "start", sm: "center" },
              gap: 2,
            }}>
            <ListItemDecorator
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
              <FormatSizeRoundedIcon fontSize="large" />
            </ListItemDecorator>

            <ListItemContent sx={{ flex: 1 }}>
              <Typography level="title-sm">
                {t("settings.accessibility.font_size")}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {t("settings.accessibility.font_size_desc")}
              </Typography>
            </ListItemContent>

            {/* Slider container */}
            <Box
              sx={{
                width: { xs: "100%", sm: 200 },
                px: 1,
                pt: { xs: 2, sm: 0 },
              }}>
              <Slider
                value={getSliderValue()}
                min={0}
                max={2}
                step={1}
                marks={[
                  { value: 0, label: "A" },
                  { value: 1, label: "Aa" },
                  { value: 2, label: "Aaa" },
                ]}
                onChange={handleFontChange}
                valueLabelDisplay="off"
                sx={{ "--Slider-trackSize": "4px" }}
              />
            </Box>
          </ListItem>

          <Divider component="li" />

          {/* ITEM 2: REDUCCIÓN DE MOVIMIENTO */}
          <ListItem
            endAction={
              <Switch
                checked={form.reducedMotion}
                onChange={(e) =>
                  handleChange("reducedMotion", e.target.checked)
                }
                sx={{ ml: 2 }}
              />
            }>
            <ListItemDecorator>
              <AnimationRoundedIcon fontSize="large" />
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">
                {t("settings.accessibility.reduced_motion")}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {t("settings.accessibility.reduced_motion_desc")}
              </Typography>
            </ListItemContent>
          </ListItem>

          <Divider component="li" />

          {/* ITEM 3: ALTO CONTRASTE */}
          <ListItem
            endAction={
              <Switch
                checked={form.highContrast}
                onChange={(e) => handleChange("highContrast", e.target.checked)}
                sx={{ ml: 2 }}
              />
            }>
            <ListItemDecorator>
              <ContrastRoundedIcon fontSize="large" />
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">
                {t("settings.accessibility.high_contrast")}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {t("settings.accessibility.high_contrast_desc")}
              </Typography>
            </ListItemContent>
          </ListItem>
        </List>
      </Card>

      {/* BOTÓN GUARDAR (FUERA DE LA CARD, IGUAL QUE EN LOS OTROS) */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          size="lg"
          startDecorator={<SaveRoundedIcon />}
          disabled={!hasChanges}
          loading={saving}
          onClick={handleSaveClick}>
          {t("common.actions.save_changes")}
        </Button>
      </Box>
    </Stack>
  );
}
