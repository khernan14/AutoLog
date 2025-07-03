import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
} from "@mui/joy";

const GroupForm = ({ onSubmit, initialData = {}, onCancel }) => {
  const [nombre, setNombre] = useState(initialData.nombre || "");
  const [descripcion, setDescripcion] = useState(initialData.descripcion || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSubmit({ ...initialData, nombre, descripcion });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* <Typography level="title-md" mb={1}>
        {initialData.id ? "Editar Grupo" : "Nuevo Grupo"}
      </Typography> */}

      <Stack spacing={2}>
        <FormControl>
          <FormLabel>Nombre del Grupo</FormLabel>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Administradores, Soporte, Seguridad"
            required
          />
        </FormControl>

        <FormControl>
          <FormLabel>Descripción</FormLabel>
          <Input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción del grupo"
          />
        </FormControl>

        <Stack direction="row" spacing={1}>
          <Button type="submit">
            {initialData.id ? "Actualizar" : "Crear"}
          </Button>
          {onCancel && (
            <Button variant="outlined" color="neutral" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default GroupForm;
