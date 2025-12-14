// src/pages/Settings/sections/modals/PreviewPanel.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Card, Box, Typography, Button } from "@mui/joy";

const PreviewPanel = React.memo(function PreviewPanel({
  brandHex,
  themeMode,
  fontFamily,
}) {
  const { t } = useTranslation();

  // Obtenemos solo el nombre principal de la fuente para mostrarlo
  const fontName = String(fontFamily).split(",")[0].replace(/['"]/g, "");

  return (
    <Card
      variant="outlined"
      color="primary"
      sx={{
        borderRadius: 12,
        p: 2,
        width: "100%",
        boxShadow: "sm",
      }}>
      <Typography level="title-sm" mb={1}>
        {t("settings.preview.title")}
      </Typography>
      <Box
        sx={{
          borderRadius: 8,
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor:
            themeMode === "dark" ? "background.level1" : "background.surface",
        }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box
            aria-hidden
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: brandHex,
              boxShadow: "sm",
            }}
          />
          <Typography level="body-sm">
            {t("settings.preview.accent_label")}
          </Typography>
        </Box>

        <Typography level="h6" sx={{ fontFamily, fontSize: 18 }}>
          {t("settings.preview.example_title", { font: fontName })}
        </Typography>

        <Typography level="body-md" sx={{ fontFamily }}>
          {t("settings.preview.example_text")}
        </Typography>

        <Button
          size="sm"
          variant="outlined"
          sx={{
            borderColor: brandHex,
            color: brandHex,
            alignSelf: "flex-start",
            mt: 1,
          }}>
          {t("settings.preview.example_btn")}
        </Button>
      </Box>
    </Card>
  );
});

export default PreviewPanel;
