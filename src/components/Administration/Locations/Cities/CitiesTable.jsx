import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Table,
  IconButton,
  Typography,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Sheet,
  Button,
  Tooltip,
  Stack,
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function CitiesTable({ cities, onEdit, onDelete, onAdd }) {
  const [sortField, setSortField] = useState("ciudad");
  const [sortOrder, setSortOrder] = useState("asc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSort = useCallback((field) => {
    setSortField((prev) => (prev === field ? field : field));
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [cities, sortField, sortOrder]);

  const handleDelete = useCallback(
    (city) => {
      Swal.fire({
        title: `¿Eliminar ciudad "${city.ciudad}"?`,
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          onDelete(city.id)
            .then(() => toast.success("Ciudad eliminada correctamente"))
            .catch((error) => {
              toast.error("Error al eliminar la ciudad");
              console.error("Delete error:", error);
            });
        }
      });
    },
    [onDelete]
  );

  if (isMobile) {
    return (
      <>
        <Stack spacing={2}>
          {sortedCities.map((city) => (
            <Sheet
              key={city.id}
              variant="outlined"
              sx={{ p: 2, borderRadius: "md" }}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography level="title-md">{city.ciudad}</Typography>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{
                        root: { variant: "plain", color: "neutral" },
                      }}>
                      <MoreHorizRoundedIcon />
                    </MenuButton>
                    <Menu>
                      <MenuItem onClick={() => onEdit(city)}>Editar</MenuItem>
                      <MenuItem
                        color="danger"
                        onClick={() => handleDelete(city)}>
                        Eliminar
                      </MenuItem>
                    </Menu>
                  </Dropdown>
                </Stack>
                <Typography level="body-sm">
                  <strong>País:</strong> {city.pais}
                </Typography>
                <Typography level="body-xs" color="neutral">
                  ID: {city.id}
                </Typography>
              </Stack>
            </Sheet>
          ))}
        </Stack>

        <Tooltip title="Agregar ciudad" placement="left">
          <IconButton
            onClick={onAdd}
            color="primary"
            size="lg"
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              borderRadius: "50%",
              boxShadow: "md",
              zIndex: 1200,
            }}>
            <AddIcon sx={{ color: "white" }} />
          </IconButton>
        </Tooltip>
      </>
    );
  }

  return (
    <Sheet variant="outlined" sx={{ borderRadius: "md", p: 2 }}>
      <Table
        hoverRow
        aria-label="Tabla de ciudades"
        size="sm"
        stickyHeader
        sx={{ minWidth: 700 }}>
        <thead>
          <tr>
            {[
              { label: "Ciudad", key: "ciudad" },
              { label: "País", key: "pais" },
            ].map((col) => (
              <th key={col.key}>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => handleSort(col.key)}
                  endDecorator={<ArrowDropDownIcon />}>
                  {col.label}
                </Button>
              </th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedCities.map((city) => (
            <tr key={city.id}>
              <td>{city.ciudad}</td>
              <td>{city.pais}</td>
              <td>
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{
                      root: { variant: "plain", color: "neutral" },
                    }}>
                    <MoreHorizRoundedIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => onEdit(city)}>Editar</MenuItem>
                    <MenuItem color="danger" onClick={() => handleDelete(city)}>
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
