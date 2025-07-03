import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Box, CircularProgress, Typography, Button } from "@mui/joy";

import {
  getCities,
  addCity,
  updateCity,
  deleteCity,
} from "../../../services/LocationServices";

import CitiesToolBar from "../../../components/Administration/Locations/Cities/CitiesToolBar";
import CitiesTable from "../../../components/Administration/Locations/Cities/CitiesTable";
import CitiesModal from "../../../components/Administration/Locations/Cities/CitiesModal";

import { useAuth } from "../../../context/AuthContext";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editCity, setEditCity] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { user } = useAuth();
  const esAdmin = user?.rol?.toLowerCase() === "admin";

  const loadCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCities();
      if (data) {
        setCities(data);
      } else {
        setCities([]);
        setError("No se pudo obtener la lista de ciudades.");
      }
    } catch (err) {
      console.error("Error al cargar ciudades:", err);
      const msg =
        err?.response?.status === 403
          ? "No tienes permisos para ver las ciudades."
          : "No se pudo conectar con el servidor. Intenta más tarde.";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const handleAddCity = () => {
    if (cities.length === 0 && !esAdmin) {
      toast.error(
        "No puedes agregar ciudades porque no tienes permiso para ver las ciudades."
      );
      return;
    }
    setEditCity(null);
    setOpenModal(true);
  };

  const handleEdit = (city) => {
    if (cities.length === 0) {
      toast.error(
        "No puedes editar ciudades porque no tienes permiso para ver las ciudades."
      );
      return;
    }
    setEditCity(city);
    setOpenModal(true);
  };

  const handleSubmitCity = async (city) => {
    try {
      const cityPayload = {
        nombre: city.ciudad || city.nombre || "",
        id_pais: city.id_pais || city.idPais || city.paisId || null,
      };

      if (!cityPayload.nombre || !cityPayload.id_pais) {
        toast.error("El nombre y país son obligatorios");
        return;
      }

      if (city.id && Number(city.id) > 0) {
        await updateCity(city.id, cityPayload);
        toast.success("Ciudad actualizada correctamente");
      } else {
        await addCity(cityPayload);
        toast.success("Ciudad agregada correctamente");
      }

      setOpenModal(false);
      setEditCity(null);
      loadCities();
    } catch (error) {
      toast.error("Error al agregar o actualizar la ciudad");
      console.error("handleSubmitCity error:", error);
    }
  };

  const handleDeleteCity = async (id) => {
    try {
      await deleteCity(id);
      toast.success("Ciudad eliminada");
      loadCities();
    } catch (error) {
      toast.error("Error al eliminar la ciudad");
      console.error("DeleteCity error:", error);
    }
  };

  const filteredCities = useMemo(() => {
    const search = searchText.toLowerCase();
    return (cities || []).filter((u) => {
      const cityName = (u.ciudad || u.nombre || "").toLowerCase();
      const countryName = (u.pais || "").toLowerCase();
      return cityName.includes(search) || countryName.includes(search);
    });
  }, [cities, searchText]);

  return (
    <Box p={2}>
      <CitiesToolBar
        onAdd={handleAddCity}
        onSearch={(text) => setSearchText(text)}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={4}>
          <Typography color="danger" level="body-md" mb={2}>
            {error}
          </Typography>
          <Button onClick={loadCities} variant="outlined">
            Reintentar
          </Button>
        </Box>
      ) : (
        <>
          <CitiesTable
            cities={filteredCities}
            onEdit={handleEdit}
            onDelete={handleDeleteCity}
            onAdd={handleAddCity}
          />
          <CitiesModal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setEditCity(null);
            }}
            initialValues={editCity || undefined}
            onSubmit={handleSubmitCity}
          />
        </>
      )}
    </Box>
  );
}
