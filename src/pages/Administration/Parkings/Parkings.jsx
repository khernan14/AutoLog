import { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Typography, Sheet, Button, CircularProgress } from "@mui/joy";
import { toast } from "react-toastify";

import {
  getParkings,
  addParking,
  updateParking,
  deleteParking,
} from "../../../services/ParkingServices";

import ParkingsTable from "../../../components/Administration/Parkings/ParkingsTable";
import ParkingsModal from "../../../components/Administration/Parkings/ParkingsModal";
import ParkingsToolBar from "../../../components/Administration/Parkings/ParkingsToolBar";

export default function Parkings() {
  const [parkings, setParkings] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editParking, setEditParking] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadParkings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getParkings();
      setParkings(data);
    } catch (err) {
      console.error("Error al cargar estacionamientos:", err);
      const msg =
        err?.response?.status === 403
          ? "No tienes permisos para ver los estacionamientos."
          : "No se pudo conectar con el servidor. Intenta más tarde.";
      toast.error(msg);
      setError(msg);
      setParkings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParkings();
  }, [loadParkings]);

  const handleAddParking = () => {
    if (parkings.length === 0) {
      toast.error(
        "No puedes agregar estacionamientos porque no tienes permiso para ver los estacionamientos."
      );
      return;
    }
    setEditParking(null);
    setOpenModal(true);
  };

  const handleEdit = (parking) => {
    if (parkings.length === 0) {
      toast.error(
        "No puedes editar estacionamientos porque no tienes permiso para ver los estacionamientos."
      );
      return;
    }
    setEditParking(parking);
    setOpenModal(true);
  };

  const normalizeParking = (parking) => ({
    nombre_ubicacion: parking.nombre_ubicacion || parking.nombreUbicacion || "",
    id_ciudad:
      parking.id_ciudad || parking.idCiudad || parking.ciudadId || null,
  });

  const handleSubmitParking = async (parking) => {
    try {
      const payload = normalizeParking(parking);

      if (!payload.nombre_ubicacion || !payload.id_ciudad) {
        toast.warning("El nombre y la ciudad son obligatorios.");
        return;
      }

      if (parking.id && Number(parking.id) > 0) {
        await updateParking(parking.id, payload);
        toast.success("Estacionamiento actualizado correctamente");
      } else {
        await addParking(payload);
        toast.success("Estacionamiento agregado correctamente");
      }

      setOpenModal(false);
      setEditParking(null);
      loadParkings();
    } catch (error) {
      toast.error("Error al guardar el estacionamiento");
      console.error("handleSubmitParking error:", error);
    }
  };

  const handleDeleteParking = async (id) => {
    const confirm = window.confirm(
      "¿Estás seguro de eliminar este estacionamiento?"
    );
    if (!confirm) return;

    try {
      const result = await deleteParking(id);
      if (result) {
        toast.success("Estacionamiento eliminado");
        loadParkings();
      } else {
        toast.error("No se pudo eliminar el estacionamiento");
      }
    } catch (error) {
      toast.error("Error al eliminar el estacionamiento");
      console.error("DeleteParking error:", error);
    }
  };

  const filteredParkings = useMemo(() => {
    const search = searchText.toLowerCase();
    return (parkings || []).filter((p) => {
      const name = p.nombre_ubicacion?.toLowerCase() || "";
      const city = p.ciudad?.toLowerCase() || "";
      return name.includes(search) || city.includes(search);
    });
  }, [parkings, searchText]);

  return (
    <Box p={2}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Gestión de Estacionamientos
      </Typography>

      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md", mb: 2 }}>
        <ParkingsToolBar
          onAdd={handleAddParking}
          onSearch={(text) => setSearchText(text)}
        />
      </Sheet>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={4}>
          <Typography color="danger" level="body-md" mb={2}>
            {error}
          </Typography>
          <Button onClick={loadParkings} variant="outlined">
            Reintentar
          </Button>
        </Box>
      ) : (
        <>
          <ParkingsTable
            parkings={filteredParkings}
            onEdit={handleEdit}
            onDelete={handleDeleteParking}
          />
          <ParkingsModal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setEditParking(null);
            }}
            initialValues={editParking || undefined}
            onSubmit={handleSubmitParking}
          />
        </>
      )}
    </Box>
  );
}
