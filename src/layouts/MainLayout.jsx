import Box from "@mui/joy/Box";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import Sidebar from "../context/SideBar";
import Header from "../components/Header/Header";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbNameMap = {
    home: "Home",
    dashboard: "Dashboard",
    vehiculos: "Vehículos",
    "panel-vehiculos": "Registros",
    "registrar-uso": "Registrar",
    salida: "Salida",
    entrada: "Entrada",
    usuarios: "Usuarios",
    "mi-cuenta": "Mi Perfil",
    countries: "Países",
    cities: "Ciudades",
    parkings: "Estacionamientos",
  };

  const pathnames = location.pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter((x) => x);

  const buildPath = (index) =>
    "/admin/" + pathnames.slice(0, index + 1).join("/");

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
            {pathnames.map((value, index) => {
              const isLast = index === pathnames.length - 1;
              const to = buildPath(index);
              const label = breadcrumbNameMap[value] || value;
              return isLast ? (
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
              );
            })}
          </Breadcrumbs>
        </Box>
        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "start", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}>
          <Typography level="h2" component="h1">
            {breadcrumbNameMap[pathnames[pathnames.length - 1]] || "Inicio"}
          </Typography>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
