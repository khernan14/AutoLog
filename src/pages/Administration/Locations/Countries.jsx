import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Box, CircularProgress, Typography, Button } from "@mui/joy";

import {
  getCountries,
  addCountry,
  updateCountry,
  deleteCountry,
} from "../../../services/LocationServices";

import CountriesToolBar from "../../../components/Administration/Locations/Countries/CountriesToolBar";
import CountriesTable from "../../../components/Administration/Locations/Countries/CountriesTable";
import CountriesModal from "../../../components/Administration/Locations/Countries/CountriesModal";

import { useAuth } from "../../../context/AuthContext";

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editCountry, setEditCountry] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.rol?.toLowerCase() === "admin";

  const loadCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCountries();
      if (data) {
        setCountries(data);
      } else {
        setCountries([]);
        setError("No se pudo conectar con el servidor. Intenta más tarde.");
      }
    } catch (err) {
      console.error("loadCountries error:", err);
      setCountries([]);
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleAddCountry = () => {
    if (countries.length === 0 && !isAdmin) {
      toast.error(
        "No puedes agregar países porque no tienes permiso para ver los países."
      );
      return;
    }
    setEditCountry(null);
    setOpenModal(true);
  };

  const handleEdit = (country) => {
    if (countries.length === 0) {
      toast.error(
        "No puedes editar países porque no tienes permiso para ver los países."
      );
      return;
    }
    setEditCountry(country);
    setOpenModal(true);
  };

  const handleSubmitCountry = async (country) => {
    try {
      const payload = {
        nombre: country.nombre?.trim() || "",
        id: country.id || null,
      };

      if (!payload.nombre) {
        toast.error("El nombre del país es obligatorio");
        return;
      }

      if (payload.id && Number(payload.id) > 0) {
        await updateCountry(payload.id, payload);
        toast.success("País actualizado correctamente");
      } else {
        await addCountry(payload);
        toast.success("País agregado correctamente");
      }

      setOpenModal(false);
      setEditCountry(null);
      loadCountries();
    } catch (error) {
      toast.error("Error al agregar o actualizar el país");
      console.error("handleSubmitCountry error:", error);
    }
  };

  const filteredCountries = useMemo(() => {
    const search = searchText.toLowerCase();
    return (countries || []).filter((u) =>
      (u.nombre || "").toLowerCase().includes(search)
    );
  }, [countries, searchText]);

  return (
    <Box p={2}>
      <CountriesToolBar
        onAdd={handleAddCountry}
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
          <Button onClick={loadCountries} variant="outlined">
            Reintentar
          </Button>
        </Box>
      ) : (
        <CountriesTable countries={filteredCountries} onEdit={handleEdit} />
      )}

      <CountriesModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditCountry(null);
        }}
        initialValues={editCountry || undefined}
        onSubmit={handleSubmitCountry}
      />
    </Box>
  );
}
