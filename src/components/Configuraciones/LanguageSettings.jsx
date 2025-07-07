// src/components/Configuraciones/LanguageSettings.jsx

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Stack,
  Divider,
  Button,
} from "@mui/joy";

export default function LanguageSettings() {
  // Aquí puedes manejar el estado del idioma seleccionado con useState
  const [selectedLanguage, setSelectedLanguage] = React.useState("es"); // 'es' por defecto

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 2 }}>
        Idioma y Región
      </Typography>
      <Typography level="body-md" sx={{ mb: 3 }}>
        Configura el idioma y los formatos regionales de la aplicación.
      </Typography>

      <Stack spacing={3} divider={<Divider />}>
        {/* Idioma de la Aplicación */}
        <FormControl>
          <FormLabel>Idioma de la Aplicación</FormLabel>
          <Typography level="body-sm" sx={{ mb: 1, color: "text.secondary" }}>
            Cambia el idioma de la interfaz de usuario.
          </Typography>
          <Select
            value={selectedLanguage}
            onChange={(event, newValue) => setSelectedLanguage(newValue)}
            sx={{ maxWidth: 250 }}>
            <Option value="es">Español</Option>
            <Option value="en">English</Option>
            {/* Agrega más idiomas si tu app los soporta */}
          </Select>
        </FormControl>

        {/* Formato de Fecha y Hora (Próximamente) */}
        <Box>
          <Typography level="title-md" sx={{ mb: 1 }}>
            Formato de Fecha y Hora (Próximamente)
          </Typography>
          <Typography level="body-sm" color="text.secondary">
            Elige cómo se muestran las fechas y horas en la aplicación.
          </Typography>
          <Button variant="outlined" disabled sx={{ mt: 1 }}>
            Ajustar Formato
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
