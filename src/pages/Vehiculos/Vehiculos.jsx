import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  obtenerVehiculos,
  deleteVehiculo,
  addVehiculos,
  actualizarVehiculo,
  restoreVehiculo,
} from "../../services/VehiculosService";
import VehiculosTable from "../../components/VehiculosForm/VehiculosTable";
import VehiculoModal from "../../components/VehiculosForm/VehiculosModal";
import VehiculosToolBar from "../../components/VehiculosForm/VehiculosToolBar";
import { Box, CircularProgress, Typography, Button } from "@mui/joy";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editVehiculo, setEditVehiculo] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const loadVehiculos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerVehiculos();
      if (data) {
        setVehiculos(data);
      } else {
        setVehiculos([]);
        setError("No se pudo conectar con el servidor. Intenta más tarde.");
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
      setVehiculos([]);
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehiculos();
  }, [loadVehiculos]);

  const handleAddVehiculo = () => {
    if (vehiculos.length === 0) {
      toast.error(
        "No puedes agregar registros porque no tienes acceso a los vehículos."
      );
      return;
    }
    setEditVehiculo(null);
    setOpenModal(true);
  };

  const handleEdit = (vehiculo) => {
    if (vehiculos.length === 0) {
      toast.error(
        "No puedes editar registros porque no tienes acceso a los vehículos."
      );
      return;
    }
    setEditVehiculo(vehiculo);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteVehiculo(id);
    if (result && !result.error) {
      setVehiculos((prev) =>
        prev.map((u) => (u.id === id ? { ...u, estado: "Inactivo" } : u))
      );
      toast.success("Vehículo eliminado correctamente");
    }
  };

  const handleSubmitVehiculo = async (vehiculo) => {
    if (vehiculo.id) {
      await actualizarVehiculo(vehiculo.id, vehiculo);
    } else {
      await addVehiculos(vehiculo);
    }
    setOpenModal(false);
    setEditVehiculo(null);
    loadVehiculos();
  };

  const handleRestore = async (id) => {
    const result = await restoreVehiculo(id);
    if (result && !result.error) {
      setVehiculos((prev) =>
        prev.map((u) => (u.id === id ? { ...u, estado: "Disponible" } : u))
      );
      toast.success("Vehículo restaurado correctamente");
    } else {
      toast.error("Error al restaurar el vehículo");
    }
    loadVehiculos();
  };

  const filteredVehiculos = useMemo(() => {
    const search = searchText.toLowerCase();
    return (vehiculos || []).filter((u) => {
      const matchesStatus = showInactive ? true : u.estado === "Disponible";
      const matchesSearch =
        `${u.placa} ${u.marca} ${u.modelo} ${u.nombre_ubicacion}`
          .toLowerCase()
          .includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [vehiculos, showInactive, searchText]);

  return (
    <Box p={2}>
      <VehiculosToolBar
        onAdd={handleAddVehiculo}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
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
          <Button onClick={loadVehiculos} variant="outlined">
            Reintentar
          </Button>
        </Box>
      ) : (
        <VehiculosTable
          vehiculos={filteredVehiculos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          showInactive={showInactive}
          setShowInactive={setShowInactive}
        />
      )}

      <VehiculoModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditVehiculo(null);
        }}
        initialValues={editVehiculo || undefined}
        onSubmit={handleSubmitVehiculo}
      />
    </Box>
  );
}
