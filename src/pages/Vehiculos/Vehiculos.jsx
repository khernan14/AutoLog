import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  obtenerVehiculos,
  deleteVehiculo,
  addVehiculos,
  actualizarVehiculo,
  restoreVehiculo,
} from "../../services/VehiculosService"; // Asegúrate de que las rutas sean correctas
import VehiculosTable from "../../components/VehiculosForm/VehiculosTable"; // Asegúrate de que la ruta sea correcta
import VehiculoModal from "../../components/VehiculosForm/VehiculosModal"; // Asegúrate de que la ruta sea correcta
import VehiculosToolBar from "../../components/VehiculosForm/VehiculosToolBar"; // Asegúrate de que la ruta sea correcta
import { Box, CircularProgress, Typography, Button, Alert } from "@mui/joy"; // Añadido Alert para mensajes de error
import { useAuth } from "../../context/AuthContext"; // Asegúrate de que la ruta sea correcta
import Swal from "sweetalert2"; // Para las confirmaciones de eliminación/restauración

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editVehiculo, setEditVehiculo] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { userData, checkingSession, hasPermiso } = useAuth();
  const esAdmin = userData?.rol?.toLowerCase() === "admin";

  // Función auxiliar para verificar permisos (Admin o permiso específico)
  const canPerformAction = useCallback(
    (permissionName) => {
      return esAdmin || hasPermiso(permissionName);
    },
    [esAdmin, hasPermiso]
  );

  // Carga de vehículos con manejo de permisos y estado de sesión
  const loadVehiculos = useCallback(async () => {
    // Si aún estamos verificando la sesión, no hacemos nada.
    if (checkingSession) {
      setLoading(true); // Mantener el spinner mientras se verifica
      return;
    }

    // Verificar permiso para VER vehículos
    if (!canPerformAction("ver_vehiculos")) {
      // Asumo 'ver_vehiculos' para la lista
      setError("No tienes permisos para ver la lista de vehículos.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      const data = await obtenerVehiculos();
      if (data) {
        setVehiculos(data);
      } else {
        // Si la API devuelve un array vacío o null pero no lanza un error
        setError("No se pudieron cargar los vehículos. Intenta más tarde.");
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
      setError("No se pudo conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canPerformAction]); // Dependencias: checkingSession, canPerformAction

  useEffect(() => {
    loadVehiculos();
  }, [loadVehiculos]);

  // --- Handlers de acciones con lógica de permisos ---

  const handleAddVehiculo = () => {
    if (!canPerformAction("crear_vehiculo")) {
      // Permiso para agregar
      toast.error("No tienes permisos para agregar vehículos.");
      return;
    }
    setEditVehiculo(null);
    setOpenModal(true);
  };

  const handleEdit = (vehiculo) => {
    if (!canPerformAction("editar_vehiculo")) {
      toast.error("No tienes permisos para editar vehículos.");
      return;
    }

    const vehiculoTransformado = {
      ...vehiculo,
      id_ubicacion_actual: vehiculo.LocationID,
    };

    setEditVehiculo(vehiculoTransformado);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!canPerformAction("eliminar_vehiculo")) {
      // Permiso para eliminar
      toast.error("No tienes permisos para eliminar vehículos.");
      return;
    }

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El vehículo será marcado como inactivo y no aparecerá en la lista principal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Rojo para eliminar
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteVehiculo(id);
        if (deleteResult && !deleteResult.error) {
          setVehiculos((prev) =>
            prev.map((v) => (v.id === id ? { ...v, estado: "Inactivo" } : v))
          );
          toast.success("Vehículo inactivado correctamente");
        } else {
          toast.error("Error al inactivar el vehículo.");
        }
      } catch (err) {
        console.error("Error al eliminar vehículo:", err);
        toast.error("Error de conexión al intentar inactivar el vehículo.");
      }
    }
  };

  const handleRestore = async (id) => {
    if (!canPerformAction("gestionar_vehiculos")) {
      // Permiso para restaurar (asumo el mismo que gestionar)
      toast.error("No tienes permisos para restaurar vehículos.");
      return;
    }

    const result = await Swal.fire({
      title: "¿Restaurar vehículo?",
      text: "El vehículo será marcado como disponible nuevamente.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#03624C", // Verde para restaurar
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const restoreResult = await restoreVehiculo(id);
        if (restoreResult && !restoreResult.error) {
          setVehiculos((prev) =>
            prev.map((v) => (v.id === id ? { ...v, estado: "Disponible" } : v))
          );
          toast.success("Vehículo restaurado correctamente");
        } else {
          toast.error("Error al restaurar el vehículo.");
        }
      } catch (err) {
        console.error("Error al restaurar vehículo:", err);
        toast.error("Error de conexión al intentar restaurar el vehículo.");
      }
    }
  };

  const handleSubmitVehiculo = async (vehiculo) => {
    // Permiso para agregar/actualizar
    if (!canPerformAction("gestionar_vehiculos")) {
      // ✅ Esto es el mismo que crear_vehiculo
      toast.error("No tienes permisos para guardar vehículos.");
      return;
    }

    try {
      if (vehiculo.id) {
        const result = await actualizarVehiculo(vehiculo.id, vehiculo);
        if (result && !result.error) {
          toast.success("Vehículo actualizado correctamente");
        } else {
          toast.error("Error al actualizar el vehículo.");
        }
      } else {
        const result = await addVehiculos(vehiculo);
        if (result && !result.error) {
          toast.success("Vehículo agregado correctamente");
        } else {
          toast.error("Error al agregar el vehículo.");
        }
      }
    } catch (err) {
      console.error("Error al guardar vehículo:", err);
      toast.error("Error de conexión al guardar el vehículo.");
    } finally {
      setOpenModal(false);
      setEditVehiculo(null);
      loadVehiculos(); // Recargar la lista después de guardar
    }
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
          {checkingSession ? "Verificando sesión..." : "Cargando vehículos..."}
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
            <Button onClick={loadVehiculos} variant="outlined" color="danger">
              Reintentar
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  // Si no hay error y no está cargando, pero tampoco tiene permiso para ver
  // (Esto es un fallback, ya que loadVehiculos ya debería haber establecido el error)
  if (!canPerformAction("ver_vehiculos")) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md">
            Acceso denegado. No tienes permisos para ver este contenido.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <VehiculosToolBar
        onAdd={handleAddVehiculo}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
        onSearch={(text) => setSearchText(text)}
        canAdd={canPerformAction("crear_vehiculos")} // Pasa el permiso al toolbar
      />

      <VehiculosTable
        vehiculos={filteredVehiculos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
        canEdit={canPerformAction("editar_vehiculo")} // Pasa el permiso a la tabla
        canDelete={canPerformAction("eliminar_vehiculo")} // Pasa el permiso a la tabla
      />

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
