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

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="home" element={<Home />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="vehiculos" element={<Vehiculos />} />
        {/* <Route path="registrar-uso" element={<Empleado />} /> */}
        <Route path="mi-cuenta" element={<MyAccount />} />
        <Route path="panel-vehiculos" element={<Register />} />
        <Route path="panel-vehiculos/register" element={<RegisterForm />} />
        <Route path="reservas" element={<Reservas />} />
      </Route>
    </Routes>
  );
}
