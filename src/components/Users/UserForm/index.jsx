import React, { useState, useEffect } from "react";
import UserToolbar from "./UserToolbar";
import UserTable from "./UserTable";
import UserFormModal from "./UserFormModal";
import {
  createUserService,
  updateUser as updateUserService,
} from "../../../services/AuthServices";
import { getCiudades } from "../../../services/RegistrosService";

export default function UsersForm({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [ciudades, setCiudades] = useState([]);

  useEffect(() => {
    setUsers(initialUsers);
    fetchCiudades();
  }, [initialUsers]);

  const fetchCiudades = async () => {
    try {
      const data = await getCiudades();
      setCiudades(data); // ahora sí lo actualiza bien
    } catch (error) {
      console.error("Error cargando ciudades:", error);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeleteSelected = () => {
    const filtered = users.filter(
      (user) => !selectedUsers.includes(user.id_usuario)
    );
    setUsers(filtered);
    setSelectedUsers([]);
  };

  const handleSaveUser = async (newUser) => {
    let result = null;

    if (newUser.id_usuario) {
      // Editar
      result = await updateUserService(newUser);
      if (result && !result.error) {
        // Mapea id ciudad a nombre usando la lista ciudades que tienes en estado
        const ciudadNombre =
          ciudades.find((c) => c.id === newUser.ciudad)?.nombre || "";

        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === newUser.id_usuario
              ? { ...u, ...newUser, ciudad: ciudadNombre }
              : u
          )
        );
      }
    } else {
      // Crear nuevo usuario
      result = await createUserService(newUser);
      if (result && !result.error) {
        const ciudadNombre =
          ciudades.find((c) => c.id === newUser.ciudad)?.nombre || "";

        setUsers((prev) => [...prev, { ...result, ciudad: ciudadNombre }]);
      }
    }

    return result;
  };

  return (
    <div>
      <UserToolbar
        onAdd={handleAddUser}
        onDelete={handleDeleteSelected}
        selectedUsers={selectedUsers}
      />
      <UserTable
        users={users}
        onEdit={handleEditUser}
        onDelete={(id) =>
          setUsers((prev) => prev.filter((u) => u.id_usuario !== id))
        }
        onBulkDelete={handleDeleteSelected}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
      <UserFormModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        ciudades={ciudades}
      />
    </div>
  );
}
