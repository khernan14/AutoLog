// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { SoftRefreshProvider } from "@/context/SoftRefreshContext";
import AuthRoutes from "./auth.routes";
import QrcodeRoutes from "./qrcode.routes";
import DashboardRoutes from "./dashboard.routes";
import ExpiredSessionOverlay from "../components/ExpiredSession/ExpiredSessionOverlay";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoftRefreshProvider>
          <Routes>
            {/* Rutas de autenticación (públicas pero bloqueadas si ya estás logueado) */}
            <Route
              path="/auth/*"
              element={
                <PublicRoute>
                  <AuthRoutes />
                </PublicRoute>
              }
            />

            {/* Rutas públicas reales (QR activos, etc.) */}
            <Route path="/public/*" element={<QrcodeRoutes />} />

            {/* Rutas protegidas del admin */}
            <Route
              path="/admin/*"
              element={
                <PrivateRoute>
                  <ExpiredSessionOverlay>
                    <DashboardRoutes />
                  </ExpiredSessionOverlay>
                </PrivateRoute>
              }
            />
          </Routes>
        </SoftRefreshProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
