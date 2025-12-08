// src/pages/Settings/sections/modals/TwoFactorSetupModal.jsx
import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  Stack,
  Input,
  Button,
  Box,
  LinearProgress,
  Alert,
} from "@mui/joy";
import { QrCode, CheckCircle, AlertCircle } from "lucide-react";

export default function TwoFactorSetupModal({
  open,
  onClose,
  setupData,
  onVerify,
}) {
  const [token, setToken] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (token.length < 6) return;
    setVerifying(true);
    setError(null);
    try {
      await onVerify(token);
      onClose();
    } catch (err) {
      setError("Código incorrecto. Inténtalo de nuevo.");
      setToken("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal open={open} onClose={() => !verifying && onClose()}>
      <ModalDialog sx={{ maxWidth: 400, width: "100%" }}>
        <Typography level="h4" startDecorator={<QrCode />}>
          Configurar 2FA
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2 }}>
          Escanea el código con Google Authenticator.
        </Typography>

        <Box
          sx={{
            my: 2,
            p: 2,
            border: "1px dashed",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "md",
            display: "flex",
            justifyContent: "center",
            bgcolor: "background.level1",
          }}>
          {setupData?.qr_image ? (
            <img
              src={setupData.qr_image}
              alt="QR Code"
              style={{ width: 180, height: 180, objectFit: "contain" }}
            />
          ) : (
            <Box
              sx={{
                width: 180,
                height: 180,
                display: "grid",
                placeItems: "center",
              }}>
              <LinearProgress variant="plain" />
            </Box>
          )}
        </Box>

        {setupData?.secret && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography level="body-xs">Secreto manual:</Typography>
            <Typography
              level="title-sm"
              fontFamily="monospace"
              sx={{ letterSpacing: 1 }}>
              {setupData.secret}
            </Typography>
          </Box>
        )}

        <Stack spacing={2}>
          <Input
            placeholder="Código de 6 dígitos"
            value={token}
            onChange={(e) =>
              setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            autoFocus
            disabled={verifying}
            size="lg"
            sx={{
              textAlign: "center",
              letterSpacing: 4,
              fontFamily: "monospace",
            }}
            endDecorator={
              token.length === 6 &&
              !verifying && <CheckCircle color="green" size={18} />
            }
          />

          {error && (
            <Alert color="danger" startDecorator={<AlertCircle />}>
              {error}
            </Alert>
          )}

          <Button
            onClick={handleVerify}
            loading={verifying}
            disabled={token.length !== 6}
            size="lg">
            Verificar y Activar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
