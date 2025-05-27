import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/joy";
import { obtenerRegistroActivo } from "../../services/RegistrosService";
import { STORAGE_KEYS } from "../../config/variables";
import Swal from "sweetalert2";
import SalidaForm from "../../components/RegisterForm/RegisterSalidaForm";
import { obtenerVehiculos } from "../../services/VehiculosService";
import RegresoForm from "../../components/RegisterForm/RegisterRegresoForm";

export default function RegisterForm() {
  const [usuario, setUsuario] = useState(null);
  const [registroActivo, setRegistroActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsuario(parsedUser);

      obtenerRegistroActivo(parsedUser.id)
        .then((data) => {
          if (data) {
            setRegistroActivo(data);

            // Mostrar SweetAlert si tiene un registro activo
            Swal.fire({
              title: "Tienes un registro pendiente",
              text: "Debes registrar el regreso del vehículo antes de hacer otra salida.",
              icon: "info",
              confirmButtonText: "Entendido",
            });
          }
        })
        .catch((error) => {
          console.error("Error al obtener registro activo:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.warn("Usuario no encontrado en localStorage");
      setLoading(false);
    }
    const fetchVehicles = async () => {
      try {
        const response = await obtenerVehiculos(); // esta debe ser tu función de fetch
        setVehicles(response); // guarda los datos en el estado
      } catch (error) {
        console.error("Error al obtener vehículos:", error);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" mb={2}>
        {registroActivo
          ? "Registrar regreso de vehículo"
          : "Registrar salida de vehículo"}
      </Typography>

      {registroActivo ? (
        <RegresoForm registro={registroActivo} usuario={usuario} />
      ) : (
        <SalidaForm vehicles={vehicles} usuario={usuario} />
      )}
    </Box>
  );
}
