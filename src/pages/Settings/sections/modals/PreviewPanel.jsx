import React from "react";
import { Card, Box, Typography, Button } from "@mui/joy";

const PreviewPanel = React.memo(function PreviewPanel({
  brandHex,
  themeMode,
  fontFamily,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 12,
        p: 2,
        width: "100%",
        boxShadow: "sm",
      }}>
      <Typography level="title-sm" mb={1}>
        Vista previa
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
          <Typography level="body-sm">Color de acento</Typography>
        </Box>

        <Typography level="h6" sx={{ fontFamily, fontSize: 18 }}>
          Ejemplo — Título con {String(fontFamily).split(",")[0]}
        </Typography>

        <Typography level="body-md" sx={{ fontFamily }}>
          Este es un párrafo de ejemplo para ver cómo se aplica la fuente y el
          color de acento. Cuando guardes, verás una confirmación.
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
          Acción de ejemplo
        </Button>
      </Box>
    </Card>
  );
});

export default PreviewPanel;
