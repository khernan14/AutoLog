import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";
import { useColorScheme } from "@mui/joy/styles";

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
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import { MoreHorizontalIcon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import { globalSearch } from "../services/search.api";
import { useAuth } from "./AuthContext";
import { closeSidebar } from "../utils/ToggleSidebar";
import logoLight from "../assets/newLogoTecnasaBlack.png";
import logoDark from "../assets/newLogoTecnasa.png";
import Swal from "sweetalert2";
import useIsMobile from "../hooks/useIsMobile";

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

function KindIcon({ kind }) {
  const k = String(kind || "").toLowerCase();
  if (k.includes("veh")) return <DirectionsCarRoundedIcon fontSize="small" />;
  if (k.includes("activo")) return <Inventory2RoundedIcon fontSize="small" />;
  if (k.includes("asset")) return <Inventory2RoundedIcon fontSize="small" />;
  if (k.includes("cliente") || k.includes("compa") || k.includes("company"))
    return <BusinessRoundedIcon fontSize="small" />;
  if (k.includes("site")) return <PlaceRoundedIcon fontSize="small" />;
  if (k.includes("city")) return <LocationCityIcon fontSize="small" />;
  if (k.includes("country") || k.includes("pais"))
    return <FlagRoundedIcon fontSize="small" />;
  if (k.includes("parking") || k.includes("parkin"))
    return <LocalParkingIcon fontSize="small" />;
  if (k.includes("warehouse") || k.includes("bodega"))
    return <FactoryRoundedIcon fontSize="small" />;
  if (k.includes("reporte")) return <SummarizeRoundedIcon fontSize="small" />;
  if (k.includes("registro") || k.includes("record"))
    return <ArticleRoundedIcon fontSize="small" />;
  return <StorageRoundedIcon fontSize="small" />;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermiso, userData } = useAuth();
  const { mode } = useColorScheme();
  const isMobile = useIsMobile(768);

  const currentPath = location.pathname;
  const userName = userData?.nombre || "Usuario";
  const userEmail = userData?.email || "usuario@test.com";
  const userRole = userData?.rol;

  const [commandOpen, setCommandOpen] = React.useState(false);
  const [commandQuery, setCommandQuery] = React.useState("");
  const [commandLoading, setCommandLoading] = React.useState(false);
  const [commandResults, setCommandResults] = React.useState([]);

  const checkPermission = React.useCallback(
    (permiso) => userRole === "Admin" || (permiso ? hasPermiso(permiso) : true),
    [userRole, hasPermiso]
  );

  // =========================
  // Secciones
  // =========================
  const navItems = [
    {
      path: "/admin/home",
      icon: <HomeRoundedIcon />,
      label: "Inicio",
      perm: null,
      canView: true,
      kind: "general",
      group: "General",
    },
    {
      path: "/admin/dashboard",
      icon: <DashboardRoundedIcon />,
      label: "Dashboard",
      perm: "ver_dashboard",
      canView: checkPermission("ver_dashboard"),
      kind: "general",
      group: "General",
    },
    {
      path: "/admin/vehiculos",
      icon: <LocalShippingIcon />,
      label: "Vehículos",
      perm: "gestionar_vehiculos",
      canView: checkPermission("gestionar_vehiculos"),
      kind: "vehicle",
      group: "General",
    },
    {
      path: "/admin/panel-vehiculos",
      icon: <AppRegistrationIcon />,
      label: "Registros",
      perm: "registrar_uso",
      canView: checkPermission("registrar_uso"),
      kind: "record",
      group: "General",
    },
    {
      path: "/admin/reports",
      icon: <AssessmentIcon />,
      label: "Reportes",
      perm: "ver_reportes",
      canView: checkPermission("ver_reportes"),
      kind: "reporte",
      group: "General",
    },
  ];

  const managementItems = [
    {
      path: "/admin/clientes",
      icon: <GroupRoundedIcon />,
      label: "Compañías",
      perm: "gestionar_companias",
      canView: checkPermission("gestionar_companias"),
      kind: "company",
      group: "Gestión",
    },
    {
      path: "/admin/countries",
      icon: <PublicIcon />,
      label: "Países",
      perm: "gestionar_paises",
      canView: checkPermission("gestionar_paises"),
      kind: "country",
      group: "Gestión",
    },
    {
      path: "/admin/cities",
      icon: <LocationCityIcon />,
      label: "Ciudades",
      perm: "gestionar_ciudades",
      canView: checkPermission("gestionar_ciudades"),
      kind: "city",
      group: "Gestión",
    },
    {
      path: "/admin/parkings",
      icon: <LocalParkingIcon />,
      label: "Estacionamientos",
      perm: "gestionar_estacionamientos",
      canView: checkPermission("gestionar_estacionamientos"),
      kind: "parking",
      group: "Gestión",
    },
  ];

  const inventoryItems = [
    {
      path: "/admin/inventario/bodegas",
      icon: <FactoryRoundedIcon />,
      label: "Bodegas",
      perm: "gestionar_bodegas",
      canView: checkPermission("gestionar_bodegas"),
      kind: "warehouse",
      group: "Inventario",
    },
    {
      path: "/admin/inventario/activos",
      icon: <DnsRoundedIcon />,
      label: "Activos",
      perm: "gestionar_activos",
      canView: checkPermission("gestionar_activos"),
      kind: "asset",
      group: "Inventario",
    },
  ];

  const systemItems = [
    {
      path: "/admin/usuarios",
      icon: <SupervisorAccountIcon />,
      label: "Gestionar Usuarios",
      perm: "gestionar_usuarios",
      canView: checkPermission("gestionar_usuarios"),
      kind: "sistema",
      group: "Sistema",
    },
    {
      path: "/admin/permissions",
      icon: <VpnKeyIcon />,
      label: "Roles y Permisos",
      perm: "asignar_permisos",
      canView: checkPermission("asignar_permisos"),
      kind: "sistema",
      group: "Sistema",
    },
    {
      path: "/admin/notificaciones",
      icon: <MarkChatUnreadIcon />,
      label: "Notificaciones",
      perm: "ver_configuraciones",
      canView: checkPermission("ver_configuraciones"),
      kind: "notificaciones",
      group: "Sistema",
    },
  ];

  const supportAndHelpItems = [
    {
      path: "/admin/support/faqs",
      icon: <QuestionAnswerRoundedIcon />,
      label: "Gestionar FAQs",
      perm: "help_manage",
      canView: checkPermission("help_manage"),
      kind: "soporte",
      group: "Soporte y Ayuda",
    },
    {
      path: "/admin/support/tutorials",
      icon: <VideoLibraryRoundedIcon />,
      label: "Gestionar Tutoriales",
      perm: "help_manage",
      canView: checkPermission("help_manage"),
      kind: "soporte",
      group: "Soporte y Ayuda",
    },
    {
      path: "/admin/support/changelogs",
      icon: <AnnouncementRoundedIcon />,
      label: "Gestionar Novedades",
      perm: "help_manage",
      canView: checkPermission("help_manage"),
      kind: "soporte",
      group: "Soporte y Ayuda",
    },
    {
      path: "/admin/support/services",
      icon: <DnsRoundedIcon />,
      label: "Estado de Servicios",
      perm: "help_manage",
      canView: checkPermission("help_manage"),
      kind: "soporte",
      group: "Soporte y Ayuda",
    },
  ];

  // Index plano para búsqueda local
  const routeIndex = React.useMemo(() => {
    const pick = (arr) =>
      arr.filter(Boolean).map((it) => ({
        url: it.path,
        title: it.label,
        subtitle: it.group ? `Módulo • ${it.group}` : "Módulo",
        kind: it.kind || "general",
        perm: it.perm || null,
        canView: it.canView,
      }));
    return [
      ...pick(navItems),
      ...pick(managementItems),
      ...pick(inventoryItems),
      ...pick(systemItems),
      ...pick(supportAndHelpItems),
    ];
    // deps solo en cosas que realmente cambian permisos
  }, [userRole, hasPermiso]);

  const simpleLocalRouteSearch = React.useCallback(
    (text) => {
      const t = text.toLowerCase();
      const items = routeIndex.filter(
        (r) =>
          r.canView &&
          (r.title.toLowerCase().includes(t) ||
            r.subtitle.toLowerCase().includes(t) ||
            r.url.toLowerCase().includes(t))
      );
      const ranked = items
        .map((r) => {
          const ti = r.title.toLowerCase().indexOf(t);
          const si = r.subtitle.toLowerCase().indexOf(t);
          const pi = r.url.toLowerCase().indexOf(t);
          const score =
            (ti === 0 ? 80 : ti >= 0 ? 60 : 0) +
            (si === 0 ? 20 : si >= 0 ? 12 : 0) +
            (pi === 0 ? 10 : pi >= 0 ? 6 : 0);
          return { ...r, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      return ranked.map((r) => ({
        id: r.url,
        title: r.title,
        subtitle: r.subtitle,
        url: r.url,
        kind: r.kind,
        perm: r.perm,
      }));
    },
    [routeIndex]
  );

  const searchAll = React.useCallback(async (text) => {
    try {
      const data = await globalSearch(text, { limit: 10 });
      const normalized = Array.isArray(data) ? data : [];
      return normalized;
    } catch (err) {
      console.error("[Sidebar] globalSearch error:", err);
      return [];
    }
  }, []);

  React.useEffect(() => {
    if (!commandOpen) return;

    const term = commandQuery.trim();
    if (term.length < 2) {
      setCommandResults([]);
      setCommandLoading(false);
      return;
    }

    let cancelled = false;
    setCommandLoading(true);

    (async () => {
      const res = await searchAll(term);
      if (!cancelled) {
        setCommandResults(res || []);
        setCommandLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [commandQuery, commandOpen, searchAll]);

  // Limpiar al cerrar
  React.useEffect(() => {
    if (!commandOpen) {
      setCommandQuery("");
      setCommandResults([]);
      setCommandLoading(false);
    }
  }, [commandOpen]);

  const handleCommandNavigate = (url) => {
    if (!url) return;
    navigate(url);
    if (isMobile) closeSidebar();
    setCommandOpen(false);
  };

  // =========================
  // Atajos de teclado globales
  // =========================
  const { logout: ctxLogout } = useAuth();

  const logoutHandler = React.useCallback(() => {
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
        ctxLogout();
      }
    });
  }, [ctxLogout]);

  React.useEffect(() => {
    const onGlobalKey = (e) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        document.activeElement?.isContentEditable;

      if (isTyping) return;

      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // 🔎 Ctrl/⌘ + K → abrir / cerrar command palette
      if (ctrlOrCmd && key === "k") {
        e.preventDefault();
        setCommandOpen((open) => !open);
        return;
      }

      // Ctrl/⌘ + , → Configuraciones
      if (ctrlOrCmd && e.key === ",") {
        e.preventDefault();
        if (checkPermission("ver_configuraciones")) {
          navigate("/admin/configuraciones");
        }
        return;
      }

      // Ctrl/⌘ + H → Ayuda
      if (ctrlOrCmd && key === "h") {
        e.preventDefault();
        navigate("/admin/help");
        return;
      }

      // Ctrl/⌘ + Q → Logout
      if (ctrlOrCmd && key === "q") {
        e.preventDefault();
        logoutHandler();
        return;
      }
    };

    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, [navigate, logoutHandler, checkPermission]);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      closeSidebar();
    }
  };

  // ====== swipe to close en mobile ======
  const touchStartXRef = React.useRef(null);
  const touchCurrentXRef = React.useRef(null);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchCurrentXRef.current = touch.clientX;
  };

  const handleTouchMove = (e) => {
    if (!isMobile || touchStartXRef.current == null) return;
    const touch = e.touches[0];
    touchCurrentXRef.current = touch.clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile || touchStartXRef.current == null) {
      touchStartXRef.current = null;
      touchCurrentXRef.current = null;
      return;
    }
    const deltaX = (touchCurrentXRef.current || 0) - touchStartXRef.current;
    if (deltaX < -50) {
      closeSidebar();
    }
    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  return (
    <>
      {/* Overlay mobile */}
      <Box className="Sidebar-overlay" onClick={closeSidebar} />

      <Sheet
        className="Sidebar"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: { xs: "fixed", md: "sticky" },
          left: 0,
          transform: {
            xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
            md: "none",
          },
          transition: "transform 0.35s ease, width 0.35s ease",
          zIndex: 10000,
          height: "100dvh",
          width: { xs: "80vw", md: "var(--Sidebar-width)" },
          maxWidth: { xs: 320, md: "var(--Sidebar-width)" },
          top: 0,
          p: 2,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRight: "1px solid",
          borderColor: "divider",
          boxShadow: { xs: "md", md: "none" },
          bgcolor: "background.surface",
        }}>
        <GlobalStyles
          styles={(theme) => ({
            ":root": {
              "--Sidebar-width": "260px",
              [theme.breakpoints.up("lg")]: { "--Sidebar-width": "280px" },
            },
            ["@media (max-width: 768px)"]: {
              ".Sidebar-overlay": {
                position: "fixed",
                inset: 0,
                zIndex: 9990,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(15, 23, 42, 0.6)"
                    : "rgba(15, 23, 42, 0.35)",
                backdropFilter: "blur(2px)",
                transition: "opacity 0.25s ease",
                opacity: 0,
                pointerEvents: "none",
              },
              "body.Sidebar-open .Sidebar-overlay": {
                opacity: 1,
                pointerEvents: "auto",
              },
            },
          })}
        />

        {/* Logo + botón de búsqueda */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <img
            src={mode === "dark" ? logoDark : logoLight}
            alt="Logo cliente"
            style={{ width: 200, height: 70, objectFit: "contain" }}
          />

          <Tooltip
            title="Buscar módulos y datos… (Ctrl/⌘+K)"
            variant="soft"
            placement="bottom"
            sx={{ zIndex: 13000 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCommandOpen(true)}
              className="hidden sm:inline-flex">
              <Sparkles className="h-4 w-4" />
            </Button>
          </Tooltip>
        </Box>

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
                currentPath={currentPath}
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
                      currentPath={currentPath}
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
                      currentPath={currentPath}
                      onNavigate={handleNavigate}
                      canView={item.canView}
                    />
                  ))}
                </Toggler>
              </ListItem>
            )}

            {(checkPermission("asignar_permisos") ||
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
                      currentPath={currentPath}
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
                        <Typography level="title-sm">
                          Soporte y Ayuda
                        </Typography>
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
                      currentPath={currentPath}
                      onNavigate={handleNavigate}
                      canView={item.canView}
                    />
                  ))}
                </Toggler>
              </ListItem>
            )}
          </List>
        </Box>

        {/* Pie: tarjeta de usuario */}
        <Divider />
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            alignItems: "center",
            p: 1,
            borderRadius: "md",
            position: "relative",
            overflow: "visible",
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
              title={userName}
              variant="soft"
              placement="top"
              sx={{ zIndex: 13000 }}>
              <Typography level="title-md" noWrap>
                {userName}
              </Typography>
            </Tooltip>
            <Tooltip title={userEmail} variant="soft" sx={{ zIndex: 13000 }}>
              <Typography
                level="body-xs"
                sx={{ color: "text.secondary" }}
                noWrap>
                {userEmail}
              </Typography>
            </Tooltip>
          </Box>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Open menu" size="icon">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <DropdownMenuContent align="start" className="w-56 z-[15000]">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onSelect={() => navigate("/admin/mi-cuenta")}
                    className="gap-2">
                    <AccountCircleIcon className="h-4 w-4" fontSize="small" />
                    <span>Mi perfil</span>
                  </DropdownMenuItem>

                  {checkPermission("ver_configuraciones") && (
                    <DropdownMenuItem
                      onSelect={() => navigate("/admin/configuraciones")}
                      className="gap-2">
                      <SettingsRoundedIcon
                        className="h-4 w-4"
                        fontSize="small"
                      />
                      <span>Configuraciones</span>
                      <DropdownMenuShortcut>Ctrl+,</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onSelect={() => navigate("/admin/help")}
                    className="gap-2">
                    <HelpCenterIcon className="h-4 w-4" fontSize="small" />
                    <span>Centro de ayuda</span>
                    <DropdownMenuShortcut>Ctrl+H</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={logoutHandler}
                  className="
                    gap-2
                    text-red-600 dark:text-red-400
                    focus:text-red-700 dark:focus:text-red-300
                    focus:bg-red-50 dark:focus:bg-red-950
                  ">
                  <LogoutRoundedIcon className="h-4 w-4" fontSize="small" />
                  <span>Cerrar sesión</span>
                  <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </Box>
      </Sheet>

      {/* Command Palette shadcn (Ctrl/⌘+K) */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Buscar módulos, clientes, activos…"
          value={commandQuery}
          onValueChange={setCommandQuery}
        />
        <CommandList>
          {!commandLoading && commandResults.length === 0 && (
            <CommandEmpty>Sin resultados por ahora…</CommandEmpty>
          )}

          {commandLoading && (
            <CommandGroup heading="Buscando…">
              <CommandItem disabled>Buscando resultados…</CommandItem>
            </CommandGroup>
          )}

          {!commandLoading && commandResults.length > 0 && (
            <CommandGroup heading="Resultados">
              {commandResults.map((r) => {
                const allowed =
                  userRole === "Admin" || !r.perm || checkPermission(r.perm);
                return (
                  <CommandItem
                    key={r.id || r.url}
                    disabled={!allowed}
                    value={`${r.title || ""} ${r.subtitle || ""}`}
                    onSelect={() => {
                      if (allowed && r.url) handleCommandNavigate(r.url);
                    }}>
                    {allowed ? (
                      <KindIcon kind={r.kind} />
                    ) : (
                      <LockRoundedIcon fontSize="small" />
                    )}
                    <span className="ml-2 truncate">{r.title}</span>
                    {r.subtitle && (
                      <span className="ml-2 text-xs text-muted-foreground truncate">
                        {r.subtitle}
                      </span>
                    )}
                    {!allowed && (
                      <span className="ml-auto text-[11px] text-red-500">
                        Sin permiso
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Atajos">
            <CommandItem
              onSelect={() => navigate("/admin/help")}
              value="Centro de ayuda">
              <HelpCenterIcon className="mr-2 h-4 w-4" />
              <span>Centro de ayuda</span>
              <CommandShortcut>Ctrl+H</CommandShortcut>
            </CommandItem>

            {checkPermission("ver_configuraciones") && (
              <CommandItem
                onSelect={() => navigate("/admin/configuraciones")}
                value="Configuraciones">
                <SettingsRoundedIcon className="mr-2 h-4 w-4" />
                <span>Configuraciones</span>
                <CommandShortcut>Ctrl+,</CommandShortcut>
              </CommandItem>
            )}

            <CommandItem
              onSelect={logoutHandler}
              value="Cerrar sesión"
              className="text-red-600 dark:text-red-400">
              <LogoutRoundedIcon className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
              <CommandShortcut>Ctrl+Q</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
