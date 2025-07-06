import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRoutes from "./auth.routes"; // Tus rutas de autenticación
import DashboardRoutes from "./dashboard.routes"; // Tus rutas protegidas
import { AuthProvider } from "../context/AuthContext"; // Tu proveedor de autenticación
import ExpiredSessionOverlay from "../components/ExpiredSession/ExpiredSessionOverlay"; // Tu componente de overlay

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ExpiredSessionOverlay ahora envuelve las Rutas para controlar el acceso */}
        <ExpiredSessionOverlay>
          <Routes>
            {/* Rutas de Autenticación (Públicas) */}
            {/* Estas rutas se manejarán dentro de AuthRoutes */}
            <Route path="/auth/*" element={<AuthRoutes />} />

            {/* Rutas Protegidas (DashboardRoutes) */}
            {/* El acceso a estas rutas será controlado por ExpiredSessionOverlay */}
            <Route path="/admin/*" element={<DashboardRoutes />} />

            {/* Puedes añadir una ruta por defecto o 404 aquí si lo deseas */}
            {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
          </Routes>
        </ExpiredSessionOverlay>
      </AuthProvider>
    </BrowserRouter>
  );
}
