import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import Sidebar from "../context/SideBar";
import Header from "../components/Header/Header";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathTitles = {
    "/admin/home": { title: "INICIO", breadcrumb: ["Dashboard", "Inicio"] },
    "/admin/dashboard": { title: "DASHBOARD", breadcrumb: ["Dashboard"] },
    "/admin/vehiculos": {
      title: "Vehículos",
      breadcrumb: ["Dashboard", "Vehículos"],
    },
    "/admin/usuarios": {
      title: "Usuarios",
      breadcrumb: ["Dashboard", "Usuarios"],
    },
    "/admin/registrar-uso": {
      title: "Registrar Uso",
      breadcrumb: ["Dashboard", "Registrar Uso"],
    },
    "/admin/mi-cuenta": {
      title: "Mi Perfil",
      breadcrumb: ["Dashboard", "Mi Perfil"],
    },
  };

  const current = pathTitles[location.pathname] || {
    title: "Página",
    breadcrumb: ["Dashboard"],
  };

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
          overflowY: "auto", // <--- esto es importante
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
            {current.breadcrumb.slice(0, -1).map((crumb, index) => (
              <Link
                key={index}
                underline="hover"
                color="neutral"
                sx={{ fontSize: 12, fontWeight: 500 }}>
                {crumb}
              </Link>
            ))}
            <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
              {current.breadcrumb[current.breadcrumb.length - 1]}
            </Typography>
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
            {current.title}
          </Typography>

          <Button
            color="primary"
            startDecorator={<DownloadRoundedIcon />}
            size="sm">
            Download PDF
          </Button>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
