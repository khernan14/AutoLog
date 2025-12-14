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
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";

import useIsMobile from "@/hooks/useIsMobile";

export default function VehiculosTable({
  t,
  vehiculos = [],
  onEdit,
  onDelete,
  onRestore,
  onShowQR,
  canEdit = false,
  canDelete = false,
  canRestore = false,
  canQR = false,
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
    (canRestore && typeof onRestore === "function") ||
    (canQR && typeof onShowQR === "function");

  const isInactive = (v) => (v?.estado || "").toLowerCase() === "inactivo";

  const getHighlightStyle = (id) =>
    typeof highlightStyle === "function" ? highlightStyle(id) : {};

  // Map estado -> color token (joy color names) and fallback styles
  const stateToColor = (estado) => {
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
        return "danger";
      case "reservado":
        return "info";
      case "inactivo":
        return "neutral";
      default:
        return "neutral";
    }
  };

  // compact chip styles shared
  const chipSx = {
    fontSize: 12,
    px: 1,
    py: "2px",
  };

  // ====== MÓVIL: Tarjetas ======
  if (isMobile) {
    return (
      <Stack spacing={2} p={1}>
        {sortedVehiculos.map((v) => {
          const showMenu =
            (canEdit && onEdit) ||
            (canDelete && onDelete && !isInactive(v)) ||
            (canRestore && onRestore && isInactive(v)) ||
            (canQR && onShowQR);

          const isHighlighted = highlightId === v.id;

          return (
            <Sheet
              key={v.id}
              ref={isHighlighted ? focusedRef : null}
              variant="outlined"
              sx={{
                p: 1,
                borderRadius: "md",
                ...getHighlightStyle(v.id),
              }}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box>
                    <Typography level="title-md" sx={{ fontSize: 15 }}>
                      {v.placa}
                    </Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.75 }}>
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
                        aria-label={t?.("vehiculos.actions", "Acciones")}>
                        <MoreHorizRoundedIcon />
                      </MenuButton>
                      <Menu>
                        {canEdit && onEdit && (
                          <MenuItem onClick={() => onEdit(v)}>
                            {t?.("vehiculos.edit", "Editar")}
                          </MenuItem>
                        )}
                        {isInactive(v)
                          ? canRestore &&
                            onRestore && (
                              <MenuItem onClick={() => onRestore(v.id)}>
                                {t?.("vehiculos.restore", "Restaurar")}
                              </MenuItem>
                            )
                          : canDelete &&
                            onDelete && (
                              <MenuItem onClick={() => onDelete(v.id)}>
                                {t?.("vehiculos.disable", "Inactivar")}
                              </MenuItem>
                            )}
                        {canQR && onShowQR && (
                          <MenuItem onClick={() => onShowQR(v)}>
                            {t?.("vehiculos.view_qr", "Ver QR registro")}
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
                    color={stateToColor(v.estado)}
                    sx={chipSx}>
                    {t?.(
                      `vehiculos.states.${(v.estado || "unknown")
                        .toLowerCase()
                        .replace(/\s+/g, "_")}`,
                      v.estado
                    ) ||
                      v.estado ||
                      "—"}
                  </Chip>
                  <Chip size="sm" variant="soft" sx={chipSx}>
                    {v.nombre_ubicacion ||
                      t?.("vehiculos.no_location", "Sin ubicación")}
                  </Chip>
                </Stack>
              </Stack>
            </Sheet>
          );
        })}
      </Stack>
    );
  }

  // ====== ESCRITORIO: Tabla (compacta) ======
  return (
    <Table
      hoverRow
      aria-label={t?.("vehiculos.table_aria", "Tabla de vehículos")}
      size="sm"
      stickyHeader
      sx={{
        minWidth: 700,
        "--TableCell-headBackground": "var(--joy-palette-background-level5)",
        "--TableCell-headColor": "var(--joy-palette-text-secondary)",
        "--TableCell-headFontWeight": "600",
        "--TableCell-headBorderBottom": "1px solid var(--joy-palette-divider)",
        "--TableRow-hoverBackground": "var(--joy-palette-background-level1)",
        // compact adjustments:
        "--TableCell-padding": "8px 10px",
        "--TableCell-gap": "6px",
      }}>
      <thead>
        <tr>
          {[
            { label: t?.("vehiculos.col_vehicle", "Vehículo"), key: "placa" },
            { label: t?.("vehiculos.col_brand", "Marca"), key: "marca" },
            { label: t?.("vehiculos.col_model", "Modelo"), key: "modelo" },
            { label: t?.("vehiculos.col_status", "Estado"), key: "estado" },
            {
              label: t?.("vehiculos.col_location", "Ubicación"),
              key: "nombre_ubicacion",
            },
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
                <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                  {col.label}
                </Typography>
              </Button>
            </th>
          ))}

          {hasActions && <th>{t?.("vehiculos.col_actions", "Acciones")}</th>}
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
              <td>
                <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                  {v.placa}
                </Typography>
              </td>
              <td>
                <Typography level="body-sm">{v.marca}</Typography>
              </td>
              <td>
                <Typography level="body-sm">{v.modelo}</Typography>
              </td>
              <td>
                <Chip
                  size="sm"
                  variant="soft"
                  color={stateToColor(v.estado)}
                  sx={chipSx}>
                  {t?.(
                    `vehiculos.states.${(v.estado || "unknown")
                      .toLowerCase()
                      .replace(/\s+/g, "_")}`,
                    v.estado
                  ) ||
                    v.estado ||
                    "—"}
                </Chip>
              </td>
              <td>
                {v.nombre_ubicacion ? (
                  <Chip size="sm" variant="soft" sx={chipSx}>
                    {v.nombre_ubicacion}
                  </Chip>
                ) : (
                  t?.("vehiculos.no_location", "—")
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
                      aria-label={t?.("vehiculos.actions", "Acciones")}>
                      <MoreHorizRoundedIcon />
                    </MenuButton>
                    <Menu>
                      {canEdit && onEdit && (
                        <MenuItem onClick={() => onEdit(v)}>
                          <EditRoundedIcon fontSize="small" />
                          {t?.("vehiculos.edit", "Editar")}
                        </MenuItem>
                      )}
                      {isInactive(v)
                        ? canRestore &&
                          onRestore && (
                            <MenuItem onClick={() => onRestore(v.id)}>
                              <RestoreRoundedIcon fontSize="small" />
                              {t?.("vehiculos.restore", "Restaurar")}
                            </MenuItem>
                          )
                        : canDelete &&
                          onDelete && (
                            <MenuItem onClick={() => onDelete(v.id)}>
                              <DeleteRoundedIcon fontSize="small" />
                              {t?.("vehiculos.disable", "Inactivar")}
                            </MenuItem>
                          )}
                      {canQR && onShowQR && (
                        <MenuItem onClick={() => onShowQR(v)}>
                          <QrCodeRoundedIcon fontSize="small" />
                          {t?.("vehiculos.view_qr", "Ver QR registro")}
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
