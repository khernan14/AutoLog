// src/layouts/MainLayout.jsx
import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import Sidebar from "../context/SideBar";
import Header from "../components/Header/Header";

function capitalizeNice(s = "") {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).replaceAll("-", " ");
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Mapeo base de segmentos -> etiqueta
  const LABELS = {
    // Raíces
    home: "Inicio",
    dashboard: "Dashboard",
    search: "Búsqueda",
    // Vehículos / registros / reportes
    vehiculos: "Vehículos",
    "panel-vehiculos": "Registros",
    reservas: "Reservas",
    reports: "Reportes",
    // Gestión
    clientes: "Compañías",
    countries: "Países",
    cities: "Ciudades",
    parkings: "Estacionamientos",
    sites: "Sites",
    // Inventario
    inventario: null, // <- omite el nodo "inventario" en el breadcrumb (solo estructura)
    bodegas: "Bodegas",
    activos: "Activos",
    // Sistema
    usuarios: "Gestionar Usuarios",
    permissions: "Roles",
    // Soporte & ayuda (admin)
    support: "Soporte y Ayuda",
    faqs: "Gestionar FAQs",
    tutorials: "Gestionar Tutoriales",
    changelogs: "Gestionar Novedades",
    services: "Estados de Servicio",
    // Centro de ayuda (usuario)
    help: "Centro de Ayuda",
    status: "Estado del sistema",
    changelog: "Novedades",
    // Otros
    "mi-cuenta": "Mi Perfil",
    configuraciones: "Configuraciones",
    // Vista previa especial
    preview: "Vista previa",
    info: "Info",
    // Subpáginas comunes
    registrar: "Registrar",
    salida: "Salida",
    entrada: "Entrada",
  };

  // Construye segmentos del path después de /admin
  const pathnames = location.pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter(Boolean);

  const buildPath = (idx) => "/admin/" + pathnames.slice(0, idx + 1).join("/");

  // Reglas especiales por ruta
  const getLabelForSegment = (seg, index) => {
    // Si es un número -> #ID
    if (/^\d+$/.test(seg)) return `#${seg}`;

    // Vista previa: /admin/preview/:kind/:id
    if (pathnames[0] === "preview") {
      if (index === 0) return LABELS.preview;
      if (index === 1) {
        // kind más legible
        const kind = String(seg || "").toLowerCase();
        const friendly =
          {
            asset: "Activo",
            company: "Compañía",
            site: "Site",
            warehouse: "Bodega",
            vehicle: "Vehículo",
            city: "Ciudad",
            country: "País",
            parking: "Estacionamiento",
            record: "Registro",
            so: "Sales Order",
            faq: "FAQ",
            tutorial: "Tutorial",
          }[kind] || capitalizeNice(kind);
        return friendly;
      }
      if (index === 2 && /^\d+$/.test(seg)) return `#${seg}`;
      return capitalizeNice(seg);
    }

    // Cliente detalle: /admin/clientes/:id/...
    if (pathnames[0] === "clientes") {
      if (index === 0) return LABELS.clientes;
      if (index === 1 && /^\d+$/.test(seg)) return `Compañía #${seg}`;
      // "info" u otros
      if (index >= 2 && LABELS[seg] !== undefined) return LABELS[seg] || null;
      if (index >= 2) return capitalizeNice(seg);
    }

    // Inventario: omitimos "inventario" como crumb clickeable
    if (seg === "inventario") return LABELS.inventario; // null => no se pinta

    // Support (admin) anidado
    if (pathnames[0] === "support") {
      if (index === 0) return LABELS.support;
      return LABELS[seg] ?? capitalizeNice(seg);
    }

    // Help (usuario) anidado
    if (pathnames[0] === "help") {
      if (index === 0) return LABELS.help;
      return LABELS[seg] ?? capitalizeNice(seg);
    }

    // Genérico: intenta map, si no capitaliza
    if (LABELS[seg] !== undefined) return LABELS[seg] || null;
    return capitalizeNice(seg);
  };

  // Construye crumbs, omitiendo los que devuelven null (inventario)
  const crumbs = pathnames
    .map((seg, idx) => {
      const label = getLabelForSegment(seg, idx);
      if (!label) return null; // omite
      const to = buildPath(idx);
      const isLast = idx === pathnames.length - 1;
      return { label, to, isLast };
    })
    .filter(Boolean);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        className="MainContent"
        sx={{
          px: { xs: 2, md: 6 },
          pt: {
            xs: "calc(12px + var(--Header-height))",
            sm: "calc(12px + var(--Header-height))",
            md: 3,
          },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          overflowY: "auto",
          gap: 1,
        }}>
        {/* Breadcrumbs (sin título genérico) */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Breadcrumbs
            size="sm"
            aria-label="breadcrumbs"
            separator={<ChevronRightRoundedIcon fontSize="sm" />}
            sx={{ pl: 0 }}>
            <Link
              underline="none"
              color="neutral"
              onClick={() => navigate("/admin/home")}
              sx={{ cursor: "pointer" }}>
              <HomeRoundedIcon />
            </Link>

            {crumbs.map(({ label, to, isLast }) =>
              isLast ? (
                <Typography
                  key={to}
                  color="primary"
                  sx={{ fontWeight: 500, fontSize: 12 }}>
                  {label}
                </Typography>
              ) : (
                <Link
                  key={to}
                  underline="hover"
                  color="neutral"
                  onClick={() => navigate(to)}
                  sx={{ cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                  {label}
                </Link>
              )
            )}
          </Breadcrumbs>
        </Box>

        {/* Eliminado el título global para no duplicar el H1 de cada página */}
        <Outlet />
      </Box>
    </Box>
  );
}
