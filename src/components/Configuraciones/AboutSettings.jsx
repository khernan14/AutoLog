// src/components/Configuraciones/AboutSettings.jsx

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemContent,
  Divider,
  Link,
} from "@mui/joy";

export default function AboutSettings() {
  // Datos estáticos de ejemplo, en una app real podrían venir de variables de entorno o un endpoint de API
  const appVersion = "1.0.0";
  const buildNumber = "20240706.1";
  const copyrightYear = new Date().getFullYear();
  const developerName = "HernDevs";

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 2 }}>
        Acerca de
      </Typography>
      <Typography level="body-md" sx={{ mb: 3 }}>
        Información general sobre la aplicación y sus componentes.
      </Typography>

      <List
        variant="plain"
        sx={{
          "--ListItem-paddingY": "8px",
          "--ListItem-paddingX": "0px",
          borderRadius: "md",
        }}>
        <ListItem>
          <ListItemContent>
            <Typography level="title-sm">Versión de la Aplicación</Typography>
            <Typography level="body-md">{appVersion}</Typography>
          </ListItemContent>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemContent>
            <Typography level="title-sm">Número de Compilación</Typography>
            <Typography level="body-md">{buildNumber}</Typography>
          </ListItemContent>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemContent>
            <Typography level="title-sm">Desarrollado por</Typography>
            <Typography level="body-md">{developerName}</Typography>
          </ListItemContent>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemContent>
            <Typography level="title-sm">Copyright</Typography>
            <Typography level="body-md">
              © {copyrightYear} {developerName}. Todos los derechos reservados.
            </Typography>
          </ListItemContent>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemContent>
            <Typography level="title-sm">
              Licencias de Código Abierto
            </Typography>
            <Link href="#" level="body-md" sx={{ mt: 0.5 }}>
              Ver licencias
            </Link>
          </ListItemContent>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemContent>
            <Typography level="title-sm">Términos de Servicio</Typography>
            <Link href="#" level="body-md" sx={{ mt: 0.5 }}>
              Leer términos
            </Link>
          </ListItemContent>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemContent>
            <Typography level="title-sm">Política de Privacidad</Typography>
            <Link href="#" level="body-md" sx={{ mt: 0.5 }}>
              Leer política
            </Link>
          </ListItemContent>
        </ListItem>
      </List>
    </Box>
  );
}
