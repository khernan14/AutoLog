import React from "react";
import { Stack, Button } from "@mui/joy";

export function ActionBar({ onSave, onReset, saving }) {
  return (
    <Stack direction="row" gap={1}>
      {onReset && (
        <Button variant="plain" onClick={onReset}>
          Restablecer
        </Button>
      )}
      <Button onClick={onSave} loading={saving}>
        Guardar cambios
      </Button>
    </Stack>
  );
}
