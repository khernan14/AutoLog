import React, { useState, useEffect } from "react";
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

export default function UsersForm({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [ciudadesError, setCiudadesError] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [supervisores, setSupervisores] = useState([]);

  useEffect(() => {
    setUsers(initialUsers);
    fetchCiudades();
    fetchSupervisores();
  }, [initialUsers]);

  const fetchCiudades = async () => {
    try {
      const data = await getCiudades();
      setCiudades(data);
      setCiudadesError(false);
    } catch (error) {
      console.error("Error cargando ciudades:", error);
      toast.error("No tienes permisos para ver las ciudades.");
      setCiudades([]);
      setCiudadesError(true);
    }
  };

  const fetchSupervisores = async () => {
    try {
      const data = await getUserSupervisors(); // o getEmpleadosSupervisor si es el mismo
      setSupervisores(data);
    } catch (error) {
      console.error("Error cargando supervisores:", error);
      toast.error("No se pudieron cargar los supervisores");
      setSupervisores([]);
    }
  };

  const handleAddUser = () => {
    if (ciudades.length === 0) {
      toast.error(
        "No puedes agregar usuarios porque no tienes acceso a las ciudades."
      );
      return;
    }
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user) => {
    if (ciudades.length === 0) {
      toast.error(
        "No puedes editar usuarios porque no tienes acceso a las ciudades."
      );
      return;
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

  const getCiudadNombre = (idCiudad) => {
    return (
      ciudades.find((c) => String(c.id) === String(idCiudad))?.nombre || ""
    );
  };

  const handleSaveUser = async (newUser) => {
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

        // Enviar correo de bienvenida
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

      return result;
    } catch (error) {
      toast.error(error.message || "Error al guardar el usuario.");
      return { error: true };
    }
  };

  const handleDeleteUser = async (id) => {
    const result = await deleteUserService(id);
    if (result && !result.error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === id ? { ...u, estatus: "Inactivo" } : u
        )
      );
      setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
      toast.success("Usuario eliminado correctamente");
    }
  };

  const handleRestoreUser = async (id) => {
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
  };

  const handleDeleteSelected = async () => {
    await Promise.all(selectedUsers.map((id) => deleteUserService(id)));

    setUsers((prev) =>
      prev.map((u) =>
        selectedUsers.includes(u.id_usuario) ? { ...u, estatus: "Inactivo" } : u
      )
    );
    setSelectedUsers([]);
  };

  const filteredUsers = users.filter((u) => {
    const matchesStatus = showInactive ? true : u.estatus === "Activo";
    const matchesSearch =
      `${u.nombre} ${u.email} ${u.username} ${u.rol} ${u.puesto} ${u.ciudad}`
        .toLowerCase()
        .includes(searchText.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {ciudadesError ? (
        <p style={{ color: "red", marginTop: "1rem" }}>
          No tienes permisos para gestionar usuarios porque no puedes acceder a
          las ciudades.
        </p>
      ) : (
        <>
          <UserToolbar
            onAdd={handleAddUser}
            onDelete={handleDeleteSelected}
            selectedUsers={selectedUsers}
            showInactive={showInactive}
            setShowInactive={setShowInactive}
            onSearch={(text) => setSearchText(text)}
          />
          <UserTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onBulkDelete={handleDeleteSelected}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            onRestore={handleRestoreUser}
          />
          <UserFormModal
            open={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveUser}
            user={editingUser}
            ciudades={ciudades}
            supervisores={supervisores} // <-- Aquí la lista de supervisores
          />
        </>
      )}
    </div>
  );
}
