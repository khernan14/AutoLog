import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Sheet,
  Button,
  CircularProgress,
  Alert,
} from "@mui/joy"; // Añadido Alert
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // Para las confirmaciones

import {
  getParkings,
  addParking,
  updateParking,
  deleteParking,
} from "../../../services/ParkingServices"; // Asegúrate de que la ruta sea correcta

import ParkingsTable from "../../../components/Administration/Parkings/ParkingsTable"; // Asegúrate de que la ruta sea correcta
import ParkingsModal from "../../../components/Administration/Parkings/ParkingsModal"; // Asegúrate de que la ruta sea correcta
import ParkingsToolBar from "../../../components/Administration/Parkings/ParkingsToolBar"; // Asegúrate de que la ruta sea correcta
import { useAuth } from "../../../context/AuthContext"; // Asegúrate de que la ruta sea correcta

export default function Parkings() {
  const [parkings, setParkings] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editParking, setEditParking] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true); // Inicializar en true para la carga inicial
  const [error, setError] = useState(null);

  const { userData, checkingSession, hasPermiso } = useAuth(); // Obtener userData, checkingSession y hasPermiso
  const esAdmin = userData?.rol?.toLowerCase() === "admin";

  // Función auxiliar para verificar permisos (Admin o permiso específico)
  const canPerformAction = useCallback(
    (permissionName) => {
      return esAdmin || hasPermiso(permissionName);
    },
    [esAdmin, hasPermiso]
  );

  // Carga de estacionamientos con manejo de permisos y estado de sesión
  const loadParkings = useCallback(async () => {
    // Si aún estamos verificando la sesión, no hacemos nada.
    if (checkingSession) {
      setLoading(true); // Mantener el spinner mientras se verifica
      return;
    }

    // Verificar permiso para VER estacionamientos
    if (!canPerformAction("ver_estacionamientos")) {
      setError("No tienes permisos para ver la lista de estacionamientos.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      const data = await getParkings();
      setParkings(data);
    } catch (err) {
      console.error("Error al cargar estacionamientos:", err);
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canPerformAction]); // Dependencias: checkingSession, canPerformAction

  useEffect(() => {
    loadParkings();
  }, [loadParkings]);

  // --- Handlers de acciones con lógica de permisos ---

  const handleAddParking = () => {
    if (!canPerformAction("crear_estacionamiento")) {
      // Permiso específico para crear
      toast.error("No tienes permisos para agregar estacionamientos.");
      return;
    }
    setEditParking(null);
    setOpenModal(true);
  };

  const handleEdit = (parking) => {
    if (!canPerformAction("editar_estacionamiento")) {
      // Permiso específico para editar
      toast.error("No tienes permisos para editar estacionamientos.");
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
    // Permiso para crear o editar
    if (!parking.id && !canPerformAction("crear_estacionamiento")) {
      toast.error("No tienes permisos para crear estacionamientos.");
      return;
    }
    if (parking.id && !canPerformAction("editar_estacionamiento")) {
      toast.error("No tienes permisos para editar estacionamientos.");
      return;
    }

    try {
      const payload = normalizeParking(parking);

      if (!payload.nombre_ubicacion || !payload.id_ciudad) {
        toast.warning("El nombre y la ciudad son obligatorios.");
        return;
      }

      if (parking.id && Number(parking.id) > 0) {
        const result = await updateParking(parking.id, payload);
        if (result && !result.error) {
          toast.success("Estacionamiento actualizado correctamente");
        } else {
          toast.error("Error al actualizar el estacionamiento.");
        }
      } else {
        const result = await addParking(payload);
        if (result && !result.error) {
          toast.success("Estacionamiento agregado correctamente");
        } else {
          toast.error("Error al agregar el estacionamiento.");
        }
      }

      setOpenModal(false);
      setEditParking(null);
      loadParkings(); // Recargar la lista después de guardar
    } catch (error) {
      toast.error(error.message || "Error al guardar el estacionamiento.");
      console.error("handleSubmitParking error:", error);
    }
  };

  const handleDeleteParking = async (id) => {
    if (!canPerformAction("eliminar_estacionamiento")) {
      // Permiso específico para eliminar
      toast.error("No tienes permisos para eliminar estacionamientos.");
      return;
    }

    const resultSwal = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el estacionamiento permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Rojo para eliminar
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      try {
        const deleteResult = await deleteParking(id);
        if (deleteResult && !deleteResult.error) {
          setParkings((prev) => prev.filter((p) => p.id !== id));
          toast.success("Estacionamiento eliminado correctamente");
        } else {
          toast.error("Error al eliminar el estacionamiento.");
        }
      } catch (err) {
        console.error("Error al eliminar estacionamiento:", err);
        toast.error(
          "Error de conexión al intentar eliminar el estacionamiento."
        );
      }
    }
  };

  const filteredParkings = useMemo(() => {
    const search = searchText.toLowerCase();
    return (parkings || []).filter((p) => {
      const name = p.nombre_ubicacion?.toLowerCase() || "";
      const city = p.ciudad?.toLowerCase() || ""; // Asumo que el objeto parking tiene una prop 'ciudad'
      return name.includes(search) || city.includes(search);
    });
  }, [parkings, searchText]);

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
          {checkingSession
            ? "Verificando sesión..."
            : "Cargando estacionamientos..."}
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
            <Button onClick={loadParkings} variant="outlined" color="danger">
              Reintentar
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  // Si no hay error y no está cargando, pero tampoco tiene permiso para ver
  if (!canPerformAction("ver_estacionamientos")) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md">
            Acceso denegado. No tienes permisos para ver la lista de
            estacionamientos.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Gestión de Estacionamientos
      </Typography>

      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md", mb: 2 }}>
        <ParkingsToolBar
          onAdd={handleAddParking}
          onSearch={(text) => setSearchText(text)}
          canAdd={canPerformAction("crear_estacionamiento")} // Pasa el permiso al toolbar
        />
      </Sheet>

      <ParkingsTable
        parkings={filteredParkings}
        onEdit={handleEdit}
        onDelete={handleDeleteParking} // Pasa la función de eliminar
        canEdit={canPerformAction("editar_estacionamiento")} // Pasa el permiso a la tabla
        canDelete={canPerformAction("eliminar_estacionamiento")} // Pasa el permiso a la tabla
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
    </Box>
  );
}
