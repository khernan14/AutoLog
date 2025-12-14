import React, { useState, useCallback } from "react";
import { Box, Input, Button, Stack, IconButton, Tooltip } from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";

/**
 * SearchBar
 * props:
 *  - onSearch: (text) => void
 *  - onAdd: () => void
 *  - canAdd: boolean
 *  - inputMaxWidth: number or css
 */
export default function SearchBar({
  onSearch,
  onAdd,
  canAdd = true,
  inputMaxWidth = 360,
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value) => {
      setSearch(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const clear = () => handleSearch("");

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Input
        placeholder={t(
          "vehiculos.search.placeholder",
          "Buscar por placa, marca o modelo…"
        )}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        startDecorator={<SearchRoundedIcon />}
        endDecorator={
          search ? (
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={clear}
              aria-label={t(
                "vehiculos.search.clear_label",
                "Limpiar búsqueda"
              )}>
              <ClearIcon />
            </IconButton>
          ) : null
        }
        sx={{
          flex: "1 1 auto",
          minWidth: 160,
          maxWidth: { xs: "100%", sm: inputMaxWidth },
        }}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Tooltip
          variant="soft"
          title={
            canAdd
              ? t("vehiculos.search.add_tooltip", "Registrar uso de vehículo")
              : t(
                  "vehiculos.search.add_tooltip_disabled",
                  "No tienes permiso para registrar uso"
                )
          }
          placement="bottom-end">
          <span>
            <Button
              variant={canAdd ? "solid" : "soft"}
              color={canAdd ? "primary" : "neutral"}
              startDecorator={<NoteAddIcon />}
              onClick={onAdd}
              disabled={!canAdd}
              aria-disabled={!canAdd}
              aria-label={t("vehiculos.search.add_button", "Registrar Uso")}>
              {t("vehiculos.search.add_button", "Registrar Uso")}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
