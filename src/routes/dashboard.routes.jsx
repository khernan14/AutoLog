// src/routes/dashboard.routes.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Usuarios from "@/pages/Users/Users";
import Vehiculos from "@/pages/Vehiculos/Vehiculos";
import Register from "@/pages/Register/Register";
import Home from "@/pages/Dashboard/Home";
import MyAccount from "../pages/Users/MyAccount/MyAccount";
import RegisterForm from "../pages/Register/RegisterForm";
import Reservas from "../pages/Register/Reservas";
import Countries from "../pages/Administration/Locations/Countries";
import Cities from "../pages/Administration/Locations/Cities";
import Parkings from "../pages/Administration/Parkings/Parkings";
import Permissions from "../pages/Administration/Permissions/Permissions";
import NotificationGroupsPage from "../pages/Administration/NotificationGroups/NotificationGroupsPage";
import Reports from "../pages/Reports/ReportsPage.jsx";
import HelpPage from "../pages/HelpPage/HelpPage.jsx";
import FAQsAdminPage from "../pages/SoporteAdmin/FAQsAdminPage.jsx";
import ConfigPage from "../pages/Configuraciones/ConfigPage.jsx";
import ClientesList from "../pages/Clientes/ClientesList.jsx";
import ClienteDetail from "../pages/Clientes/ClienteDetail.jsx";
import SitesList from "../pages/Clientes/SitesList.jsx";
import BodegasList from "../pages/Inventario/BodegasList.jsx";
import BodegaDetail from "../pages/Inventario/BodegaDetail.jsx";
import ActivosList from "../pages/Inventario/ActivosList.jsx";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="home" element={<Home />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="vehiculos" element={<Vehiculos />} />
        <Route path="mi-cuenta" element={<MyAccount />} />
        <Route path="panel-vehiculos" element={<Register />} />
        <Route path="panel-vehiculos/register" element={<RegisterForm />} />
        <Route path="reservas" element={<Reservas />} />

        {/* Administración */}
        <Route path="countries" element={<Countries />} />
        <Route path="cities" element={<Cities />} />
        <Route path="parkings" element={<Parkings />} />
        <Route path="permissions" element={<Permissions />} />
        <Route
          path="notificacion-grupos"
          element={<NotificationGroupsPage />}
        />
        <Route path="reports" element={<Reports />} />
        <Route path="soporte" element={<HelpPage />} />
        <Route path="faqs" element={<FAQsAdminPage />} />
        <Route path="configuraciones" element={<ConfigPage />} />

        {/* Clientes */}
        <Route path="clientes" element={<ClientesList />} />
        <Route path="clientes/:id/*" element={<ClienteDetail />} />
        <Route path="sites" element={<SitesList />} />

        {/* Inventario (ANIDADO) */}
        <Route path="inventario">
          <Route path="bodegas">
            <Route index element={<BodegasList />} />
            <Route path=":id" element={<BodegaDetail />} />
          </Route>
          <Route path="activos" element={<ActivosList />} />
        </Route>
      </Route>
    </Routes>
  );
}
