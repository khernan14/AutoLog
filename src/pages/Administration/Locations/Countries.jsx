import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Box, CircularProgress, Typography, Button, Alert } from "@mui/joy"; // Añadido Alert
import Swal from "sweetalert2"; // Para las confirmaciones

import {
  getCountries,
  addCountry,
  updateCountry,
  deleteCountry, // Asumo que tienes una función deleteCountry
} from "../../../services/LocationServices"; // Asegúrate de que la ruta sea correcta

import CountriesToolBar from "../../../components/Administration/Locations/Countries/CountriesToolBar"; // Asegúrate de que la ruta sea correcta
import CountriesTable from "../../../components/Administration/Locations/Countries/CountriesTable"; // Asegúrate de que la ruta sea correcta
import CountriesModal from "../../../components/Administration/Locations/Countries/CountriesModal"; // Asegúrate de que la ruta sea correcta

import { useAuth } from "../../../context/AuthContext"; // Asegúrate de que la ruta sea correcta

export default function Countries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true); // Inicializar en true para la carga inicial
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editCountry, setEditCountry] = useState(null);
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

  // Carga de países con manejo de permisos y estado de sesión
  const loadCountries = useCallback(async () => {
    // Si aún estamos verificando la sesión, no hacemos nada.
    if (checkingSession) {
      setLoading(true); // Mantener el spinner mientras se verifica
      return;
    }

    // Verificar permiso para VER países
    if (!canPerformAction("ver_paises")) {
      setError("No tienes permisos para ver la lista de países.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      const data = await getCountries();
      if (data) {
        setCountries(data);
      } else {
        setError("No se pudieron cargar los países. Intenta más tarde.");
      }
    } catch (err) {
      console.error("Error al cargar países:", err);
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canPerformAction]); // Dependencias: checkingSession, canPerformAction

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  // --- Handlers de acciones con lógica de permisos ---

  const handleAddCountry = () => {
    if (!canPerformAction("crear_paises")) {
      // Permiso específico para crear
      toast.error("No tienes permisos para agregar países.");
      return;
    }
    setEditCountry(null);
    setOpenModal(true);
  };

  const handleEdit = (country) => {
    if (!canPerformAction("editar_paises")) {
      // Permiso específico para editar
      toast.error("No tienes permisos para editar países.");
      return;
    }
    setEditCountry(country);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!canPerformAction("eliminar_paises")) {
      // Permiso específico para eliminar
      toast.error("No tienes permisos para eliminar países.");
      return;
    }

    const resultSwal = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el país permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Rojo para eliminar
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      try {
        const deleteResult = await deleteCountry(id); // Asumo que deleteCountry existe
        if (deleteResult && !deleteResult.error) {
          setCountries((prev) => prev.filter((c) => c.id !== id));
          toast.success("País eliminado correctamente");
        } else {
          toast.error("Error al eliminar el país.");
        }
      } catch (err) {
        console.error("Error al eliminar país:", err);
        toast.error("Error de conexión al intentar eliminar el país.");
      }
    }
  };

  const handleSubmitCountry = async (country) => {
    // Permiso para crear o editar
    if (!country.id && !canPerformAction("crear_paises")) {
      toast.error("No tienes permisos para crear países.");
      return;
    }
    if (country.id && !canPerformAction("editar_paises")) {
      toast.error("No tienes permisos para editar países.");
      return;
    }

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
        const result = await updateCountry(payload.id, payload);
        if (result && !result.error) {
          toast.success("País actualizado correctamente");
        } else {
          toast.error("Error al actualizar el país.");
        }
      } else {
        const result = await addCountry(payload);
        if (result && !result.error) {
          toast.success("País agregado correctamente");
        } else {
          toast.error("Error al agregar el país.");
        }
      }

      setOpenModal(false);
      setEditCountry(null);
      loadCountries(); // Recargar la lista después de guardar
    } catch (error) {
      toast.error(error.message || "Error al guardar el país.");
      console.error("handleSubmitCountry error:", error);
    }
  };

  const filteredCountries = useMemo(() => {
    const search = searchText.toLowerCase();
    return (countries || []).filter((u) =>
      (u.nombre || "").toLowerCase().includes(search)
    );
  }, [countries, searchText]);

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
          {checkingSession ? "Verificando sesión..." : "Cargando países..."}
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
            <Button onClick={loadCountries} variant="outlined" color="danger">
              Reintentar
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  // Si no hay error y no está cargando, pero tampoco tiene permiso para ver
  if (!canPerformAction("ver_paises")) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md">
            Acceso denegado. No tienes permisos para ver la lista de países.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <CountriesToolBar
        onAdd={handleAddCountry}
        onSearch={(text) => setSearchText(text)}
        canAdd={canPerformAction("crear_paises")} // Pasa el permiso al toolbar
      />

      <CountriesTable
        countries={filteredCountries}
        onEdit={handleEdit}
        onDelete={handleDelete} // Pasa la función de eliminar
        canEdit={canPerformAction("editar_paises")} // Pasa el permiso a la tabla
        canDelete={canPerformAction("eliminar_paises")} // Pasa el permiso a la tabla
      />

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
