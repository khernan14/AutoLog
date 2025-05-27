import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { STORAGE_KEYS } from "../../config/variables";
import { obtenerVehiculos } from "../../services/VehiculosService";
import { obtenerRegistroActivo } from "../../services/RegistrosService";
import Swal from "sweetalert2";
import EmpleadoForm from "../../components/Employee/EmpleadosForm/EmpleadosForm";
import FlashMessage from "../../utils/FlashMessage";
import { EmpleadoContainer } from "./Empleado.styles";

export default function Empleado() {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehiculos, setVehiculos] = useState([]);
  const [mensaje, setMensaje] = useState(location.state?.mensaje);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));

    // Carga de datos
    const loadData = async () => {
      try {
        const [vehiculosData, registroData] = await Promise.all([
          obtenerVehiculos(),
          obtenerRegistroActivo(user.id),
        ]);

        if (vehiculosData) setVehiculos(vehiculosData);
        if (registroData?.id_registro) {
          Swal.fire({
            title: "Registro Activo",
            text: `Tienes un registro pendiente en ${registroData.placa}`,
            icon: "warning",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [navigate]);

  const handleActions = {
    logout: () => {
      localStorage.clear();
      navigate("/auth/login");
    },
    register: () => navigate("/uso-registros/register"),
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  return (
    <EmpleadoForm
      vehiculos={vehiculos}
      onAction={handleActions}
      onLogout={cerrarSesion}
    />
  );
}
