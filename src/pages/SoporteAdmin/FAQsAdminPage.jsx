// src/pages/SoporteAdmin/FAQsAdminPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  ButtonGroup, // Importamos ButtonGroup
} from "@mui/joy";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Importa los servicios de FAQ
import {
  getFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ, // Este servicio se usará para inactivar (isActive = false)
} from "../../services/helpServices"; // Ajusta la ruta

// Importa los componentes que creamos
import FAQFormModal from "../../components/SoporteAdmin/FAQs/FAQFormModal";
import FAQTable from "../../components/SoporteAdmin/FAQs/FAQTable";

// Importa tu contexto de autenticación para los permisos
import { useAuth } from "../../context/AuthContext";

export default function FAQsAdminPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showInactive, setShowInactive] = useState(false); // Estado para mostrar FAQs inactivas

  const { userData, hasPermiso } = useAuth();
  const esAdmin = userData?.rol?.toLowerCase() === "admin";

  const canPerformAction = useCallback(
    (permissionName) => {
      return esAdmin || hasPermiso(permissionName);
    },
    [esAdmin, hasPermiso]
  );

  // Permisos específicos para esta página
  const canCreateFaq = canPerformAction("crear_faqs");
  const canEditFaq = canPerformAction("editar_faqs");
  const canDeleteFaq = canPerformAction("eliminar_faqs"); // Permiso para inactivar
  const canRestoreFaq = canPerformAction("restaurar_faqs"); // Permiso para activar

  // --- Carga de FAQs ---
  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pasa el estado de showInactive al servicio getFAQs
      const data = await getFAQs(null, showInactive); // El primer null es para 'id', el segundo para 'includeInactive'
      if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        setFaqs([]);
        console.warn("API de FAQs no devolvió un array:", data);
      }
    } catch (err) {
      setError("Error al cargar las preguntas frecuentes.");
      toast.error("No se pudieron cargar las preguntas frecuentes.");
      console.error("Error fetching FAQs:", err);
    } finally {
      setLoading(false);
    }
  }, [showInactive]); // Dependencia: recargar FAQs cuando showInactive cambia

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // --- Manejo del Modal ---
  const handleAddFaq = () => {
    if (!canCreateFaq) {
      toast.error("No tienes permisos para agregar FAQs.");
      return;
    }
    setEditingFaq(null);
    setModalOpen(true);
  };

  const handleEditFaq = (faq) => {
    if (!canEditFaq) {
      toast.error("No tienes permisos para editar FAQs.");
      return;
    }
    setEditingFaq(faq);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFaq(null);
  };

  // --- Guardar/Actualizar FAQ ---
  const handleSaveFaq = async (faqData) => {
    try {
      let result;
      if (faqData.id) {
        // Actualizar
        result = await updateFAQ(faqData.id, faqData);
        if (result && !result.error) {
          // Actualiza solo la FAQ modificada en el estado local
          setFaqs((prev) =>
            prev.map((faq) =>
              faq.id === faqData.id ? { ...faq, ...faqData } : faq
            )
          );
          toast.success("FAQ actualizada correctamente.");
        } else {
          throw new Error(result?.error || "Error al actualizar la FAQ.");
        }
      } else {
        // Agregar
        result = await addFAQ(faqData);
        if (result && result.id && !result.error) {
          // Agrega la nueva FAQ al estado local
          setFaqs((prev) => [...prev, { ...faqData, id: result.id }]);
          toast.success("FAQ agregada correctamente.");
        } else {
          throw new Error(result?.error || "Error al agregar la FAQ.");
        }
      }
      handleCloseModal();
      return { success: true };
    } catch (err) {
      toast.error(err.message || "Error al guardar la FAQ.");
      console.error("Error saving FAQ:", err);
      return { error: true };
    }
  };

  // --- Inactivar FAQ (usando deleteFAQ service) ---
  const handleDeleteFaq = async (id) => {
    if (!canDeleteFaq) {
      toast.error("No tienes permisos para inactivar FAQs.");
      return;
    }
    try {
      // Llama al servicio deleteFAQ, que en el backend marca isActive = FALSE
      const result = await deleteFAQ(id);
      if (result && !result.error) {
        setFaqs((prev) =>
          prev.map((faq) => (faq.id === id ? { ...faq, isActive: false } : faq))
        );
        toast.success("FAQ inactivada correctamente.");
      } else {
        throw new Error(result?.error || "Error al inactivar la FAQ.");
      }
    } catch (err) {
      toast.error(err.message || "Error al inactivar la FAQ.");
      console.error("Error inactivating FAQ:", err);
    }
  };

  // --- Activar/Restaurar FAQ (usando updateFAQ service) ---
  const handleRestoreFaq = async (id) => {
    if (!canRestoreFaq) {
      toast.error("No tienes permisos para activar FAQs.");
      return;
    }
    try {
      // Llama a updateFAQ para cambiar isActive a TRUE
      const result = await updateFAQ(id, { isActive: true });
      if (result && !result.error) {
        setFaqs((prev) =>
          prev.map((faq) => (faq.id === id ? { ...faq, isActive: true } : faq))
        );
        toast.success("FAQ activada correctamente.");
      } else {
        throw new Error(result?.error || "Error al activar la FAQ.");
      }
    } catch (err) {
      toast.error(err.message || "Error al activar la FAQ.");
      console.error("Error activating FAQ:", err);
    }
  };

  // --- Renderizado del Componente ---
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh">
        <CircularProgress size="lg" />
        <Typography level="body-lg" sx={{ ml: 2 }}>
          Cargando preguntas frecuentes...
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
          <Button onClick={fetchFAQs} variant="outlined" color="danger">
            Reintentar Carga
          </Button>
        </Alert>
      </Box>
    );
  }

  // Si no tiene permiso para ver la página de gestión de FAQs
  if (!canPerformAction("gestionar_faqs")) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md">
            Acceso denegado. No tienes permisos para gestionar FAQs.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}>
        <Typography level="h2" component="h1">
          Gestión de Preguntas Frecuentes
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Botón para agregar FAQ */}
          <Button
            startDecorator={<AddRoundedIcon />}
            onClick={handleAddFaq}
            disabled={!canCreateFaq}>
            Agregar FAQ
          </Button>
          {/* Filtro de estado */}
          <ButtonGroup variant="outlined" aria-label="Filtrar FAQs por estado">
            <Button
              size="sm"
              color={!showInactive ? "primary" : "neutral"}
              onClick={() => setShowInactive(false)}>
              Activas
            </Button>
            <Button
              size="sm"
              color={showInactive ? "primary" : "neutral"}
              onClick={() => setShowInactive(true)}>
              Todas
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      <FAQTable
        faqs={faqs} // Ahora faqs contendrá todas las FAQs según el filtro
        onEdit={handleEditFaq}
        onDelete={handleDeleteFaq} // Pasa la función para inactivar
        onRestore={handleRestoreFaq} // Pasa la función para activar/restaurar
        canEdit={canEditFaq}
        canDelete={canDeleteFaq}
        canRestore={canRestoreFaq}
      />

      <FAQFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveFaq}
        faq={editingFaq}
      />
    </Box>
  );
}
