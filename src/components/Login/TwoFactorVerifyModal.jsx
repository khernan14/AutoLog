// src/components/Login/TwoFactorVerifyModal.jsx
import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  Stack,
  Input,
  Button,
  Alert,
} from "@mui/joy";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function TwoFactorVerifyModal({
  open,
  onClose,
  onVerify,
  loading,
}) {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerify(code);
    }
  };

  return (
    <Modal open={open} onClose={() => !loading && onClose()}>
      <ModalDialog sx={{ maxWidth: 400, width: "100%", p: 3 }}>
        <Typography level="h4" startDecorator={<ShieldCheck color="#03624C" />}>
          Verificación en dos pasos
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2 }}>
          Ingresa el código de 6 dígitos de tu aplicación autenticadora para
          continuar.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Input
              autoFocus
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              size="lg"
              sx={{
                textAlign: "center",
                letterSpacing: 4,
                fontSize: "1.2rem",
                fontFamily: "monospace",
              }}
            />

            <Button
              type="submit"
              loading={loading}
              disabled={code.length !== 6}
              sx={{ bgcolor: "#03624C", "&:hover": { bgcolor: "#024d3a" } }}>
              Verificar
            </Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
