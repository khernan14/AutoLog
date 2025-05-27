import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/RegisterForm/SearchBar";
import VehicleTable from "../../components/RegisterForm/VehicleTable";
// Aquí importarías tu función para obtener vehículos desde tu API
import { obtenerVehiculos } from "../../services/VehiculosService";

export default function Register() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  // Redirigir al formulario de registro de uso
  const handleRegisterClick = () => {
    navigate("/admin/panel-vehiculos/register");
  };

  // Filtrar vehículos basados en la búsqueda
  const filteredVehicles = vehicles.filter(
    (veh) =>
      veh.placa?.toLowerCase().includes(search.toLowerCase()) || // Filtra por placa
      veh.marca?.toLowerCase().includes(search.toLowerCase()) || // Filtra por marca
      veh.modelo?.toLowerCase().includes(search.toLowerCase()) // Filtra por modelo
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h4" mb={2}>
        Registro de uso de vehículos
      </Typography>
      <SearchBar onSearch={handleSearchChange} onAdd={handleRegisterClick} />
      <Box mt={3}>
        <VehicleTable vehicles={filteredVehicles} />
      </Box>
    </Box>
  );
}
