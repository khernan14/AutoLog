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
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BrightnessAutoRoundedIcon from "@mui/icons-material/BrightnessAutoRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount"; // Para "Gestionar Usuarios"
import VpnKeyIcon from "@mui/icons-material/VpnKey"; // Para "Roles & Permisos"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Para "Mi Perfil"
import PublicIcon from "@mui/icons-material/Public"; // Para Paises
import LocationCityIcon from "@mui/icons-material/LocationCity"; // Para Ciudades
import LocalParkingIcon from "@mui/icons-material/LocalParking"; // Para Estacionamientos
import HelpCenterIcon from "@mui/icons-material/HelpCenter"; // Para Soporte (Frontend)
import SupportAgentIcon from "@mui/icons-material/SupportAgent"; // Nuevo icono para Soporte Admin
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded"; // Icono para FAQs
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded"; // Icono para Tutoriales
import AnnouncementRoundedIcon from "@mui/icons-material/AnnouncementRounded"; // Icono para Novedades
import InsertInvitationIcon from "@mui/icons-material/InsertInvitation";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";

import { useAuth } from "./AuthContext"; // Asegúrate de que la ruta sea correcta

import ColorSchemeToggle from "./ColorSchemeToggle"; // Asume que este componente está en la misma carpeta
import { useColorScheme } from "@mui/joy/styles";
import { closeSidebar } from "../utils/ToggleSidebar"; // Asume que esta utilidad existe
import logoLight from "../assets/newLogoTecnasaBlack.png";
import logoDark from "../assets/newLogoTecnasa.png";

import Swal from "sweetalert2";

// Helper para obtener las iniciales del nombre de usuario
function getInitials(name) {
  if (!name) return "";
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

// Componente Toggler para menús anidados
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
        <List
          sx={{ gap: 0.5, [`& .${listItemButtonClasses.root}`]: { py: 0.8 } }}>
          {children}
        </List>
      </Box>
    </>
  );
}

// Componente individual para cada item de navegación
function NavItem({
  path,
  icon,
  label,
  currentPath,
  onNavigate,
  canView,
  externalLink,
}) {
  // canView ya es un booleano que incorpora la lógica del rol Admin
  if (!canView) {
    return null; // No renderiza el item si no tiene permiso
  }

  const Tag = externalLink ? "a" : ListItemButton;

  return (
    <ListItem>
      <Tag
        selected={currentPath === path && !externalLink}
        onClick={() => onNavigate(path)}
        {...(externalLink && {
          href: path,
          target: "_blank",
          rel: "noopener noreferrer",
        })}
        sx={{
          backgroundColor: currentPath === path ? "primary.solidBg" : "inherit",
          color: currentPath === path ? "primary.solidColor" : "text.primary",
          "&:hover": {
            backgroundColor:
              currentPath === path ? "primary.solidBg" : "neutral.softBg",
            color:
              currentPath === path
                ? "primary.solidColor"
                : "neutral.plainColor",
          },
        }}>
        {icon}
        <ListItemContent>
          <Typography level="title-sm">{label}</Typography>
        </ListItemContent>
      </Tag>
    </ListItem>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermiso, userData } = useAuth();
  const { mode } = useColorScheme(); // "light" | "dark" | "system"

  const userName = userData?.nombre || "Usuario";
  const userEmail = userData?.email || "usuario@test.com";
  const userRole = userData?.rol; // Obtener el rol del usuario

  const logout = () => {
    closeSidebar();
    Swal.fire({
      title: "¿Deseas cerrar sesión?",
      text: "Se cerrará tu sesión actual",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        setTimeout(() => navigate("/auth/login"), 100);
      }
    });
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.matchMedia("(max-width: 768px)").matches) {
      closeSidebar();
    }
  };

  // Función auxiliar para aplicar la lógica de permiso de Admin
  const checkPermission = (permiso) => {
    return userRole === "Admin" || hasPermiso(permiso);
  };

  const navItems = [
    {
      path: "/admin/home",
      icon: <HomeRoundedIcon />,
      label: "Inicio",
      canView: true,
    },
    {
      path: "/admin/dashboard",
      icon: <DashboardRoundedIcon />,
      label: "Dashboard",
      canView: checkPermission("ver_dashboard"),
    },
    {
      path: "/admin/vehiculos",
      icon: <LocalShippingIcon />,
      label: "Vehículos",
      canView: checkPermission("gestionar_vehiculos"),
    },
    {
      path: "/admin/panel-vehiculos",
      icon: <AppRegistrationIcon />,
      label: "Registros",
      canView: checkPermission("registrar_uso"),
    },
    // {
    //   path: "/admin/reservas",
    //   icon: <InsertInvitationIcon />,
    //   label: "Reservas",
    //   canView: checkPermission("registrar_reservas"),
    // },
    {
      path: "/admin/reports",
      icon: <AssessmentIcon />,
      label: "Reportes",
      canView: checkPermission("ver_reportes"),
    },
  ];

  const managementItems = [
    {
      path: "/admin/clientes",
      icon: <GroupRoundedIcon />,
      label: "Compañías",
      canView: checkPermission("gestionar_companias"),
    },
    {
      path: "/admin/countries",
      icon: <PublicIcon />,
      label: "Países",
      canView: checkPermission("gestionar_paises"),
    },
    {
      path: "/admin/cities",
      icon: <LocationCityIcon />,
      label: "Ciudades",
      canView: checkPermission("gestionar_ciudades"),
    },
    {
      path: "/admin/parkings",
      icon: <LocalParkingIcon />,
      label: "Estacionamientos",
      canView: checkPermission("gestionar_estacionamientos"),
    },
  ];

  const inventoryItems = [
    {
      path: "/admin/inventario/bodegas",
      icon: <FactoryRoundedIcon />,
      label: "Bodegas",
      canView: checkPermission("gestionar_bodegas"),
    },
    {
      path: "/admin/inventario/activos",
      icon: <DnsRoundedIcon />,
      label: "Activos",
      canView: checkPermission("gestionar_activos"),
    },
  ];

  const systemItems = [
    {
      path: "/admin/mi-cuenta",
      icon: <AccountCircleIcon />,
      label: "Mi Perfil",
      canView: true,
    },
    {
      path: "/admin/usuarios",
      icon: <SupervisorAccountIcon />,
      label: "Gestionar Usuarios",
      canView: checkPermission("gestionar_usuarios"),
    },
    {
      path: "/admin/permissions",
      icon: <VpnKeyIcon />,
      label: "Roles y Permisos",
      canView: checkPermission("asignar_permisos"),
    },
    {
      path: "/admin/configuraciones",
      icon: <SettingsRoundedIcon />,
      label: "Configuraciones",
      canView: checkPermission("ver_configuraciones"),
    },
  ];

  const supportAndHelpItems = [
    {
      path: "/admin/soporte",
      icon: <HelpCenterIcon />,
      label: "Centro de Ayuda",
      canView: true,
    },
    {
      path: "/admin/faqs",
      icon: <QuestionAnswerRoundedIcon />,
      label: "Gestionar FAQs",
      canView: checkPermission("gestionar_faqs"),
    },
    {
      path: "/admin/help/tutorials",
      icon: <VideoLibraryRoundedIcon />,
      label: "Gestionar Tutoriales",
      canView: checkPermission("gestionar_tutoriales"),
    },
    {
      path: "/admin/help/changelogs",
      icon: <AnnouncementRoundedIcon />,
      label: "Gestionar Novedades",
      canView: checkPermission("gestionar_novedades"),
    },
    {
      path: "/admin/help/services",
      icon: <DnsRoundedIcon />,
      label: "Estado de Servicios",
      canView: checkPermission("gestionar_servicios_sistema"),
    },
  ];


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
        boxShadow: { xs: "md", md: "none" },
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

      {/* Encabezado del Sidebar: Logo y Toggle de Tema */}
      {/* <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <IconButton
          variant="soft"
          color="primary"
          size="sm"
          aria-label="icono de la aplicación">
          <BrightnessAutoRoundedIcon />
        </IconButton>
        <Typography
          level="title-lg"
          sx={{ fontWeight: "xl", color: "primary.plainColor" }}>
          AutoLog
        </Typography>
        <ColorSchemeToggle sx={{ ml: "auto" }} />
      </Box>*/}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <img
          src={mode === "dark" ? logoDark : logoLight}
          alt="Logo cliente"
          style={{ width: 240, height: 75, objectFit: "contain" }}
        />
      </Box>

      {/* Barra de Búsqueda */}
      <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Buscar..."
        sx={{ display: { xs: "none", sm: "flex" } }}
      />

      {/* Contenido principal del Sidebar: Navegación */}
      <Box
        sx={{
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
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
            "&:hover": {
              backgroundColor: "primary.solidBg",
            },
          },
        }}>
        <Typography
          level="body-xs"
          sx={{
            pl: 2,
            mt: 1,
            mb: 0.5,
            color: "text.tertiary",
            textTransform: "uppercase",
          }}>
          General
        </Typography>
        <List size="sm" sx={{ gap: 1, "--List-nestedInsetStart": "30px" }}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              path={item.path}
              icon={item.icon}
              label={item.label}
              currentPath={location.pathname}
              onNavigate={handleNavigate}
              canView={item.canView}
            />
          ))}

          {/* Solo se muestra el toggler si el usuario puede ver al menos un elemento dentro */}
          {(checkPermission("gestionar_companias") ||
            checkPermission("gestionar_paises") ||
            checkPermission("gestionar_ciudades") ||
            checkPermission("gestionar_estacionamientos")) && (
              <ListItem nested>
                <Toggler
                  renderToggle={({ open, setOpen }) => (
                    <ListItemButton
                      onClick={() => setOpen(!open)}
                      aria-expanded={open}
                      sx={{
                        fontWeight: "md",
                        "&:hover": {
                          backgroundColor: "neutral.softBg",
                        },
                      }}>
                      <AdminPanelSettingsIcon />
                      <ListItemContent>
                        <Typography level="title-sm">Gestión</Typography>
                      </ListItemContent>
                      <KeyboardArrowDownIcon
                        sx={{
                          transform: open ? "rotate(180deg)" : "none",
                          transition: "0.2s",
                        }}
                      />
                    </ListItemButton>
                  )}>
                  {managementItems.map((item) => (
                    <NavItem
                      key={item.path}
                      path={item.path}
                      icon={item.icon}
                      label={item.label}
                      currentPath={location.pathname}
                      onNavigate={handleNavigate}
                      canView={item.canView}
                    />
                  ))}
                </Toggler>
              </ListItem>
            )}

          {/* Menú Anidado para Inventario */}
          {(checkPermission("gestionar_bodegas") ||
            checkPermission("gestionar_activos")) && (
              <ListItem nested>
                <Toggler
                  renderToggle={({ open, setOpen }) => (
                    <ListItemButton
                      onClick={() => setOpen(!open)}
                      aria-expanded={open}
                      sx={{
                        fontWeight: "md",
                        "&:hover": {
                          backgroundColor: "neutral.softBg",
                        },
                      }}>
                      <DnsRoundedIcon />
                      <ListItemContent>
                        <Typography level="title-sm">Inventario</Typography>
                      </ListItemContent>
                      <KeyboardArrowDownIcon
                        sx={{
                          transform: open ? "rotate(180deg)" : "none",
                          transition: "0.2s",
                        }}
                      />
                    </ListItemButton>
                  )}>
                  {inventoryItems.map((item) => (
                    <NavItem
                      key={item.path}
                      path={item.path}
                      icon={item.icon}
                      label={item.label}
                      currentPath={location.pathname}
                      onNavigate={handleNavigate}
                      canView={item.canView}
                    />
                  ))}
                </Toggler>
              </ListItem>
            )}

          {/* Menú Anidado para Sistema */}
          {(checkPermission("cambiar_password") ||
            checkPermission("asignar_permisos") ||
            checkPermission("gestionar_usuarios")) && (
              <ListItem nested>
                <Toggler
                  renderToggle={({ open, setOpen }) => (
                    <ListItemButton
                      onClick={() => setOpen(!open)}
                      aria-expanded={open}
                      sx={{
                        fontWeight: "md",
                        "&:hover": {
                          backgroundColor: "neutral.softBg",
                        },
                      }}>
                      <SettingsRoundedIcon />
                      <ListItemContent>
                        <Typography level="title-sm">Sistema</Typography>
                      </ListItemContent>
                      <KeyboardArrowDownIcon
                        sx={{
                          transform: open ? "rotate(180deg)" : "none",
                          transition: "0.2s",
                        }}
                      />
                    </ListItemButton>
                  )}>
                  {systemItems.map((item) => (
                    <NavItem
                      key={item.path}
                      path={item.path}
                      icon={item.icon}
                      label={item.label}
                      currentPath={location.pathname}
                      onNavigate={handleNavigate}
                      canView={item.canView}
                    />
                  ))}
                </Toggler>
              </ListItem>
            )}

          {/* NUEVO: Menú Anidado para Soporte (Admin) */}
          {(checkPermission("gestionar_faqs") ||
            checkPermission("gestionar_tutoriales") ||
            checkPermission("gestionar_novedades") ||
            checkPermission("gestionar_servicios_sistema")) && (
              <ListItem nested>
                <Toggler
                  renderToggle={({ open, setOpen }) => (
                    <ListItemButton
                      onClick={() => setOpen(!open)}
                      aria-expanded={open}
                      sx={{
                        fontWeight: "md",
                        "&:hover": {
                          backgroundColor: "neutral.softBg",
                        },
                      }}>
                      <SupportAgentIcon /> {/* Icono para Soporte Admin */}
                      <ListItemContent>
                        <Typography level="title-sm">Soporte y Ayuda</Typography>
                      </ListItemContent>
                      <KeyboardArrowDownIcon
                        sx={{
                          transform: open ? "rotate(180deg)" : "none",
                          transition: "0.2s",
                        }}
                      />
                    </ListItemButton>
                  )}>
                  {supportAndHelpItems.map((item) => (
                    <NavItem
                      key={item.path}
                      path={item.path}
                      icon={item.icon}
                      label={item.label}
                      currentPath={location.pathname}
                      onNavigate={handleNavigate}
                      canView={item.canView}
                    />
                  ))}
                </Toggler>
              </ListItem>
            )}
        </List>

        {/* <Typography
          level="body-xs"
          sx={{
            pl: 2,
            mt: 3,
            mb: 0.5,
            color: "text.tertiary",
            textTransform: "uppercase",
          }}>
          Soporte
        </Typography> */}
        {/* <List size="sm" sx={{ gap: 1, mt: "auto", flexGrow: 0, mb: 2 }}>
          {supportAndHelpItems.map((item) => (
            <NavItem
              key={item.path}
              path={item.path}
              icon={item.icon}
              label={item.label}
              currentPath={location.pathname}
              onNavigate={handleNavigate}
              canView={item.canView}
            />
          ))}
        </List> */}
      </Box>

      {/* Sección del Perfil de Usuario en el pie del Sidebar */}
      <Divider />
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", p: 1 }}>
        <Avatar
          variant="soft"
          size="md"
          sx={{
            bgcolor: "primary.softBg",
            color: "primary.softColor",
            fontWeight: "bold",
            textTransform: "uppercase",
            border: "2px solid",
            borderColor: "primary.softColor",
          }}>
          {getInitials(userName)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-md" sx={{ fontWeight: "lg" }}>
            {userName}
          </Typography>
          <Typography level="body-xs" sx={{ color: "text.secondary" }}>
            {userEmail}
          </Typography>
        </Box>
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          onClick={logout}
          aria-label="Cerrar sesión"
          sx={{
            "&:hover": {
              color: "danger.plainColor",
            },
          }}>
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}
