import { useMemo, useState, useCallback } from "react";
import {
  Sheet,
  Table,
  Stack,
  IconButton,
  Checkbox,
  Chip,
  Typography,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
} from "@mui/joy";
import useIsMobile from "../../../hooks/useIsMobile";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function UserTable({
  users,
  selected,
  setSelected,
  onEdit,
  onDelete,
  onRestore,
  canEdit,
  canDelete,
  canRestore,
  highlightId,
  focusedRef,
}) {
  const isMobile = useIsMobile(768);

  const [sortField, setSortField] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");

  const toggleSelectAll = useCallback(
    (checked) => {
      setSelected(checked ? users.map((u) => u.id_usuario) : []);
    },
    [users, setSelected]
  );

  const toggleSelectOne = useCallback(
    (id) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setSelected]
  );

  const handleSort = useCallback(
    (field) => {
      if (field === sortField)
        setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
      else {
        setSortField(field);
        setSortOrder("asc");
      }
    },
    [sortField]
  );

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [users, sortField, sortOrder]);

  const isInactive = (u) => (u.estatus || "Activo") !== "Activo";

  // ====== Mobile: tarjetas ======
  if (isMobile) {
    return (
      <Stack spacing={2} p={1}>
        {sorted.map((u) => {
          const id = u.id_usuario;
          const checked = selected.includes(id);
          const isHighlighted = highlightId === id;

          return (
            <Sheet
              key={id}
              // ⭐ asignamos el ref solo a la tarjeta destacada
              ref={isHighlighted ? focusedRef : null}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "md",
                transition:
                  "background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                ...(isHighlighted
                  ? {
                      backgroundColor: "rgba(59, 130, 246, 0.08)",
                      boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.6)",
                      borderColor: "primary.solidBg",
                    }
                  : {}),
              }}>
              <Stack spacing={0.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox
                      size="sm"
                      checked={checked}
                      onChange={() => toggleSelectOne(id)}
                    />
                    <Typography level="title-md">{u.nombre}</Typography>
                  </Stack>
                  <Dropdown>
                    <MenuButton
                      slots={{ root: IconButton }}
                      slotProps={{
                        root: { variant: "plain", color: "neutral" },
                      }}>
                      <MoreHorizRoundedIcon />
                    </MenuButton>
                    <Menu>
                      <MenuItem disabled={!canEdit} onClick={() => onEdit?.(u)}>
                        Editar
                      </MenuItem>
                      {isInactive(u) ? (
                        <MenuItem
                          disabled={!canRestore}
                          onClick={() => onRestore?.(id)}>
                          Restaurar
                        </MenuItem>
                      ) : (
                        <MenuItem
                          disabled={!canDelete}
                          onClick={() => onDelete?.(id)}>
                          Inactivar
                        </MenuItem>
                      )}
                    </Menu>
                  </Dropdown>
                </Stack>

                <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                  {u.email}
                </Typography>
                <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                  Usuario: {u.username}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 0.5, flexWrap: "wrap" }}>
                  {u.rol && (
                    <Chip size="sm" variant="soft" color="primary">
                      {u.rol}
                    </Chip>
                  )}
                  {u.puesto && (
                    <Chip size="sm" variant="outlined">
                      {u.puesto}
                    </Chip>
                  )}
                  {u.ciudad && (
                    <Chip size="sm" variant="soft" color="neutral">
                      {u.ciudad}
                    </Chip>
                  )}
                  <Chip
                    size="sm"
                    variant="soft"
                    color={isInactive(u) ? "neutral" : "success"}
                    sx={{ ml: "auto" }}>
                    {u.estatus || "Activo"}
                  </Chip>
                </Stack>
              </Stack>
            </Sheet>
          );
        })}
      </Stack>
    );
  }

  // ====== Desktop: tabla ======
  const allChecked = selected.length > 0 && selected.length === users.length;

  return (
    <Sheet variant="outlined" sx={{ borderRadius: "md", p: 2 }}>
      <Table hoverRow size="sm" stickyHeader sx={{ minWidth: 1100 }}>
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Checkbox
                checked={allChecked}
                indeterminate={selected.length > 0 && !allChecked}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </th>
            {[
              { label: "Nombre", key: "nombre" },
              { label: "Email", key: "email" },
              { label: "Usuario", key: "username" },
              { label: "Rol", key: "rol" },
              { label: "Puesto", key: "puesto" },
              { label: "Ciudad", key: "ciudad" },
              { label: "Estatus", key: "estatus" },
            ].map((col) => (
              <th key={col.key}>
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => handleSort(col.key)}
                  aria-label={`Ordenar por ${col.label}`}>
                  {col.label}
                  <ArrowDropDownIcon fontSize="small" />
                </IconButton>
              </th>
            ))}
            <th style={{ width: 160 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((u) => {
            const id = u.id_usuario;
            const checked = selected.includes(id);
            const isHighlighted = highlightId === id;

            return (
              <tr
                key={id}
                // ⭐ ref solo en la fila destacada
                ref={isHighlighted ? focusedRef : null}
                style={
                  isHighlighted
                    ? {
                        backgroundColor: "rgba(59, 130, 246, 0.12)",
                        boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.6) inset",
                        transition:
                          "background-color 0.25s ease, box-shadow 0.25s ease",
                      }
                    : undefined
                }>
                <td>
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleSelectOne(id)}
                  />
                </td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.rol || "—"}</td>
                <td>{u.puesto || "—"}</td>
                <td>{u.ciudad || "—"}</td>
                <td>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={isInactive(u) ? "neutral" : "success"}>
                    {u.estatus || "Activo"}
                  </Chip>
                </td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <Tooltip
                      title={canEdit ? "Editar" : "Sin permiso"}
                      variant="soft">
                      <span>
                        <IconButton
                          onClick={() => onEdit?.(u)}
                          disabled={!canEdit}
                          variant={canEdit ? "soft" : "plain"}
                          color={canEdit ? "primary" : "neutral"}>
                          <EditRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    {isInactive(u) ? (
                      <Tooltip
                        title={canRestore ? "Restaurar" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            onClick={() => onRestore?.(id)}
                            disabled={!canRestore}
                            variant={canRestore ? "soft" : "plain"}
                            color={canRestore ? "success" : "neutral"}>
                            <RestoreFromTrashRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title={canDelete ? "Inactivar" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            onClick={() => onDelete?.(id)}
                            disabled={!canDelete}
                            variant={canDelete ? "soft" : "plain"}
                            color={canDelete ? "danger" : "neutral"}>
                            <DeleteRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Stack>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Sheet>
  );
}
