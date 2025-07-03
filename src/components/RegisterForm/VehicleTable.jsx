import React, { useState, useMemo } from "react";
import { Box, Table, Typography, Chip, Sheet, Stack, Button } from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function VehicleTable({ vehicles }) {
  const [sortField, setSortField] = useState("placa");
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

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [vehicles, sortField, sortOrder]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Disponible":
        return "success";
      case "En Uso":
        return "warning";
      case "Inactivo":
        return "neutral";
      default:
        return "neutral";
    }
  };

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {sortedVehicles.length > 0 ? (
          sortedVehicles.map((veh, index) => (
            <Sheet
              key={veh.id || index}
              variant="outlined"
              sx={{ p: 2, borderRadius: "md" }}>
              <Typography level="title-sm">{veh.placa || "N/A"}</Typography>
              <Typography level="body-sm">
                <strong>Marca:</strong> {veh.marca || "N/A"}
              </Typography>
              <Typography level="body-sm">
                <strong>Modelo:</strong> {veh.modelo || "N/A"}
              </Typography>
              <Typography level="body-sm">
                <strong>Estado:</strong>{" "}
                <Chip size="sm" color={getEstadoColor(veh.estado)}>
                  {veh.estado}
                </Chip>
              </Typography>
              <Typography level="body-sm">
                <strong>Ubicación:</strong> {veh.nombre_ubicacion || "N/A"}
              </Typography>
            </Sheet>
          ))
        ) : (
          <Typography level="body-sm" textAlign="center">
            No hay vehículos disponibles.
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Sheet variant="outlined" sx={{ borderRadius: "md", p: 2 }}>
      <Table
        aria-label="Tabla de vehículos"
        hoverRow
        stickyHeader
        size="sm"
        sx={{ minWidth: 700 }}>
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
          </tr>
        </thead>
        <tbody>
          {sortedVehicles.length > 0 ? (
            sortedVehicles.map((veh, index) => (
              <tr key={veh.id || index}>
                <td>{veh.placa || "N/A"}</td>
                <td>{veh.marca || "N/A"}</td>
                <td>{veh.modelo || "N/A"}</td>
                <td>
                  <Chip size="sm" color={getEstadoColor(veh.estado)}>
                    {veh.estado}
                  </Chip>
                </td>
                <td>{veh.nombre_ubicacion || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <Typography level="body-sm" textAlign="center">
                  No hay vehículos disponibles.
                </Typography>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Sheet>
  );
}
