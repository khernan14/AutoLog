// src/components/SoporteAdmin/FAQTable.jsx

import React from "react";
import {
  Box,
  Table,
  IconButton,
  Typography,
  Sheet,
  Chip,
  Stack,
  Button,
  Dropdown, // Importar Dropdown
  Menu, // Importar Menu
  MenuButton, // Importar MenuButton
  MenuItem, // Importar MenuItem
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded"; // Usado para inactivar
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded"; // New icon for restore
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded"; // Icon for dropdown menu
import Swal from "sweetalert2"; // For confirmations
import { toast } from "react-toastify"; // Ensure toast is available for info messages

export default function FAQTable({
  faqs,
  onEdit,
  onDelete, // This function is now used for inactivating a FAQ
  onRestore, // New function for activating a FAQ
  canEdit, // Permission to edit
  canDelete, // Permission to inactivate (logical delete)
  canRestore, // Permission to activate (restore)
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Determines the Chip color based on active/inactive status
  const getStatusColor = (isActive) => {
    return isActive ? "success" : "danger";
  };

  // Handler for delete (inactivate) confirmation
  const handleDeleteConfirm = async (faq) => {
    // If the FAQ is already inactive, prevent further action
    if (!faq.isActive) {
      toast.info(`La FAQ "${faq.question}" ya está inactiva.`);
      return;
    }

    const resultSwal = await Swal.fire({
      title: `¿Estás seguro de inactivar esta FAQ?`,
      text: `La FAQ "${faq.question}" será marcada como inactiva. Podrás restaurarla más tarde.`, // Mensaje más informativo
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, inactivar",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      onDelete(faq.id); // Call the onDelete function (which is handleDeleteFaq in the parent)
    }
  };

  // Handler for restore (activate) confirmation
  const handleRestoreConfirm = async (faq) => {
    // If the FAQ is already active, prevent further action
    if (faq.isActive) {
      toast.info(`La FAQ "${faq.question}" ya está activa.`);
      return;
    }

    const resultSwal = await Swal.fire({
      title: `¿Estás seguro de activar esta FAQ?`,
      text: `La FAQ "${faq.question}" será marcada como activa nuevamente.`, // Mensaje más informativo
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#03624C", // Green for success
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, activar",
      cancelButtonText: "Cancelar",
    });

    if (resultSwal.isConfirmed) {
      onRestore(faq.id); // Call the onRestore function in the parent
    }
  };

  // Message if no FAQs are available
  if (!faqs || faqs.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="body-md" color="text.secondary">
          No hay preguntas frecuentes para mostrar.
        </Typography>
      </Box>
    );
  }

  // --- Mobile View (Cards) ---
  if (isMobile) {
    return (
      <Stack spacing={2} sx={{ mb: 2 }}>
        {faqs.map((faq) => (
          <Sheet
            key={faq.id}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "lg",
              boxShadow: "sm",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              // Style for inactive FAQs
              ...(faq.isActive === false && {
                opacity: 0.7,
                fontStyle: "italic",
                bgcolor: "neutral.softBg",
              }),
            }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}>
              <Typography level="title-md" sx={{ flexGrow: 1, pr: 1 }}>
                {faq.question}
              </Typography>
              <Chip
                size="sm"
                variant="soft"
                color={getStatusColor(faq.isActive)}
                sx={{
                  "--Chip-radius": "md",
                  minWidth: "70px",
                  justifyContent: "center",
                }}>
                {faq.isActive ? "Activa" : "Inactiva"}
              </Chip>
            </Box>
            <Typography level="body-sm">
              <strong>Categoría:</strong> {faq.category}
            </Typography>
            <Typography level="body-sm">
              <strong>Orden:</strong> {faq.order ?? "N/A"}
            </Typography>
            <Typography level="body-sm">
              <strong>Respuesta:</strong> {faq.answer.substring(0, 100)}...
            </Typography>

            {/* Actions at the bottom of the card using Dropdown */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, justifyContent: "flex-end" }}>
              <Dropdown>
                <MenuButton
                  slots={{ root: IconButton }}
                  slotProps={{
                    root: { variant: "plain", color: "neutral", size: "sm" },
                  }}>
                  <MoreHorizRoundedIcon />
                </MenuButton>
                <Menu>
                  {/* MenuItem para Editar */}
                  <MenuItem onClick={() => onEdit(faq)} disabled={!canEdit}>
                    <EditRoundedIcon /> Editar
                  </MenuItem>
                  {/* MenuItem condicional para Inactivar o Activar */}
                  {faq.isActive ? (
                    <MenuItem
                      onClick={() => handleDeleteConfirm(faq)}
                      disabled={!canDelete}>
                      <DeleteRoundedIcon /> Inactivar
                    </MenuItem>
                  ) : (
                    <MenuItem
                      onClick={() => handleRestoreConfirm(faq)}
                      disabled={!canRestore}>
                      <RestoreRoundedIcon /> Activar
                    </MenuItem>
                  )}
                </Menu>
              </Dropdown>
            </Stack>
          </Sheet>
        ))}
      </Stack>
    );
  }

  // --- Desktop View (Table) ---
  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: "lg",
        boxShadow: "md",
        overflow: "auto",
        width: "100%",
      }}>
      <Table
        hoverRow
        aria-label="Tabla de FAQs"
        size="md"
        stickyHeader
        sx={{
          "--Table-headerUnderline": "1px solid",
          "--Table-borderColor": "divider",
          minWidth: 600, // Minimum width for the table
        }}>
        <thead>
          <tr>
            <th style={{ width: "40%" }}>Pregunta</th>
            <th style={{ width: "20%" }}>Categoría</th>
            <th style={{ width: "10%", textAlign: "center" }}>Orden</th>
            <th style={{ width: "10%", textAlign: "center" }}>Estado</th>
            <th style={{ width: "20%", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr
              key={faq.id}
              sx={{
                // Style for inactive FAQs
                ...(faq.isActive === false && {
                  opacity: 0.7,
                  fontStyle: "italic",
                  bgcolor: "neutral.softBg",
                }),
              }}>
              <td>
                <Typography level="body-md" sx={{ fontWeight: "md" }}>
                  {faq.question}
                </Typography>
                <Typography level="body-sm" color="text.secondary">
                  {faq.answer.substring(0, 150)}...
                </Typography>
              </td>
              <td>{faq.category}</td>
              <td style={{ textAlign: "center" }}>{faq.order ?? "N/A"}</td>
              <td style={{ textAlign: "center" }}>
                <Chip
                  size="sm"
                  variant="soft"
                  color={getStatusColor(faq.isActive)}
                  sx={{ "--Chip-radius": "sm" }}>
                  {faq.isActive ? "Activa" : "Inactiva"}
                </Chip>
              </td>
              <td style={{ textAlign: "center" }}>
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{
                      root: { variant: "plain", color: "neutral", size: "sm" },
                    }}>
                    <MoreHorizRoundedIcon />
                  </MenuButton>
                  <Menu>
                    {/* MenuItem para Editar */}
                    <MenuItem onClick={() => onEdit(faq)} disabled={!canEdit}>
                      <EditRoundedIcon /> Editar
                    </MenuItem>
                    {/* MenuItem condicional para Inactivar o Activar */}
                    {faq.isActive ? (
                      <MenuItem
                        onClick={() => handleDeleteConfirm(faq)}
                        disabled={!canDelete}>
                        <DeleteRoundedIcon /> Inactivar
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={() => handleRestoreConfirm(faq)}
                        disabled={!canRestore}>
                        <RestoreRoundedIcon /> Activar
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
