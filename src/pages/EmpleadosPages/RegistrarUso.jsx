import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../../config/variables";
import { obtenerVehiculos } from "../../services/VehiculosService";
import { obtenerRegistroActivo } from "../../services/RegistrosService";
import RegisterForm from "../../components/Employee/Register/RegisterForm/RegisterForm";
import { EmpleadoContainer } from "./Empleado.styles";

export default function RegistrarUso() {
  const [state, setState] = useState({
    usuario: null,
    registroActivo: null,
    vehiculos: [],
    loading: true,
  });

  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      try {
        const [registro, vehiculos] = await Promise.all([
          obtenerRegistroActivo(user.id),
          obtenerVehiculos(),
        ]);

        setState({
          usuario: user,
          registroActivo: registro?.id_registro ? registro : null,
          vehiculos: vehiculos || [],
          loading: false,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  return (
    <EmpleadoContainer>
      <RegisterForm {...state} />
    </EmpleadoContainer>
  );
}
