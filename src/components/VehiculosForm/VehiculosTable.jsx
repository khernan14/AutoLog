// src/components/VehiculosForm/VehiculosTable.jsx
import React, { useMemo, useState, useCallback } from "react";
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
  Chip,
} from "@mui/joy";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import useIsMobile from "@/hooks/useIsMobile";

/**
 * Presentacional.
 * Props:
 * - vehiculos: Array<{ id, placa, marca, modelo, estado, nombre_ubicacion }>
 * - onEdit?: (vehiculo) => void
 * - onDelete?: (id) => void
 * - onRestore?: (id) => void
 * - canEdit?: boolean
 * - canDelete?: boolean
 * - canRestore?: boolean
 * - highlightId?: number | string
 * - focusedRef?: React.RefObject
 * - highlightStyle?: (id) => React.CSSProperties
 */
export default function VehiculosTable({
  vehiculos = [],
  onEdit,
  onDelete,
  onRestore,
  canEdit = false,
  canDelete = false,
  canRestore = false,
  highlightId,
  focusedRef,
  highlightStyle,
}) {
  const isMobile = useIsMobile(768);

  const [sortField, setSortField] = useState("placa");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = useCallback(
    (field) => {
      if (field === sortField) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    },
    [sortField]
  );

  const sortedVehiculos = useMemo(() => {
    const arr = Array.isArray(vehiculos) ? [...vehiculos] : [];
    arr.sort((a, b) => {
      const A = (a?.[sortField] ?? "").toString().toLowerCase();
      const B = (b?.[sortField] ?? "").toString().toLowerCase();
      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [vehiculos, sortField, sortOrder]);

  const hasActions =
    (canEdit && typeof onEdit === "function") ||
    (canDelete && typeof onDelete === "function") ||
    (canRestore && typeof onRestore === "function");

  const isInactive = (v) => (v?.estado || "").toLowerCase() === "inactivo";

  const getHighlightStyle = (id) =>
    typeof highlightStyle === "function" ? highlightStyle(id) : {};

  // ====== MÓVIL: Tarjetas ======
  if (isMobile) {
    return (
      <Stack spacing={2} p={2}>
        {sortedVehiculos.map((v) => {
          const showMenu =
            (canEdit && onEdit) ||
            (canDelete && onDelete && !isInactive(v)) ||
            (canRestore && onRestore && isInactive(v));

          const isHighlighted = highlightId === v.id;

          return (
            <Sheet
              key={v.id}
              ref={isHighlighted ? focusedRef : null}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "md",
                ...getHighlightStyle(v.id),
              }}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box>
                    <Typography level="title-md">{v.placa}</Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                      {v.marca} · {v.modelo}
                    </Typography>
                  </Box>

                  {showMenu && (
                    <Dropdown>
                      <MenuButton
                        slots={{ root: IconButton }}
                        slotProps={{
                          root: { variant: "plain", color: "neutral" },
                        }}
                        aria-label="Acciones">
                        <MoreHorizRoundedIcon />
                      </MenuButton>
                      <Menu>
                        {canEdit && onEdit && (
                          <MenuItem onClick={() => onEdit(v)}>
                            <EditRoundedIcon fontSize="small" />
                            Editar
                          </MenuItem>
                        )}
                        {isInactive(v)
                          ? canRestore &&
                            onRestore && (
                              <MenuItem onClick={() => onRestore(v.id)}>
                                <RestoreRoundedIcon fontSize="small" />
                                Restaurar
                              </MenuItem>
                            )
                          : canDelete &&
                            onDelete && (
                              <MenuItem onClick={() => onDelete(v.id)}>
                                <DeleteRoundedIcon fontSize="small" />
                                Inactivar
                              </MenuItem>
                            )}
                      </Menu>
                    </Dropdown>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    size="sm"
                    variant="soft"
                    color={v.estado === "Disponible" ? "success" : "warning"}>
                    {v.estado || "—"}
                  </Chip>
                  <Chip size="sm" variant="soft">
                    {v.nombre_ubicacion || "Sin ubicación"}
                  </Chip>
                </Stack>
              </Stack>
            </Sheet>
          );
        })}
      </Stack>
    );
  }

  // ====== ESCRITORIO: Tabla ======
  return (
    <Table
      hoverRow
      aria-label="Tabla de vehículos"
      size="sm"
      stickyHeader
      sx={{
        minWidth: 800,
        "--TableCell-headBackground": "var(--joy-palette-background-level5)",
        "--TableCell-headColor": "var(--joy-palette-text-secondary)",
        "--TableCell-headFontWeight": 600,
        "--TableCell-headBorderBottom": "1px solid var(--joy-palette-divider)",
        "--TableRow-hoverBackground": "var(--joy-palette-background-level1)",
      }}>
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
                endDecorator={
                  <ArrowDropDownIcon
                    sx={{
                      transform:
                        sortField === col.key && sortOrder === "desc"
                          ? "rotate(180deg)"
                          : "none",
                      transition: "0.2s",
                      opacity: sortField === col.key ? 1 : 0.4,
                    }}
                  />
                }>
                {col.label}
              </Button>
            </th>
          ))}

          {hasActions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {sortedVehiculos.map((v) => {
          const isHighlighted = highlightId === v.id;
          return (
            <tr
              key={v.id}
              ref={isHighlighted ? focusedRef : null}
              style={getHighlightStyle(v.id)}>
              <td>{v.placa}</td>
              <td>{v.marca}</td>
              <td>{v.modelo}</td>
              <td>
                <Chip
                  size="sm"
                  variant="soft"
                  color={v.estado === "Disponible" ? "success" : "warning"}>
                  {v.estado || "—"}
                </Chip>
              </td>
              <td>
                {v.nombre_ubicacion ? (
                  <Chip size="sm" variant="soft">
                    {v.nombre_ubicacion}
                  </Chip>
                ) : (
                  "—"
                )}
              </td>

              {hasActions && (
                <td>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{
                        root: { variant: "plain", color: "neutral" },
                      }}
                      aria-label="Acciones">
                      <MoreHorizRoundedIcon />
                    </MenuButton>
                    <Menu>
                      {canEdit && onEdit && (
                        <MenuItem onClick={() => onEdit(v)}>
                          <EditRoundedIcon fontSize="small" />
                          Editar
                        </MenuItem>
                      )}
                      {isInactive(v)
                        ? canRestore &&
                          onRestore && (
                            <MenuItem onClick={() => onRestore(v.id)}>
                              <RestoreRoundedIcon fontSize="small" />
                              Restaurar
                            </MenuItem>
                          )
                        : canDelete &&
                          onDelete && (
                            <MenuItem onClick={() => onDelete(v.id)}>
                              <DeleteRoundedIcon fontSize="small" />
                              Inhabilitar
                            </MenuItem>
                          )}
                    </Menu>
                  </Dropdown>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
