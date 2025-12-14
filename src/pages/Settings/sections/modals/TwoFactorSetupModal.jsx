// src/pages/Settings/sections/modals/TwoFactorSetupModal.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Stack,
  Button,
  Box,
  LinearProgress,
  Alert,
  Divider,
} from "@mui/joy";
import {
  QrCode,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Smartphone,
} from "lucide-react";

export default function TwoFactorSetupModal({
  open,
  onClose,
  setupData,
  onVerify,
}) {
  const { t } = useTranslation();

  // Lógica OTP (6 dígitos)
  const length = 6;
  const [values, setValues] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setValues(Array(length).fill(""));
      setError(null);
      // Focus al primer input tras renderizar
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [open]);

  // Manejo de cambios en cada input
  const handleChangeAt = useCallback((index, raw) => {
    const digit = raw.replace(/\D/g, "").slice(0, 1);
    if (!digit) return;

    setValues((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    // Focus siguiente
    const nextIndex = index + 1;
    if (nextIndex < length) {
      inputsRef.current[nextIndex]?.focus();
    }
  }, []);

  // Manejo de teclado (Backspace, Flechas)
  const handleKeyDown = useCallback((e, index) => {
    const key = e.key;
    if (key === "Backspace") {
      e.preventDefault();
      setValues((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = ""; // Borrar actual
          // Mantener foco
        } else {
          // Borrar anterior y mover foco
          const prevIndex = Math.max(0, index - 1);
          next[prevIndex] = "";
          inputsRef.current[prevIndex]?.focus();
        }
        return next;
      });
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = Math.max(0, index - 1);
      inputsRef.current[prevIndex]?.focus();
    } else if (key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = Math.min(length - 1, index + 1);
      inputsRef.current[nextIndex]?.focus();
    }
  }, []);

  // Manejo de pegar (Paste)
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "");
    if (!text) return;

    const digits = text.slice(0, length).split("");
    setValues((prev) => {
      const next = [...prev];
      for (let i = 0; i < length; i++) {
        if (digits[i]) next[i] = digits[i];
      }
      return next;
    });

    // Focus al último llenado o siguiente
    const lastFilled = Math.min(length - 1, digits.length);
    inputsRef.current[lastFilled < length ? lastFilled : length - 1]?.focus();
  }, []);

  const code = values.join("");

  const handleVerify = async () => {
    if (code.length !== length) return;
    setVerifying(true);
    setError(null);
    try {
      await onVerify(code);
      onClose();
    } catch (err) {
      setError(t("settings.security.2fa_modal.error_invalid"));
      setValues(Array(length).fill("")); // Limpiar inputs error
      inputsRef.current[0]?.focus(); // Volver al inicio
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    if (!verifying) {
      setError(null);
      setValues(Array(length).fill(""));
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog
        sx={{
          maxWidth: 420,
          width: "100%",
          p: 3,
          borderRadius: "xl",
          boxShadow: "lg",
        }}>
        <ModalClose disabled={verifying} />

        {/* Header */}
        <Stack spacing={1} alignItems="center" textAlign="center" mb={2}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: "primary.100",
              borderRadius: "50%",
              color: "primary.600",
            }}>
            <QrCode size={32} />
          </Box>
          <Typography level="h3">
            {t("settings.security.2fa_modal.title")}
          </Typography>
          <Typography level="body-sm" color="neutral">
            {t("settings.security.2fa_modal.subtitle")}
          </Typography>
        </Stack>

        <Divider />

        {/* QR Section */}
        <Box
          sx={{
            py: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}>
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "lg",
              bgcolor: "white",
              boxShadow: "sm",
            }}>
            {setupData?.qr_image ? (
              <img
                src={setupData.qr_image}
                alt="2FA QR Code"
                style={{
                  width: 180,
                  height: 180,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 180,
                  height: 180,
                  display: "grid",
                  placeItems: "center",
                }}>
                <LinearProgress
                  variant="plain"
                  thickness={2}
                  sx={{ width: "50%" }}
                />
              </Box>
            )}
          </Box>

          {/* Manual Entry */}
          {setupData?.secret && (
            <Stack
              spacing={0.5}
              alignItems="center"
              sx={{
                bgcolor: "background.level1",
                px: 2,
                py: 1,
                borderRadius: "md",
                width: "100%",
              }}>
              <Typography
                level="body-xs"
                startDecorator={<KeyRound size={12} />}
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                {t("settings.security.2fa_modal.manual_entry")}
              </Typography>
              <Typography
                level="title-md"
                fontFamily="monospace"
                sx={{ letterSpacing: 2, userSelect: "all" }}>
                {setupData.secret}
              </Typography>
            </Stack>
          )}
        </Box>

        {/* Verification Section */}
        <Stack spacing={2} mt={1}>
          <Typography level="body-sm" startDecorator={<Smartphone size={16} />}>
            {t("settings.security.2fa_modal.input_label")}
          </Typography>

          {/* OTP Inputs */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPaste={handlePaste}>
            {values.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                onChange={(e) => handleChangeAt(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                disabled={verifying}
                style={{
                  width: 48,
                  height: 56,
                  borderRadius: 8,
                  border: "1px solid var(--joy-palette-neutral-300)",
                  textAlign: "center",
                  fontSize: 24,
                  fontFamily: "monospace",
                  outline: "none",
                  background: "var(--joy-palette-background-surface)",
                  color: "var(--joy-palette-text-primary)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--joy-palette-primary-500)";
                  e.target.style.boxShadow =
                    "0 0 0 2px var(--joy-palette-primary-100)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--joy-palette-neutral-300)";
                  e.target.style.boxShadow = "none";
                }}
              />
            ))}
          </Box>

          {error && (
            <Alert
              color="danger"
              variant="soft"
              startDecorator={<AlertCircle size={18} />}>
              {error}
            </Alert>
          )}

          <Button
            onClick={handleVerify}
            loading={verifying}
            disabled={code.length !== length}
            size="lg"
            fullWidth>
            {t("settings.security.2fa_modal.verify_btn")}
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
