import * as React from "react";
import {
  Box,
  Table,
  Checkbox,
  IconButton,
  Typography,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Sheet,
  Button,
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Stack from "@mui/joy/Stack";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onBulkDelete,
  onRestore,
}) {
  const [selected, setSelected] = React.useState([]);
  const [sortField, setSortField] = React.useState("nombre");
  const [sortOrder, setSortOrder] = React.useState("asc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleSelectAll = (checked) => {
    setSelected(checked ? users.map((u) => u.id_usuario) : []);
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valA = a[sortField]?.toString().toLowerCase() ?? "";
    const valB = b[sortField]?.toString().toLowerCase() ?? "";
    return sortOrder === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const isInactive = (user) => user.estatus === "Inactivo";

  if (isMobile) {
    // Vista móvil como tarjetas
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

        {sortedUsers.map((user) => (
          <Sheet
            key={user.id_usuario}
            variant="outlined"
            sx={{ p: 2, borderRadius: "md" }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                {/* <Checkbox
                  checked={selected.includes(user.id_usuario)}
                  onChange={() => toggleSelectOne(user.id_usuario)}
                /> */}
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{
                      root: { variant: "plain", color: "neutral" },
                    }}>
                    <MoreHorizRoundedIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => onEdit(user)}>Editar</MenuItem>
                    {isInactive(user) ? (
                      <MenuItem onClick={() => onRestore(user.id_usuario)}>
                        Restaurar
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={() => onDelete(user.id_usuario)}>
                        Eliminar
                      </MenuItem>
                    )}
                  </Menu>
                </Dropdown>
              </Stack>
              <Typography level="title-md">{user.nombre}</Typography>
              <Typography level="body-sm">
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography level="body-sm">
                <strong>Usuario:</strong> {user.username}
              </Typography>
              <Typography level="body-sm">
                <strong>Rol:</strong> {user.rol}
              </Typography>
              <Typography level="body-sm">
                <strong>Puesto:</strong> {user.puesto}
              </Typography>
              <Typography level="body-sm">
                <strong>Ciudad:</strong> {user.ciudad}
              </Typography>
              <Typography
                level="body-sm"
                color={user.estatus === "Activo" ? "success" : "danger"}>
                <strong>Estatus:</strong> {user.estatus}
              </Typography>
            </Stack>
          </Sheet>
        ))}
      </Stack>
    );
  }

  // Tabla para escritorio
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
        aria-label="User table"
        size="sm"
        stickyHeader
        sx={{ minWidth: 800 }}>
        <thead>
          <tr>
            {/* <th>
              <Checkbox
                checked={selected.length === users.length}
                indeterminate={
                  selected.length > 0 && selected.length < users.length
                }
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </th> */}
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
          {sortedUsers.map((user) => (
            <tr key={user.id_usuario}>
              {/* <td>
                <Checkbox
                  checked={selected.includes(user.id_usuario)}
                  onChange={() => toggleSelectOne(user.id_usuario)}
                />
              </td> */}
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.username}</td>
              <td>{user.rol}</td>
              <td>{user.puesto}</td>
              <td>{user.ciudad}</td>
              <td>
                <Typography
                  level="body-sm"
                  color={user.estatus === "Activo" ? "success" : "danger"}>
                  {user.estatus}
                </Typography>
              </td>
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
                    <MenuItem onClick={() => onEdit(user)}>Editar</MenuItem>
                    {isInactive(user) ? (
                      <MenuItem onClick={() => onRestore(user.id_usuario)}>
                        Restaurar
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={() => onDelete(user.id_usuario)}>
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
