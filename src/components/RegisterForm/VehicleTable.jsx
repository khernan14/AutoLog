import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  Typography,
  Chip,
  Sheet,
  Stack,
  Button,
  IconButton,
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { useTranslation } from "react-i18next";

/**
 * VehicleTable
 * props:
 *  - vehicles: array
 *  - onRowClick?: fn(vehicle)
 *  - compact?: boolean (si quieres aún más denso)
 */
export default function VehicleTable({
  vehicles = [],
  onRowClick,
  compact = false,
}) {
  const { t } = useTranslation();
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
    const arr = Array.isArray(vehicles) ? [...vehicles] : [];
    arr.sort((a, b) => {
      const valA = (a?.[sortField] ?? "").toString().toLowerCase();
      const valB = (b?.[sortField] ?? "").toString().toLowerCase();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
    return arr;
  }, [vehicles, sortField, sortOrder]);

  // asigna tokens o estilos por estado
  const getEstadoColor = (estado) => {
    if (!estado) return "neutral";
    const key = estado.toString().toLowerCase();
    switch (key) {
      case "disponible":
        return "success";
      case "en uso":
      case "en_uso":
      case "en-uso":
        return "warning";
      case "en mantenimiento":
      case "en_mantenimiento":
      case "en-mantenimiento":
        // usamos danger para resaltar mantenimiento
        return "danger";
      case "reservado":
        return "info";
      case "inactivo":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const headers = [
    { label: t("vehiculos.col_vehicle", "Vehículo"), key: "placa" },
    { label: t("vehiculos.col_brand", "Marca"), key: "marca" },
    { label: t("vehiculos.col_model", "Modelo"), key: "modelo" },
    { label: t("vehiculos.col_status", "Estado"), key: "estado" },
    {
      label: t("vehiculos.col_location", "Ubicación"),
      key: "nombre_ubicacion",
    },
  ];

  // compact styles
  const tableSx = {
    minWidth: 700,
    ...(compact && { "--TableCell-padding": "6px 8px", fontSize: 13 }),
  };

  // Mobile card view
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {sortedVehicles.length > 0 ? (
          sortedVehicles.map((veh) => (
            <Sheet
              key={veh.id ?? veh.placa}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "md",
                cursor: onRowClick ? "pointer" : "default",
                "&:hover": onRowClick
                  ? { boxShadow: "sm", transform: "translateY(-1px)" }
                  : {},
              }}
              onClick={() => onRowClick?.(veh)}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box>
                    <Typography level="title-sm" sx={{ fontWeight: 700 }}>
                      {veh.placa || t("vehiculos.na", "N/A")}
                    </Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                      {veh.marca || "—"} • {veh.modelo || "—"}
                    </Typography>
                  </Box>
                  <Chip size="sm" color={getEstadoColor(veh.estado)}>
                    {t(
                      `vehiculos.states.${(veh.estado || "unknown")
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`,
                      veh.estado
                    )}
                  </Chip>
                </Stack>

                <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                  <strong>
                    {t("vehiculos.col_location_short", "Ubicación:")}
                  </strong>{" "}
                  {veh.nombre_ubicacion ||
                    t("vehiculos.no_location", "Sin ubicación")}
                </Typography>
              </Stack>
            </Sheet>
          ))
        ) : (
          <Typography level="body-sm" textAlign="center">
            {t("vehiculos.no_vehicles", "No hay vehículos disponibles.")}
          </Typography>
        )}
      </Stack>
    );
  }

  // Desktop table
  return (
    <Sheet variant="outlined" sx={{ borderRadius: "md", p: 2 }}>
      <Table
        aria-label={t("vehiculos.table_aria", "Tabla de vehículos")}
        hoverRow
        stickyHeader
        size="sm"
        sx={tableSx}>
        <thead>
          <tr>
            {headers.map((col) => (
              <th key={col.key}>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => handleSort(col.key)}
                  endDecorator={
                    <ArrowDropDownIcon
                      sx={{
                        transform:
                          sortField === col.key && sortOrder === "desc"
                            ? "rotate(180deg)"
                            : "none",
                        transition: "0.15s",
                      }}
                    />
                  }>
                  {col.label}
                </Button>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedVehicles.length > 0 ? (
            sortedVehicles.map((veh) => (
              <tr
                key={veh.id ?? veh.placa}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
                onClick={() => onRowClick?.(veh)}>
                <td>
                  <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                    {veh.placa || t("vehiculos.na", "N/A")}
                  </Typography>
                </td>
                <td>{veh.marca || "—"}</td>
                <td>{veh.modelo || "—"}</td>
                <td>
                  <Chip size="sm" color={getEstadoColor(veh.estado)}>
                    {t(
                      `vehiculos.states.${(veh.estado || "unknown")
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`,
                      veh.estado
                    )}
                  </Chip>
                </td>
                <td>
                  {veh.nombre_ubicacion || t("vehiculos.no_location", "—")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <Typography level="body-sm" textAlign="center">
                  {t("vehiculos.no_vehicles", "No hay vehículos disponibles.")}
                </Typography>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Sheet>
  );
}
