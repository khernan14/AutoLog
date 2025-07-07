// src/components/Configuraciones/AppearanceSettings.jsx

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  Stack,
  Divider,
  Button,
} from "@mui/joy";
import ColorSchemeToggle from "../../context/ColorSchemeToggle"; // Ajusta la ruta a tu ColorSchemeToggle

export default function AppearanceSettings() {
  return (
    <Box>
      <Typography level="h3" sx={{ mb: 2 }}>
        Apariencia
      </Typography>
      <Typography level="body-md" sx={{ mb: 3 }}>
        Personaliza el aspecto de la aplicación.
      </Typography>

      <Stack spacing={3} divider={<Divider />}>
        {/* Tema del Sistema */}
        <FormControl>
          <FormLabel>Tema</FormLabel>
          <Typography level="body-sm" sx={{ mb: 1, color: "text.secondary" }}>
            Cambia entre el modo claro y oscuro.
          </Typography>
          <ColorSchemeToggle sx={{ alignSelf: "flex-start" }} />
        </FormControl>

        {/* Futuras opciones de apariencia aquí (ej. color de acento, tamaño de fuente) */}
        <Box>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Color de Acento (Próximamente)
          </Typography>
          <Typography level="body-sm" color="text.secondary">
            Elige un color para resaltar elementos interactivos.
          </Typography>
          <Button variant="outlined" disabled sx={{ mt: 1 }}>
            Seleccionar Color
          </Button>
        </Box>

        <Box>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Tamaño de Fuente (Próximamente)
          </Typography>
          <Typography level="body-sm" color="text.secondary">
            Ajusta el tamaño del texto para una mejor lectura.
          </Typography>
          <Button variant="outlined" disabled sx={{ mt: 1 }}>
            Ajustar
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
