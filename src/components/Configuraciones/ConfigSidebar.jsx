// src/components/Configuraciones/ConfigSidebar.jsx

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
} from "@mui/joy";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded"; // Icono para Apariencia
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded"; // Icono para Notificaciones
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded"; // Icono para Idioma
import InfoRoundedIcon from "@mui/icons-material/InfoRounded"; // Icono para Acerca de

export default function ConfigSidebar({ activeSection, setActiveSection }) {
  return (
    <Box
      sx={{
        width: { xs: "100%", md: "250px" },
        flexShrink: 0,
        bgcolor: "background.surface",
        borderRadius: "lg",
        boxShadow: "md",
        p: 2,
        maxHeight: { xs: "auto", md: "calc(100vh - 100px)" },
        overflowY: "auto",
      }}>
      <Typography level="h4" sx={{ mb: 2, color: "text.primary" }}>
        Configuraciones
      </Typography>
      <List
        size="lg"
        sx={{
          "--ListItem-radius": "lg",
          "--List-gap": "8px",
        }}>
        <ListItem>
          <ListItemButton
            selected={activeSection === "appearance"}
            onClick={() => setActiveSection("appearance")}>
            <PaletteRoundedIcon />
            <ListItemContent>Apariencia</ListItemContent>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton
            selected={activeSection === "notifications"}
            onClick={() => setActiveSection("notifications")}>
            <NotificationsRoundedIcon />
            <ListItemContent>Notificaciones</ListItemContent>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton
            selected={activeSection === "language"}
            onClick={() => setActiveSection("language")}>
            <LanguageRoundedIcon />
            <ListItemContent>Idioma y Región</ListItemContent>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton
            selected={activeSection === "about"}
            onClick={() => setActiveSection("about")}>
            <InfoRoundedIcon />
            <ListItemContent>Acerca de</ListItemContent>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
