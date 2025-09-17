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

import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import MenuButton from "@mui/joy/MenuButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListDivider from "@mui/joy/ListDivider";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import AnnouncementRoundedIcon from "@mui/icons-material/AnnouncementRounded";
import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import MoreVert from "@mui/icons-material/MoreVert";

import { useAuth } from "./AuthContext";
import { useColorScheme } from "@mui/joy/styles";
import { closeSidebar } from "../utils/ToggleSidebar";
import logoLight from "../assets/newLogoTecnasaBlack.png";
import logoDark from "../assets/newLogoTecnasa.png";

import Swal from "sweetalert2";
import { Tooltip } from "@mui/joy";

/* Helpers */
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
            "& > *": { overflow: "hidden" },
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

function NavItem({
  path,
  icon,
  label,
  currentPath,
  onNavigate,
  canView,
  externalLink,
}) {
  if (!canView) return null;
  const Tag = externalLink ? "a" : ListItemButton;
  return (
    <ListItem>
      <Tag
        selected={currentPath === path && !externalLink}
        onClick={() => !externalLink && onNavigate(path)}
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
  const { mode } = useColorScheme();
  const userName = userData?.nombre || "Usuario";
  const userEmail = userData?.email || "usuario@test.com";
  const userRole = userData?.rol;

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

  const checkPermission = (permiso) =>
    userRole === "Admin" || hasPermiso(permiso);

  /* Secciones */
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
  ];

  const supportAndHelpItems = [
    {
      path: "/admin/support/faqs",
      icon: <QuestionAnswerRoundedIcon />,
      label: "Gestionar FAQs",
      canView: checkPermission("help_manage"),
    },
    {
      path: "/admin/support/tutorials",
      icon: <VideoLibraryRoundedIcon />,
      label: "Gestionar Tutoriales",
      canView: checkPermission("help_manage"),
    },
    {
      path: "/admin/support/changelogs",
      icon: <AnnouncementRoundedIcon />,
      label: "Gestionar Novedades",
      canView: checkPermission("help_manage"),
    },
    {
      path: "/admin/support/services",
      icon: <DnsRoundedIcon />,
      label: "Estado de Servicios",
      canView: checkPermission("help_manage"),
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
            [theme.breakpoints.up("lg")]: { "--Sidebar-width": "280px" },
          },
        })}
      />
      <Box className="Sidebar-overlay" onClick={closeSidebar} />

      {/* Logo */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <img
          src={mode === "dark" ? logoDark : logoLight}
          alt="Logo cliente"
          style={{ width: 240, height: 75, objectFit: "contain" }}
        />
      </Box>

      {/* Búsqueda */}
      <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Buscar..."
        sx={{ display: { xs: "none", sm: "flex" } }}
      />

      {/* Navegación */}
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
            "&:hover": { backgroundColor: "primary.solidBg" },
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
                      "&:hover": { backgroundColor: "neutral.softBg" },
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
                      "&:hover": { backgroundColor: "neutral.softBg" },
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
                      "&:hover": { backgroundColor: "neutral.softBg" },
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

          {checkPermission("help_manage") && (
            <ListItem nested>
              <Toggler
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    sx={{
                      fontWeight: "md",
                      "&:hover": { backgroundColor: "neutral.softBg" },
                    }}>
                    <SupportAgentIcon />
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
      </Box>

      {/* Pie: tarjeta de usuario con menú contextual */}
      <Divider />
      <Box
        sx={{
          display: "flex",
          gap: 1.25,
          alignItems: "center",
          p: 1,
          borderRadius: "md",
          position: "relative", // <-
          overflow: "visible", // <-
        }}>
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
            flexShrink: 0,
          }}>
          {getInitials(userName)}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Tooltip
            sx={{ zIndex: 13000 }}
            title={userName}
            variant="soft"
            placement="top">
            <Typography level="title-md" noWrap>
              {userName}
            </Typography>
          </Tooltip>
          <Tooltip sx={{ zIndex: 13000 }} title={userEmail} variant="soft">
            <Typography level="body-xs" sx={{ color: "text.secondary" }} noWrap>
              {userEmail}
            </Typography>
          </Tooltip>
        </Box>

        <Dropdown>
          <Tooltip
            sx={{ zIndex: 13000 }}
            title="Menú contextual"
            variant="soft">
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: {
                  variant: "outlined",
                  color: "neutral",
                  "aria-label": "Acciones de cuenta",
                },
              }}>
              <MoreVert />
            </MenuButton>
          </Tooltip>

          {/* Portal + z-index alto para quedar por encima del Sidebar */}
          <Menu
            placement="top-start"
            disablePortal={false} // <- que salga en portal (document.body)
            sx={{ zIndex: 13000 }} // <- mayor que el zIndex del Sidebar (10000)
            slotProps={{
              listbox: { sx: { zIndex: 13000 } }, // extra por si algún tema/skin lo sobrescribe
            }}>
            <MenuItem onClick={() => handleNavigate("/admin/mi-cuenta")}>
              <ListItemDecorator>
                <AccountCircleIcon fontSize="small" />
              </ListItemDecorator>
              Mi Perfil
            </MenuItem>
            {checkPermission("ver_configuraciones") && (
              <MenuItem
                onClick={() => handleNavigate("/admin/configuraciones")}>
                <ListItemDecorator>
                  <SettingsRoundedIcon fontSize="small" />
                </ListItemDecorator>
                Configuraciones
              </MenuItem>
            )}
            <MenuItem onClick={() => handleNavigate("/admin/help")}>
              <ListItemDecorator>
                <HelpCenterIcon fontSize="small" />
              </ListItemDecorator>
              Centro de Ayuda
            </MenuItem>
            <ListDivider />
            <MenuItem color="danger" variant="soft" onClick={logout}>
              <ListItemDecorator sx={{ color: "inherit" }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemDecorator>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Sheet>
  );
}
