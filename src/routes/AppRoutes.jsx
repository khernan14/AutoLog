import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRoutes from "./auth.routes";
import EmpleadosRoutes from "./empleados.routes";
import DashboardRoutes from "./dashboard.routes";
import { AuthProvider } from "../context/AuthContext";
import ExpiredSessionOverlay from "../components/ExpiredSession/ExpiredSessionOverlay";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/* ✅ Ahora SÍ envuelto en BrowserRouter */}
        <ExpiredSessionOverlay />
        <Routes>
          <Route path="/auth/*" element={<AuthRoutes />} />
          <Route path="/uso-registros/*" element={<EmpleadosRoutes />} />
          <Route path="/admin/*" element={<DashboardRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
