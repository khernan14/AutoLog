import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext"; // Tu proveedor de autenticación
import { SoftRefreshProvider } from "@/context/SoftRefreshContext";
import AuthRoutes from "./auth.routes"; // Tus rutas de autenticación
import QrcodeRoutes from "./qrcode.routes"; // Tus rutas públicas
import DashboardRoutes from "./dashboard.routes"; // Tus rutas protegidas
import ExpiredSessionOverlay from "../components/ExpiredSession/ExpiredSessionOverlay"; // Tu componente de overlay

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoftRefreshProvider>
          <Routes>
            {/* públicas */}
            <Route path="/auth/*" element={<AuthRoutes />} />
            <Route path="/public/*" element={<QrcodeRoutes />} />

            {/* protegidas */}
            <Route
              path="/admin/*"
              element={
                <ExpiredSessionOverlay>
                  <DashboardRoutes />
                </ExpiredSessionOverlay>
              }
            />
          </Routes>
        </SoftRefreshProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
