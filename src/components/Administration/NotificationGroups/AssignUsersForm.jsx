import { useEffect, useState } from "react";
import {
  Autocomplete,
  FormControl,
  FormLabel,
  Button,
  Stack,
  Typography,
} from "@mui/joy";
import { getEmpleados } from "../../../services/AuthServices";

const AssignUsersForm = ({ groupId, onAssign, onCancel }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (!groupId) return;
    const fetchUsers = async () => {
      const data = await getEmpleados();
      if (data) setUsuarios(data);
      setSelectedUsers([]);
    };
    fetchUsers();
  }, [groupId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupId) return;
    if (selectedUsers.length === 0) return;

    onAssign({
      groupId,
      userIds: selectedUsers.map((u) => u.id_usuario),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography level="title-md">Asignar Usuarios al Grupo</Typography>

        <FormControl id="multiple-limit-tags">
          <FormLabel>Usuarios</FormLabel>
          <Autocomplete
            multiple
            limitTags={2}
            options={usuarios}
            getOptionLabel={(option) => option.nombre}
            inputProps={{ placeholder: "Selecciona usuarios" }}
            value={selectedUsers}
            onChange={(e, newValue) => setSelectedUsers(newValue)}
            sx={{ width: 500 }}
          />
        </FormControl>

        <Stack direction="row" spacing={1}>
          <Button type="submit">Asignar</Button>
          <Button variant="outlined" color="neutral" onClick={onCancel}>
            Cancelar
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default AssignUsersForm;
