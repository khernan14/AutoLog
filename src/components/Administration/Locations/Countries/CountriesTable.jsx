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
  Stack,
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function CountriesTable({ countries, onEdit }) {
  const [sortField, setSortField] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [countries, sortField, sortOrder]);

  if (isMobile) {
    return (
      <Stack spacing={2}>
        {sortedCountries.map((country) => (
          <Sheet
            key={country.id}
            variant="outlined"
            sx={{ p: 2, borderRadius: "md" }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography level="title-md">{country.nombre}</Typography>
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{
                      root: { variant: "plain", color: "neutral" },
                    }}>
                    <MoreHorizRoundedIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => onEdit(country)}>Editar</MenuItem>
                  </Menu>
                </Dropdown>
              </Stack>
              <Typography level="body-xs" color="neutral">
                ID: {country.id}
              </Typography>
            </Stack>
          </Sheet>
        ))}
      </Stack>
    );
  }

  return (
    <Sheet variant="outlined" sx={{ borderRadius: "md", p: 2 }}>
      <Table
        hoverRow
        aria-label="Tabla de países"
        size="sm"
        stickyHeader
        sx={{ minWidth: 800 }}>
        <thead>
          <tr>
            <th>
              <Button
                variant="plain"
                size="sm"
                onClick={() => handleSort("nombre")}
                endDecorator={<ArrowDropDownIcon />}>
                País
              </Button>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedCountries.map((country) => (
            <tr key={country.id}>
              <td>{country.nombre}</td>
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
                    <MenuItem onClick={() => onEdit(country)}>Editar</MenuItem>
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
