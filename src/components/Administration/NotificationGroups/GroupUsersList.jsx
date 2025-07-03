import { useEffect, useState } from "react";
import { Typography, Table, Button, Sheet } from "@mui/joy";
import { getGroupUsers } from "../../../services/GroupServices";

const GroupUsersList = ({ group }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (group) {
      fetchGroupUsers();
    } else {
      setUsers([]);
    }
  }, [group]);

  const fetchGroupUsers = async () => {
    const data = await getGroupUsers(group.id);
    if (data) setUsers(data);
  };

  if (!group) {
    return (
      <Typography level="body-sm">
        Selecciona un grupo para ver sus usuarios.
      </Typography>
    );
  }

  return (
    <>
      <Typography level="title-md" mb={1}>
        Usuarios en: {group.nombre}
      </Typography>
      <Button size="sm" variant="outlined" sx={{ mb: 1 }}>
        + Asignar Usuario
      </Button>

      <Sheet variant="soft">
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id_usuario}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <Button size="sm" color="danger">
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </>
  );
};

export default GroupUsersList;
