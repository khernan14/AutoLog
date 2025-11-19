// src/pages/Vehiculos/Vehiculos.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { Box, Card, Sheet, Typography } from "@mui/joy";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

// ✅ utilitarios reusables
import ResourceState from "../../components/common/ResourceState";
import usePermissions from "../../hooks/usePermissions";
import { getViewState } from "../../utils/viewState";

// ✅ tu ToastContext
import { useToast } from "../../context/ToastContext";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editVehiculo, setEditVehiculo] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { checkingSession } = useAuth();
  const { canAny } = usePermissions();
  const { showToast } = useToast();

  // permisos normalizados
  const canView = canAny("ver_vehiculos");
  const canCreate = canAny("crear_vehiculo");
  const canEdit = canAny("editar_vehiculo");
  const canDelete = canAny("eliminar_vehiculo");
  const canRestore = canAny("gestionar_vehiculos");

  const loadVehiculos = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canView) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await obtenerVehiculos();
      if (Array.isArray(data)) {
        setVehiculos(data);
      } else {
        setError("No se pudieron cargar los vehículos. Intenta más tarde.");
      }
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();
      const isNetwork =
        msg.includes("failed to fetch") || msg.includes("networkerror");
      setError(
        isNetwork
          ? "No hay conexión con el servidor."
          : err?.message || "Error desconocido."
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView]);

  useEffect(() => {
    loadVehiculos();
  }, [loadVehiculos]);

  // ---- handlers CRUD con showToast ----
  const handleAddVehiculo = () => {
    if (!canCreate) {
      showToast("No tienes permiso para crear vehículos.", "warning");
      return;
    }
    setEditVehiculo(null);
    setOpenModal(true);
  };

  const handleEdit = (vehiculo) => {
    if (!canEdit) {
      showToast("No tienes permiso para editar vehículos.", "warning");
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
    if (!canDelete) {
      showToast("No tienes permiso para inhabilitar vehículos.", "warning");
      return;
    }
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El vehículo será marcado como inactivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        const resp = await deleteVehiculo(id);
        if (resp && !resp.error) {
          setVehiculos((prev) =>
            prev.map((v) => (v.id === id ? { ...v, estado: "Inactivo" } : v))
          );
          showToast("Vehículo inactivado correctamente", "success");
        } else {
          showToast("Error al inactivar el vehículo.", "danger");
        }
      } catch (err) {
        showToast(
          "Error de conexión al intentar inactivar el vehículo.",
          "danger"
        );
      }
    }
  };

  const handleRestore = async (id) => {
    if (!canRestore) {
      showToast("No tienes permiso para restaurar vehículos.", "warning");
      return;
    }
    const result = await Swal.fire({
      title: "¿Restaurar vehículo?",
      text: "El vehículo será marcado como disponible nuevamente.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        const resp = await restoreVehiculo(id);
        if (resp && !resp.error) {
          setVehiculos((prev) =>
            prev.map((v) => (v.id === id ? { ...v, estado: "Disponible" } : v))
          );
          showToast("Vehículo restaurado correctamente", "success");
        } else {
          showToast("Error al restaurar el vehículo.", "danger");
        }
      } catch (err) {
        showToast(
          "Error de conexión al intentar restaurar el vehículo.",
          "danger"
        );
      }
    }
  };

  const handleSubmitVehiculo = async (vehiculo) => {
    if (!canAny("crear_vehiculo", "editar_vehiculo")) {
      showToast("No tienes permisos para guardar vehículos.", "warning");
      return;
    }
    try {
      if (vehiculo.id) {
        const resp = await actualizarVehiculo(vehiculo.id, vehiculo);
        if (resp && !resp.error)
          showToast("Vehículo actualizado correctamente", "success");
        else showToast("Error al actualizar el vehículo.", "danger");
      } else {
        const resp = await addVehiculos(vehiculo);
        if (resp && !resp.error)
          showToast("Vehículo agregado correctamente", "success");
        else showToast("Error al agregar el vehículo.", "danger");
      }
    } catch (err) {
      showToast("Error de conexión al guardar el vehículo.", "danger");
    } finally {
      setOpenModal(false);
      setEditVehiculo(null);
      loadVehiculos();
    }
  };

  // ---- filtros/búsqueda ----
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

  // estado de vista reutilizable
  const viewState = getViewState({
    checkingSession,
    canView,
    error,
    loading,
    hasData: Array.isArray(vehiculos) && vehiculos.length > 0,
  });

  return (
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 4 },
        pb: { xs: 2, sm: 2, md: 4 },
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        minHeight: "100dvh",
        bgcolor: "background.body",
      }}>
      <Box sx={{ width: "100%" }}>
        {/* Header de la página */}
        <Box sx={{ mb: 1.5 }}>
          <Typography level="h4">Vehículos</Typography>
          <Typography level="body-sm" color="neutral">
            Gestión del catálogo de vehículos de la flota.
          </Typography>
          <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.5 }}>
            Total registrados: {vehiculos.length}
          </Typography>
        </Box>

        {/* Barra de búsqueda / filtros / agregar – FUERA del Card */}
        <VehiculosToolBar
          searchText={searchText}
          onSearch={setSearchText}
          onAdd={handleAddVehiculo}
          showInactive={showInactive}
          setShowInactive={setShowInactive}
          canAdd={canCreate}
          addDisabledReason={
            !canCreate
              ? "No tienes permiso para crear. Solicítalo al administrador."
              : undefined
          }
        />

        {/* Contenedor principal (solo tabla / estados) */}
        <Card
          variant="outlined"
          sx={{
            mt: 1,
            p: 2,
            backgroundColor: "background.surface",
            overflowX: "auto",
          }}>
          {viewState !== "data" ? (
            <ResourceState
              state={viewState}
              error={error}
              onRetry={loadVehiculos}
              emptyTitle="Sin vehículos"
              emptyDescription="Aún no hay vehículos registrados."
            />
          ) : filteredVehiculos.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <ResourceState
                state="empty"
                emptyTitle={
                  vehiculos.length ? "Sin coincidencias" : "Sin vehículos"
                }
                emptyDescription={
                  vehiculos.length
                    ? "No encontramos vehículos con los filtros actuales."
                    : "Aún no hay vehículos registrados."
                }
              />
            </Box>
          ) : (
            <VehiculosTable
              vehiculos={filteredVehiculos}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
              canEdit={canEdit}
              canDelete={canDelete}
              canRestore={canRestore}
            />
          )}
        </Card>
      </Box>

      {/* Modal crear/editar */}
      <VehiculoModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditVehiculo(null);
        }}
        initialValues={editVehiculo || undefined}
        onSubmit={handleSubmitVehiculo}
      />
    </Sheet>
  );
}
