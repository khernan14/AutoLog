import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Box, CircularProgress, Typography, Button, Alert } from "@mui/joy"; // Añadido Alert
import Swal from "sweetalert2"; // Para las confirmaciones

import {
  getCities,
  addCity,
  updateCity,
  deleteCity,
} from "../../../services/LocationServices"; // Asegúrate de que la ruta sea correcta

import CitiesToolBar from "../../../components/Administration/Locations/Cities/CitiesToolBar"; // Asegúrate de que la ruta sea correcta
import CitiesTable from "../../../components/Administration/Locations/Cities/CitiesTable"; // Asegúrate de que la ruta sea correcta
import CitiesModal from "../../../components/Administration/Locations/Cities/CitiesModal"; // Asegúrate de que la ruta sea correcta

import { useAuth } from "../../../context/AuthContext"; // Asegúrate de que la ruta sea correcta

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true); // Inicializar en true para la carga inicial
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editCity, setEditCity] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { userData, checkingSession, hasPermiso } = useAuth(); // Obtener userData, checkingSession y hasPermiso
  const esAdmin = userData?.rol?.toLowerCase() === "admin";

  // Función auxiliar para verificar permisos (Admin o permiso específico)
  const canPerformAction = useCallback(
    (permissionName) => {
      return esAdmin || hasPermiso(permissionName);
    },
    [esAdmin, hasPermiso]
  );

  // Carga de ciudades con manejo de permisos y estado de sesión
  const loadCities = useCallback(async () => {
    // Si aún estamos verificando la sesión, no hacemos nada.
    if (checkingSession) {
      setLoading(true); // Mantener el spinner mientras se verifica
      return;
    }

    // Verificar permiso para VER ciudades
    if (!canPerformAction("ver_ciudades")) {
      setError("No tienes permisos para ver la lista de ciudades.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      const data = await getCities();
      if (data) {
        setCities(data);
      } else {
        setError("No se pudo obtener la lista de ciudades.");
      }
    } catch (err) {
      console.error("Error al cargar ciudades:", err);
      // El mensaje de error ya se establece en el catch de arriba, no es necesario un toast aquí.
      // El toast.error(msg) que tenías antes se movió a la lógica de error general.
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canPerformAction]); // Dependencias: checkingSession, canPerformAction

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  // --- Handlers de acciones con lógica de permisos ---

  const handleAddCity = () => {
    if (!canPerformAction("crear_ciudades")) {
      // Permiso específico para crear
      toast.error("No tienes permisos para agregar ciudades.");
      return;
    }
    setEditCity(null);
    setOpenModal(true);
  };

  const handleEdit = (city) => {
    if (!canPerformAction("editar_ciudades")) {
      // Permiso específico para editar
      toast.error("No tienes permisos para editar ciudades.");
      return;
    }
    setEditCity(city);
    setOpenModal(true);
  };

  const handleSubmitCity = async (city) => {
    // Permiso para crear o editar
    if (!city.id && !canPerformAction("crear_ciudades")) {
      toast.error("No tienes permisos para crear ciudades.");
      return;
    }
    if (city.id && !canPerformAction("editar_ciudades")) {
      toast.error("No tienes permisos para editar ciudades.");
      return;
    }

    try {
      const cityPayload = {
        nombre: city.ciudad || city.nombre || "", // Ajuste para flexibilidad en el nombre del campo
        id_pais: city.id_pais || city.idPais || city.paisId || null, // Ajuste para flexibilidad en el nombre del campo
      };

      if (!cityPayload.nombre || !cityPayload.id_pais) {
        toast.error("El nombre y país son obligatorios");
        return;
      }

      if (city.id && Number(city.id) > 0) {
        const result = await updateCity(city.id, cityPayload);
        if (result && !result.error) {
          toast.success("Ciudad actualizada correctamente");
        } else {
          toast.error("Error al actualizar la ciudad.");
        }
      } else {
        const result = await addCity(cityPayload);
        if (result && !result.error) {
          toast.success("Ciudad agregada correctamente");
        } else {
          toast.error("Error al agregar la ciudad.");
        }
      }

      setOpenModal(false);
      setEditCity(null);
      loadCities(); // Recargar la lista después de guardar
    } catch (error) {
      toast.error(error.message || "Error al guardar la ciudad.");
      console.error("handleSubmitCity error:", error);
    }
  };

  const handleDeleteCity = async (id) => {
    if (!canPerformAction("eliminar_ciudades")) {
      // Permiso específico para eliminar
      toast.error("No tienes permisos para eliminar ciudades.");
      return;
    }

    const resultSwal = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la ciudad permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Rojo para eliminar
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      try {
        const deleteResult = await deleteCity(id);
        if (deleteResult && !deleteResult.error) {
          setCities((prev) => prev.filter((c) => c.id !== id));
          toast.success("Ciudad eliminada correctamente");
        } else {
          toast.error("Error al eliminar la ciudad.");
        }
      } catch (err) {
        console.error("Error al eliminar ciudad:", err);
        toast.error("Error de conexión al intentar eliminar la ciudad.");
      }
    }
  };

  const filteredCities = useMemo(() => {
    const search = searchText.toLowerCase();
    return (cities || []).filter((u) => {
      const cityName = (u.ciudad || u.nombre || "").toLowerCase();
      const countryName = (u.pais || "").toLowerCase(); // Asumo que el objeto ciudad tiene una prop 'pais'
      return cityName.includes(search) || countryName.includes(search);
    });
  }, [cities, searchText]);

  // Renderizado principal del componente
  if (checkingSession || loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh">
        <CircularProgress size="lg" />
        <Typography level="body-lg" sx={{ ml: 2 }}>
          {checkingSession ? "Verificando sesión..." : "Cargando ciudades..."}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md" mb={2}>
            {error}
          </Typography>
          {/* Solo mostrar botón de reintentar si el error no es de permisos */}
          {!error.includes("No tienes permisos") && (
            <Button onClick={loadCities} variant="outlined" color="danger">
              Reintentar
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  // Si no hay error y no está cargando, pero tampoco tiene permiso para ver
  if (!canPerformAction("ver_ciudades")) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md">
            Acceso denegado. No tienes permisos para ver la lista de ciudades.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <CitiesToolBar
        onAdd={handleAddCity}
        onSearch={(text) => setSearchText(text)}
        canAdd={canPerformAction("crear_ciudades")} // Pasa el permiso al toolbar
      />

      <CitiesTable
        cities={filteredCities}
        onEdit={handleEdit}
        onDelete={handleDeleteCity} // Pasa la función de eliminar
        canEdit={canPerformAction("editar_ciudades")} // Pasa el permiso a la tabla
        canDelete={canPerformAction("eliminar_ciudades")} // Pasa el permiso a la tabla
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
    </Box>
  );
}
