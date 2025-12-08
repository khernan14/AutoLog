// src/pages/Settings/_shared/ActionBar.jsx
import React from "react";
import { Stack, Button } from "@mui/joy";
import Tooltip from "@mui/joy/Tooltip";

export function ActionBar({
  onSave,
  onReset,
  saving,
  saveDisabled = false,
  saveDisabledReason = "",
}) {
  return (
    <Stack direction="row" gap={1}>
      {onReset && (
        <Button variant="plain" onClick={onReset}>
          Restablecer
        </Button>
      )}

      {/* Tooltip alrededor de un span para que funcione aun si el botón está disabled */}
      <Tooltip
        title={saveDisabled ? saveDisabledReason || "No autorizado" : ""}
        placement="top">
        <span>
          <Button onClick={onSave} loading={saving} disabled={saveDisabled}>
            Guardar cambios
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}
