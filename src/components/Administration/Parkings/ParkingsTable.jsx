import {
  Box,
  Table,
  Typography,
  IconButton,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Sheet,
  Stack,
  Button,
} from "@mui/joy";
import MoreHorizIcon from "@mui/icons-material/MoreHorizRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function ParkingsTable({ parkings, onEdit, onDelete }) {
  const [sortField, setSortField] = useState("nombre_ubicacion");
  const [sortOrder, setSortOrder] = useState("asc");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedData = [...parkings].sort((a, b) => {
    const valA = a[sortField]?.toString().toLowerCase() || "";
    const valB = b[sortField]?.toString().toLowerCase() || "";
    return sortOrder === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const handleDelete = (parking) => {
    Swal.fire({
      title: `¿Eliminar "${parking.nombre_ubicacion}"?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(parking.id)
          .then(() => toast.success("Estacionamiento eliminado"))
          .catch(() => toast.error("Error al eliminar"));
      }
    });
  };

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {sortedData.map((p) => (
          <Sheet
            key={p.id}
            variant="outlined"
            sx={{ p: 2, borderRadius: "md" }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography level="title-md">{p.nombre_ubicacion}</Typography>
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: "plain" } }}>
                    <MoreHorizIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => onEdit(p)}>Editar</MenuItem>
                    <MenuItem color="danger" onClick={() => handleDelete(p)}>
                      Eliminar
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </Stack>
              <Typography level="body-sm">
                <strong>Ciudad:</strong> {p.ciudad}
              </Typography>
              <Typography level="body-xs">ID: {p.id}</Typography>
            </Stack>
          </Sheet>
        ))}
      </Stack>
    );
  }

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
      <Table hoverRow size="sm" stickyHeader>
        <thead>
          <tr>
            <th>
              <Button
                variant="plain"
                size="sm"
                onClick={() => handleSort("nombre_ubicacion")}
                endDecorator={<ArrowDropDownIcon />}>
                Ubicación
              </Button>
            </th>
            <th>
              <Button
                variant="plain"
                size="sm"
                onClick={() => handleSort("nombre_ciudad")}
                endDecorator={<ArrowDropDownIcon />}>
                Ciudad
              </Button>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre_ubicacion}</td>
              <td>{p.nombre_ciudad}</td>
              <td>
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { variant: "plain" } }}>
                    <MoreHorizIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => onEdit(p)}>Editar</MenuItem>
                    <MenuItem color="danger" onClick={() => handleDelete(p)}>
                      Eliminar
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  );
}
