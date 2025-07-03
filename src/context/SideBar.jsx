import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SupportRoundedIcon from "@mui/icons-material/SupportRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BrightnessAutoRoundedIcon from "@mui/icons-material/BrightnessAutoRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssessmentIcon from "@mui/icons-material/Assessment";

import ColorSchemeToggle from "./ColorSchemeToggle";
import { closeSidebar } from "../utils/ToggleSidebar";
import Swal from "sweetalert2";

function getInitials(name) {
  if (!name) return "";
  const names = name.trim().split(" ");
  return names
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Toggler({ defaultExpanded = false, renderToggle, children }) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: "grid",
            transition: "0.2s ease",
            "& > *": {
              overflow: "hidden",
            },
          },
          open ? { gridTemplateRows: "1fr" } : { gridTemplateRows: "0fr" },
        ]}>
        {children}
      </Box>
    </>
  );
}

function NavItem({ path, icon, label, currentPath, onNavigate }) {
  return (
    <ListItem key={path}>
      <ListItemButton
        selected={currentPath === path}
        onClick={() => onNavigate(path)}>
        {icon}
        <ListItemContent>
          <Typography level="title-sm">{label}</Typography>
        </ListItemContent>
      </ListItemButton>
    </ListItem>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const userName = storedUser?.nombre || "Usuario";
  const userEmail = storedUser?.email || "usuario@test.com";

  const logout = () => {
    Swal.fire({
      title: "¿Deseas cerrar sesión?",
      text: "Se cerrará tu sesión actual",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/auth/login");
      }
    });
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.matchMedia("(max-width: 768px)").matches) closeSidebar();
  };

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none",
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}>
      <GlobalStyles
        styles={(theme) => ({
          ":root": {
            "--Sidebar-width": "260px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "280px",
            },
          },
        })}
      />
      <Box className="Sidebar-overlay" onClick={closeSidebar} />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <IconButton
          variant="soft"
          color="primary"
          size="sm"
          aria-label="toggle theme">
          <BrightnessAutoRoundedIcon />
        </IconButton>
        <Typography level="title-lg">AutoLog</Typography>
        <ColorSchemeToggle sx={{ ml: "auto" }} />
      </Box>
      <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Buscar"
        sx={{ display: { xs: "none", sm: "flex" } }}
      />
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
            borderRadius: "md",
          },
          [`& .${listItemButtonClasses.root}[aria-selected="true"]`]: {
            backgroundColor: "primary.solidBg",
            color: "primary.solidColor",
          },
        }}>
        <Typography
          level="body-xs"
          sx={{ pl: 2, mt: 1, mb: 0.5, color: "text.secondary" }}>
          Navegación
        </Typography>
        <List size="sm" sx={{ gap: 1, "--List-nestedInsetStart": "30px" }}>
          {[
            { path: "/admin/home", icon: <HomeRoundedIcon />, label: "Inicio" },
            {
              path: "/admin/dashboard",
              icon: <DashboardRoundedIcon />,
              label: "Dashboard",
            },
            {
              path: "/admin/vehiculos",
              icon: <LocalShippingIcon />,
              label: "Vehículos",
            },
            {
              path: "/admin/panel-vehiculos",
              icon: <AppRegistrationIcon />,
              label: "Registros",
            },
            {
              path: "/admin/reports",
              icon: <AssessmentIcon />,
              label: "Reportes",
            },
          ].map(({ path, icon, label }) => (
            <ListItem key={path}>
              <ListItemButton
                selected={location.pathname === path}
                onClick={() => handleNavigate(path)}>
                {icon}
                <ListItemContent>
                  <Typography level="title-sm">{label}</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton
                  onClick={() => setOpen(!open)}
                  aria-expanded={open}>
                  <GroupRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Usuarios</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={{ transform: open ? "rotate(180deg)" : "none" }}
                  />
                </ListItemButton>
              )}>
              <List sx={{ gap: 0.5 }}>
                <ListItem>
                  <ListItemButton
                    onClick={() => handleNavigate("/admin/mi-cuenta")}>
                    Mi Perfil
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => handleNavigate("/admin/usuarios")}>
                    Gestionar usuarios
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => handleNavigate("/admin/permissions")}>
                    Roles & permission
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
          {/* otro menu */}
          <ListItem nested>
            <Toggler
              renderToggle={({ open, setOpen }) => (
                <ListItemButton
                  onClick={() => setOpen(!open)}
                  aria-expanded={open}>
                  <AdminPanelSettingsIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Administración</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={{ transform: open ? "rotate(180deg)" : "none" }}
                  />
                </ListItemButton>
              )}>
              <List sx={{ gap: 0.5 }}>
                <ListItem>
                  <ListItemButton
                    onClick={() => handleNavigate("/admin/countries")}>
                    Paises
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => handleNavigate("/admin/cities")}>
                    Ciudades
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton
                    onClick={() => handleNavigate("/admin/parkings")}>
                    Estacionamientos
                  </ListItemButton>
                </ListItem>
                {/* <ListItem>
                  <ListItemButton
                    onClick={() =>
                      handleNavigate("/admin/notificacion-grupos")
                    }>
                    Grupos de Notificación
                  </ListItemButton>
                </ListItem> */}
              </List>
            </Toggler>
          </ListItem>
        </List>

        <Typography
          level="body-xs"
          sx={{ pl: 2, mt: 3, mb: 0.5, color: "text.secondary" }}>
          Configuración
        </Typography>
        <List size="sm" sx={{ mt: "auto", flexGrow: 0, mb: 2 }}>
          <ListItem>
            <ListItemButton>
              <SupportRoundedIcon />
              Soporte
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <SettingsRoundedIcon />
              Configuraciones
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Avatar
          variant="outlined"
          size="sm"
          sx={{
            bgcolor: "primary.softBg",
            color: "primary.softColor",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}>
          {getInitials(userName)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">{userName}</Typography>
          <Typography level="body-xs">{userEmail}</Typography>
        </Box>
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          onClick={logout}
          aria-label="Cerrar sesión">
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}
