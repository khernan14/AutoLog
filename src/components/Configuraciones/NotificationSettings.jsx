// src/components/Configuraciones/NotificationSettings.jsx

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  Switch,
  Stack,
  Divider,
} from "@mui/joy";

export default function NotificationSettings() {
  // Aquí puedes manejar el estado de cada switch con useState
  // Por ahora, son solo ejemplos estáticos
  return (
    <Box>
      <Typography level="h3" sx={{ mb: 2 }}>
        Notificaciones
      </Typography>
      <Typography level="body-md" sx={{ mb: 3 }}>
        Controla cómo y cuándo recibes notificaciones de la aplicación.
      </Typography>

      <Stack spacing={3} divider={<Divider />}>
        <FormControl
          orientation="horizontal"
          sx={{ justifyContent: "space-between" }}>
          <Box>
            <FormLabel>Notificaciones por Email</FormLabel>
            <Typography level="body-sm" color="text.secondary">
              Recibe actualizaciones importantes y resúmenes semanales por
              correo.
            </Typography>
          </Box>
          <Switch
            // checked={emailNotificationsEnabled}
            // onChange={(event) => setEmailNotificationsEnabled(event.target.checked)}
            defaultChecked
            color="primary"
            variant="solid"
          />
        </FormControl>

        <FormControl
          orientation="horizontal"
          sx={{ justifyContent: "space-between" }}>
          <Box>
            <FormLabel>Notificaciones en la Aplicación</FormLabel>
            <Typography level="body-sm" color="text.secondary">
              Recibe alertas y mensajes directamente en la interfaz de la
              aplicación.
            </Typography>
          </Box>
          <Switch
            // checked={inAppNotificationsEnabled}
            // onChange={(event) => setInAppNotificationsEnabled(event.target.checked)}
            defaultChecked
            color="primary"
            variant="solid"
          />
        </FormControl>

        <FormControl
          orientation="horizontal"
          sx={{ justifyContent: "space-between" }}>
          <Box>
            <FormLabel>Notificaciones de Nuevos Registros</FormLabel>
            <Typography level="body-sm" color="text.secondary">
              Recibe una notificación cuando se agregue un nuevo vehículo o
              usuario.
            </Typography>
          </Box>
          <Switch
            // checked={newRegistrationAlertsEnabled}
            // onChange={(event) => setNewRegistrationAlertsEnabled(event.target.checked)}
            defaultChecked={false} // Ejemplo: por defecto desactivado
            color="primary"
            variant="solid"
          />
        </FormControl>

        {/* Más opciones de notificación aquí */}
      </Stack>
    </Box>
  );
}
