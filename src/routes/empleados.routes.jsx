import { Routes, Route } from "react-router-dom";
import Empleado from "@/pages/EmpleadosPages/Empleado";
import RegistrarUso from "@/pages/EmpleadosPages/RegistrarUso";
// import Register from "@/pages/Auth/Register";
// import RecoverPassword from "@/pages/Auth/RecoverPassword";

export default function EmpleadosRoutes() {
  return (
    <Routes>
      <Route path="panel-vehiculos" element={<Empleado />} />
      <Route path="register" element={<RegistrarUso />} />
    </Routes>
  );
}
