import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GlobalStyles from "@mui/joy/GlobalStyles";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Input, { inputClasses } from "@mui/joy/Input";
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
import Tooltip from "@mui/joy/Tooltip";
import { useColorScheme } from "@mui/joy/styles";

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
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";

import { globalSearch } from "../services/search.api"; // API /api/search

import { useAuth } from "./AuthContext";
import { closeSidebar } from "../utils/ToggleSidebar";
import logoLight from "../assets/newLogoTecnasaBlack.png";
import logoDark from "../assets/newLogoTecnasa.png";
import Swal from "sweetalert2";

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

  const userName = userData?.nombre || "Usuario";
  const userEmail = userData?.email || "usuario@test.com";
  const userRole = userData?.rol;

  const checkPermission = (permiso) =>
    userRole === "Admin" || (permiso ? hasPermiso(permiso) : true);

  // =========================
  // Secciones (con 'perm' para búsqueda local)
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

  // Index plano para fallback local
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
  }, [
    navItems,
    managementItems,
    inventoryItems,
    systemItems,
    supportAndHelpItems,
  ]);

  // =========================
  // Búsqueda universal (Joy-only)
  // =========================
  const [q, setQ] = React.useState("");
  const [openSearch, setOpenSearch] = React.useState(false);
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef(null);
  const inputRootRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const abortRef = React.useRef(null);
  const debounceRef = React.useRef(null);

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

  const searchAll = React.useCallback(
    async (text) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoadingSearch(true);
      try {
        const data = await globalSearch(text, {
          limit: 10,
          signal: controller.signal,
        });
        const normalized = Array.isArray(data) ? data : [];
        setResults(normalized);
        setOpenSearch(true);
      } catch (_e) {
        const local = simpleLocalRouteSearch(text);
        setResults(local);
        setOpenSearch(true);
      } finally {
        setLoadingSearch(false);
      }
    },
    [simpleLocalRouteSearch]
  );

  const onChangeSearch = (e) => {
    const value = e.target.value;
    setQ(value);
    setActiveIndex(-1);
    clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setOpenSearch(false);
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchAll(value.trim()), 250);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.matchMedia("(max-width: 768px)").matches) {
      closeSidebar();
    }
  };

  const onKeyDownSearch = (e) => {
    if (e.key === "Escape") {
      setOpenSearch(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const term = (q || "").trim();
      if (!term) return;

      // si quieres auto-abrir exacto y único:
      const allowed = (r) =>
        userRole === "Admin" || !r.perm || hasPermiso(r.perm);
      const exacts = (results || []).filter((r) => r.exact && allowed(r));

      if (exacts.length === 1) {
        navigate(exacts[0].url);
        setOpenSearch(false);
        setQ("");
        return;
      }

      // por defecto -> página de resultados
      navigate(`/admin/search?q=${encodeURIComponent(term)}`);
      setOpenSearch(false);
    }

    if (!openSearch || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    }
  };

  // Ctrl/⌘ + K → enfocar buscador
  React.useEffect(() => {
    const onGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpenSearch(
          q.trim().length >= 2 && (results.length > 0 || loadingSearch)
        );
      }
    };
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, [q, results.length, loadingSearch]);

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

  const currentPath = location.pathname;

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

      {/* Búsqueda (Joy-only, dropdown absoluto) */}
      <Box
        ref={containerRef}
        sx={{
          display: { xs: "none", sm: "block" },
          position: "relative",
        }}>
        <Tooltip
          title="Buscar módulos y datos… (Ctrl/⌘+K)"
          variant="soft"
          sx={{ zIndex: 13000 }}>
          <Input
            ref={inputRootRef}
            value={q}
            onChange={onChangeSearch}
            onKeyDown={onKeyDownSearch}
            onFocus={() =>
              q.trim().length >= 2 && results.length && setOpenSearch(true)
            }
            onBlur={() => setTimeout(() => setOpenSearch(false), 120)}
            startDecorator={<SearchRoundedIcon />}
            placeholder="Buscar módulos y datos… (Ctrl/⌘+K)"
            slotProps={{
              input: { ref: inputRef },
            }}
            sx={{
              [`& .${inputClasses.input}`]: { pr: 1 },
            }}
          />
        </Tooltip>

        {openSearch && (
          <Sheet
            variant="outlined"
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "calc(100% + 8px)",
              borderRadius: "md",
              p: 0.5,
              bgcolor: "background.body",
              boxShadow: "lg",
              zIndex: 13000,
              maxHeight: 360,
              overflowY: "auto",
            }}
            onMouseDown={(e) => e.preventDefault()} // no cerrar por mousedown para permitir click
          >
            {loadingSearch ? (
              <List sx={{ p: 0.5 }}>
                {[...Array(4)].map((_, i) => (
                  <ListItem key={i}>
                    <Typography level="body-sm">Buscando…</Typography>
                  </ListItem>
                ))}
              </List>
            ) : results.length === 0 ? (
              <Box sx={{ p: 1 }}>
                <Typography level="body-sm" color="neutral">
                  Sin resultados
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {results.map((r, idx) => {
                  const allowed =
                    userRole === "Admin" || !r.perm || hasPermiso(r.perm);
                  const content = (
                    <ListItemButton
                      key={r.id || r.url || idx}
                      selected={idx === activeIndex}
                      disabled={!allowed}
                      onClick={() => {
                        if (allowed && r.url) {
                          handleNavigate(r.url);
                          setOpenSearch(false);
                          setQ("");
                        }
                      }}
                      sx={{
                        borderRadius: "sm",
                        "&[aria-disabled='true']": {
                          opacity: 0.5,
                          cursor: "not-allowed",
                        },
                      }}>
                      <ListItemDecorator>
                        {allowed ? (
                          <KindIcon kind={r.kind} />
                        ) : (
                          <LockRoundedIcon fontSize="small" />
                        )}
                      </ListItemDecorator>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography level="title-sm" noWrap>
                          {r.title}
                        </Typography>
                        {r.subtitle && (
                          <Typography level="body-xs" color="neutral" noWrap>
                            {r.subtitle}
                          </Typography>
                        )}
                      </Box>
                    </ListItemButton>
                  );

                  return allowed ? (
                    <ListItem key={idx} sx={{ p: 0 }}>
                      {content}
                    </ListItem>
                  ) : (
                    <Tooltip
                      key={idx}
                      title="No tienes permiso para acceder"
                      variant="soft"
                      placement="left"
                      sx={{ zIndex: 13000 }}>
                      <ListItem sx={{ p: 0 }}>{content}</ListItem>
                    </Tooltip>
                  );
                })}
              </List>
            )}
          </Sheet>
        )}
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
            <Typography level="body-xs" sx={{ color: "text.secondary" }} noWrap>
              {userEmail}
            </Typography>
          </Tooltip>
        </Box>

        <Dropdown>
          <Tooltip
            title="Menú contextual"
            variant="soft"
            sx={{ zIndex: 13000 }}>
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

          <Menu
            placement="top-start"
            disablePortal={false}
            sx={{ zIndex: 13000 }}>
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
