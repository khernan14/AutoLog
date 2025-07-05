import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import UserToolbar from "./UserToolbar";
import UserTable from "./UserTable";
import UserFormModal from "./UserFormModal";
import {
  createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  restoreUser as restoreUserService,
  getUserSupervisors,
} from "../../../services/AuthServices";
import { sendMail } from "../../../services/MailServices";
import { getCiudades } from "../../../services/RegistrosService";
import { Box, CircularProgress, Typography, Button, Alert } from "@mui/joy";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";

// Recibe 'users' como prop desde el componente padre Users.jsx
export default function UsersForm({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers); // Usa initialUsers para el estado local
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  // El loading y error principal ahora reflejarán la carga de ciudades/supervisores y el estado general
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [errorInitialData, setErrorInitialData] = useState(null);
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

  // Sincronizar el estado local 'users' con la prop 'initialUsers'
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // --- Funciones de Carga de Datos (ciudades, supervisores) ---
  // Estas se cargan independientemente de si el usuario puede ver la tabla de usuarios,
  // ya que son necesarias para el modal de creación/edición.

  const fetchCiudades = useCallback(async () => {
    try {
      const data = await getCiudades();
      setCiudades(data);
    } catch (error) {
      console.error("Error cargando ciudades:", error);
      // No establecer un error general aquí, ya que el modal puede manejar la falta de ciudades
      // O podrías establecer un error específico para el modal.
    }
  }, []);

  const fetchSupervisores = useCallback(async () => {
    try {
      const data = await getUserSupervisors();
      setSupervisores(data);
    } catch (error) {
      console.error("Error cargando supervisores:", error);
      // No establecer un error general aquí
    }
  }, []);

  // Cargar ciudades y supervisores al montar el componente
  useEffect(() => {
    const loadRequiredData = async () => {
      setLoadingInitialData(true);
      setErrorInitialData(null);
      try {
        await Promise.all([fetchCiudades(), fetchSupervisores()]);
      } catch (err) {
        // Este error solo se mostrará si fetchCiudades o fetchSupervisores lanzan un error
        // que no fue capturado internamente.
        setErrorInitialData(
          "Error al cargar datos adicionales (ciudades/supervisores)."
        );
      } finally {
        setLoadingInitialData(false);
      }
    };
    loadRequiredData();
  }, [fetchCiudades, fetchSupervisores]);

  // --- Handlers de Acciones con Lógica de Permisos ---

  const handleAddUser = () => {
    if (!canPerformAction("crear_usuario")) {
      toast.error("No tienes permisos para agregar usuarios.");
      return;
    }
    // Si no hay ciudades, el modal debería mostrar un mensaje o deshabilitar la selección
    if (ciudades.length === 0 && !errorInitialData) {
      // Solo si no hay un error general ya
      toast.warn("No hay ciudades disponibles para asignar a los usuarios.");
    }
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user) => {
    if (!canPerformAction("editar_usuario")) {
      toast.error("No tienes permisos para editar usuarios.");
      return;
    }
    if (ciudades.length === 0 && !errorInitialData) {
      toast.warn("No hay ciudades disponibles para editar usuarios.");
    }
    setEditingUser({
      ...user,
      ciudad: String(user.id_ciudad ?? user.ciudad),
      supervisor_id:
        user.supervisor_id !== undefined && user.supervisor_id !== null
          ? String(user.supervisor_id)
          : "",
    });
    setModalOpen(true);
  };

  const getCiudadNombre = useCallback(
    (idCiudad) => {
      return (
        ciudades.find((c) => String(c.id) === String(idCiudad))?.nombre || ""
      );
    },
    [ciudades]
  );

  const handleSaveUser = async (newUser) => {
    if (!newUser.id_usuario && !canPerformAction("crear_usuario")) {
      toast.error("No tienes permisos para crear usuarios.");
      return { error: true };
    }
    if (newUser.id_usuario && !canPerformAction("editar_usuario")) {
      toast.error("No tienes permisos para editar usuarios.");
      return { error: true };
    }

    try {
      let result = null;
      if (newUser.id_usuario) {
        result = await updateUserService(newUser);
        if (!result || result.error) throw new Error(result?.error);
        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === newUser.id_usuario
              ? {
                  ...u,
                  ...newUser,
                  ciudad: getCiudadNombre(newUser.id_ciudad ?? newUser.ciudad),
                  supervisor_id: newUser.supervisor_id ?? null,
                }
              : u
          )
        );
        toast.success("Usuario actualizado correctamente");
      } else {
        result = await createUserService(newUser);
        if (!result || result.error) throw new Error(result?.error);

        const ciudadNombre = getCiudadNombre(
          newUser.id_ciudad ?? newUser.ciudad
        );
        const nuevoUsuario = {
          ...result,
          ...newUser,
          ciudad: ciudadNombre,
        };
        setUsers((prev) => [...prev, nuevoUsuario]);
        toast.success("Usuario creado correctamente");

        try {
          await sendMail({
            to: nuevoUsuario.email,
            nombre: nuevoUsuario.nombre,
            usuario: nuevoUsuario.username,
            password: result.password || newUser.password,
          });
          toast.success("Correo de bienvenida enviado");
        } catch (error) {
          toast.warn("Usuario creado, pero el correo no se pudo enviar");
          console.error("Error enviando correo:", error);
        }
      }
      setModalOpen(false);
      setEditingUser(null);
      return result;
    } catch (error) {
      toast.error(error.message || "Error al guardar el usuario.");
      return { error: true };
    }
  };

  const handleDeleteUser = async (id) => {
    if (!canPerformAction("eliminar_usuario")) {
      toast.error("No tienes permisos para eliminar usuarios.");
      return;
    }

    const resultSwal = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El usuario será marcado como inactivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      try {
        const result = await deleteUserService(id);
        if (result && !result.error) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id_usuario === id ? { ...u, estatus: "Inactivo" } : u
            )
          );
          setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
          toast.success("Usuario inactivado correctamente");
        } else {
          toast.error("Error al inactivar el usuario.");
        }
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        toast.error("Error de conexión al intentar inactivar el usuario.");
      }
    }
  };

  const handleRestoreUser = async (id) => {
    if (!canPerformAction("gestionar_usuarios")) {
      // O 'restaurar_usuario' si es más específico
      toast.error("No tienes permisos para restaurar usuarios.");
      return;
    }

    const resultSwal = await Swal.fire({
      title: "¿Restaurar usuario?",
      text: "El usuario será marcado como activo nuevamente.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      try {
        const result = await restoreUserService(id);
        if (result && !result.error) {
          setUsers((prev) =>
            prev.map((user) =>
              user.id_usuario === id ? { ...user, estatus: "Activo" } : user
            )
          );
          toast.success("Usuario restaurado correctamente");
        } else {
          toast.error("Error al restaurar el usuario");
        }
      } catch (err) {
        console.error("Error al restaurar usuario:", err);
        toast.error("Error de conexión al intentar restaurar el usuario.");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!canPerformAction("eliminar_usuario")) {
      toast.error("No tienes permisos para eliminar usuarios seleccionados.");
      return;
    }

    const resultSwal = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Los usuarios seleccionados serán marcados como inactivos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, inactivar seleccionados",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      try {
        await Promise.all(selectedUsers.map((id) => deleteUserService(id)));

        setUsers((prev) =>
          prev.map((u) =>
            selectedUsers.includes(u.id_usuario)
              ? { ...u, estatus: "Inactivo" }
              : u
          )
        );
        setSelectedUsers([]);
        toast.success("Usuarios inactivados correctamente");
      } catch (err) {
        console.error("Error al inactivar usuarios seleccionados:", err);
        toast.error("Error de conexión al inactivar usuarios seleccionados.");
      }
    }
  };

  const filteredUsers = useMemo(() => {
    const search = searchText.toLowerCase();
    return (users || []).filter((u) => {
      const matchesStatus = showInactive ? true : u.estatus === "Activo";
      const matchesSearch =
        `${u.nombre} ${u.email} ${u.username} ${u.rol} ${u.puesto} ${u.ciudad}`
          .toLowerCase()
          .includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [users, showInactive, searchText]);

  // --- Renderizado del Componente ---
  // Manejo de carga y errores iniciales (incluyendo el checkingSession del AuthContext)
  if (checkingSession || loadingInitialData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh">
        <CircularProgress size="lg" />
        <Typography level="body-lg" sx={{ ml: 2 }}>
          {checkingSession ? "Verificando sesión..." : "Cargando datos..."}
        </Typography>
      </Box>
    );
  }

  // Si no tiene permiso para ver usuarios (y ya no está cargando ni verificando sesión)
  if (!canPerformAction("ver_usuarios")) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="danger" variant="soft">
          <Typography level="body-md">
            Acceso denegado. No tienes permisos para ver la lista de usuarios.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Si hay un error general después de la carga inicial (ej. ciudades no cargadas)
  if (errorInitialData) {
    return (
      <Box textAlign="center" mt={4} p={3}>
        <Alert color="warning" variant="soft">
          <Typography level="body-md" mb={2}>
            {errorInitialData}
          </Typography>
          <Button
            onClick={() => {
              setErrorInitialData(null); // Limpiar error para reintentar
              setLoadingInitialData(true); // Activar carga para reintentar
              fetchCiudades(); // Reintentar solo ciudades/supervisores
              fetchSupervisores();
            }}
            variant="outlined"
            color="warning">
            Reintentar Carga de Datos
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <UserToolbar
        onAdd={handleAddUser}
        onDelete={handleDeleteSelected}
        selectedUsers={selectedUsers}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
        onSearch={(text) => setSearchText(text)}
        // Pasando permisos a la barra de herramientas
        canAdd={canPerformAction("crear_usuario")}
        canDeleteSelected={canPerformAction("eliminar_usuario")}
      />
      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onBulkDelete={handleDeleteSelected}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        onRestore={handleRestoreUser}
        // Pasando permisos a la tabla
        canEdit={canPerformAction("editar_usuario")}
        canDelete={canPerformAction("eliminar_usuario")}
        canRestore={canPerformAction("gestionar_usuarios")} // O un permiso más específico si existe
      />
      <UserFormModal
        open={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        user={editingUser}
        ciudades={ciudades}
        supervisores={supervisores}
        // Puedes pasar un prop para indicar si no hay ciudades, si el modal lo necesita
        // hasCiudades={ciudades.length > 0}
      />
    </Box>
  );
}
