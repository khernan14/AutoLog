import React, { useState, useCallback, useMemo } from "react";
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
  Stack,
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function VehiculosTable({
  vehiculos,
  onEdit,
  onDelete,
  onBulkDelete,
  onRestore,
}) {
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState("placa");
  const [sortOrder, setSortOrder] = useState("asc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleSelectAll = useCallback(
    (checked) => {
      setSelected(checked ? vehiculos.map((v) => v.id) : []);
    },
    [vehiculos]
  );

  const toggleSelectOne = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSort = useCallback(
    (field) => {
      if (field === sortField) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    },
    [sortField]
  );

  const sortedVehiculos = useMemo(() => {
    return [...vehiculos].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [vehiculos, sortField, sortOrder]);

  const isInactive = (vehiculo) => vehiculo.estado === "Inactivo";

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {selected.length > 0 && (
          <Button
            color="danger"
            variant="soft"
            startDecorator={<DeleteRoundedIcon />}
            onClick={() => onBulkDelete(selected)}>
            Eliminar seleccionados ({selected.length})
          </Button>
        )}

        {sortedVehiculos.map((vehiculo) => (
          <Sheet
            key={vehiculo.id}
            variant="outlined"
            sx={{ p: 2, borderRadius: "md" }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography level="title-md">{vehiculo.placa}</Typography>
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{
                      root: { variant: "plain", color: "neutral" },
                    }}>
                    <MoreHorizRoundedIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => onEdit(vehiculo)}>Editar</MenuItem>
                    {isInactive(vehiculo) ? (
                      <MenuItem onClick={() => onRestore(vehiculo.id)}>
                        Restaurar
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={() => onDelete(vehiculo.id)}>
                        Eliminar
                      </MenuItem>
                    )}
                  </Menu>
                </Dropdown>
              </Stack>
              <Typography level="body-sm">
                <strong>Marca:</strong> {vehiculo.marca}
              </Typography>
              <Typography level="body-sm">
                <strong>Modelo:</strong> {vehiculo.modelo}
              </Typography>
              <Typography level="body-sm">
                <strong>Estado:</strong> {vehiculo.estado}
              </Typography>
              <Typography level="body-sm">
                <strong>Ubicación:</strong> {vehiculo.nombre_ubicacion}
              </Typography>
            </Stack>
          </Sheet>
        ))}
      </Stack>
    );
  }

  return (
    <Sheet variant="outlined" sx={{ borderRadius: "md", p: 2 }}>
      {selected.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Button
            color="danger"
            variant="soft"
            startDecorator={<DeleteRoundedIcon />}
            onClick={() => onBulkDelete(selected)}>
            Eliminar seleccionados ({selected.length})
          </Button>
        </Box>
      )}
      <Table
        hoverRow
        aria-label="Tabla de vehículos"
        size="sm"
        stickyHeader
        sx={{ minWidth: 800 }}>
        <thead>
          <tr>
            {[
              { label: "Vehículo", key: "placa" },
              { label: "Marca", key: "marca" },
              { label: "Modelo", key: "modelo" },
              { label: "Estado", key: "estado" },
              { label: "Ubicación", key: "nombre_ubicacion" },
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
          {sortedVehiculos.map((vehiculo) => (
            <tr key={vehiculo.id}>
              <td>{vehiculo.placa}</td>
              <td>{vehiculo.marca}</td>
              <td>{vehiculo.modelo}</td>
              <td>
                <Typography
                  level="body-sm"
                  color={
                    vehiculo.estado === "Disponible" ? "success" : "warning"
                  }>
                  {vehiculo.estado}
                </Typography>
              </td>
              <td>{vehiculo.nombre_ubicacion}</td>
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
                    <MenuItem onClick={() => onEdit(vehiculo)}>Editar</MenuItem>
                    {isInactive(vehiculo) ? (
                      <MenuItem onClick={() => onRestore(vehiculo.id)}>
                        Restaurar
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={() => onDelete(vehiculo.id)}>
                        Eliminar
                      </MenuItem>
                    )}
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
