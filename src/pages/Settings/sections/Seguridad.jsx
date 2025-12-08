import React, { useState, useEffect } from "react";
import {
  Card,
  Stack,
  Typography,
  Switch,
  Button,
  Divider,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Chip,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/joy";
import { Shield, Smartphone, AlertTriangle } from "lucide-react";
import { SectionHeader } from "./_shared/SectionHeader.jsx";
import TwoFactorSetupModal from "./modals/TwoFactorSetupModal.jsx";
import usePermissions from "../../../hooks/usePermissions.js";
import { useSettings } from "../../../context/SettingsContext.jsx"; // 👈 IMPORTANTE: Importar hook

export default function Seguridad({ initialData = {}, onSave }) {
  const perms = usePermissions();
  const { reload } = useSettings(); // 👈 Obtenemos reload del contexto
  const canEdit = perms.has("editar_configuraciones") || perms.isAdmin;

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    // Aseguramos leer el valor booleano correcto
    setTfaEnabled(Boolean(initialData?.tfa_enabled));
  }, [initialData]);

  const handleToggleTfa = async (event) => {
    const isChecking = event.target.checked;
    if (isChecking) {
      // --- ACTIVAR ---
      try {
        setLoadingAction(true);
        const res = await onSave({ tfa_enroll_init: true });
        const data = res.data || res;

        if (data?.qr_image) {
          setSetupData(data);
          setSetupModalOpen(true);
        } else {
          // Si el backend activó directo (raro), recargamos para estar seguros
          await reload();
        }
      } catch (error) {
        console.error("Error iniciando 2FA", error);
        // Si falla, recargamos para revertir el switch visual
        reload();
      } finally {
        setLoadingAction(false);
      }
    } else {
      // --- DESACTIVAR ---
      setConfirmDisableOpen(true);
    }
  };

  const handleVerifyCode = async (code) => {
    try {
      const res = await onSave({
        tfa_enroll_verify: true,
        token: code,
        secret: setupData?.secret,
      });
      setSetupModalOpen(false);
      setSetupData(null);
      // Éxito: El estado local se actualizará solo via initialData,
      // pero podemos forzar reload para asegurar limpieza.
      await reload();
      return res;
    } catch (error) {
      throw error; // El modal manejará el error visual
    }
  };

  // 🟢 NUEVO: Manejar cierre del modal (Cancelar)
  const handleCloseModal = () => {
    setSetupModalOpen(false);
    setSetupData(null);
    // Si cancela, recargamos para borrar el estado 'tfa_enroll_init' y recuperar las alertas reales
    reload();
  };

  const handleConfirmDisable = async () => {
    try {
      setLoadingAction(true);
      await onSave({ tfa_enabled: false });
      setConfirmDisableOpen(false);
      await reload(); // Asegurar sincronía
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
        <SectionHeader
          title="Seguridad de la Cuenta"
          subtitle="Gestiona cómo inicias sesión y proteges tus datos."
        />

        <List sx={{ "--ListItem-paddingY": "1rem" }}>
          <ListItem
            endAction={
              <Switch
                checked={tfaEnabled}
                onChange={handleToggleTfa}
                disabled={!canEdit || loadingAction}
                sx={{ ml: 2 }}
              />
            }>
            <ListItemDecorator>
              <Shield size={24} />
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">
                Autenticación en dos pasos (2FA)
              </Typography>
              <Typography level="body-sm" color="neutral">
                Protege tu cuenta con Google Authenticator.
              </Typography>
              {tfaEnabled && (
                <Chip size="sm" color="success" variant="soft" sx={{ mt: 1 }}>
                  Activo
                </Chip>
              )}
            </ListItemContent>
          </ListItem>

          <Divider component="li" />

          <ListItem>
            <ListItemDecorator>
              <Smartphone size={24} />
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="title-sm">
                Alertas de inicio de sesión
              </Typography>
              <Typography level="body-sm">
                Recibe un email ante accesos nuevos.
              </Typography>
            </ListItemContent>
            {/* Controlado directamente por initialData */}
            <Switch
              checked={!!initialData?.login_alerts}
              disabled={!canEdit}
              onChange={async (e) => {
                // Pequeño truco: esperamos a que termine y recargamos si queremos estar 100% seguros
                await onSave({ login_alerts: e.target.checked });
              }}
            />
          </ListItem>
        </List>
      </Card>

      <TwoFactorSetupModal
        open={setupModalOpen}
        onClose={handleCloseModal} // 🟢 Usamos el nuevo handler
        setupData={setupData}
        onVerify={handleVerifyCode}
      />

      <Modal
        open={confirmDisableOpen}
        onClose={() => setConfirmDisableOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <AlertTriangle /> ¿Desactivar 2FA?
          </DialogTitle>
          <Divider />
          <DialogContent>
            Tu cuenta será menos segura sin la autenticación de dos pasos.
          </DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              onClick={handleConfirmDisable}
              loading={loadingAction}>
              Sí, desactivar
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setConfirmDisableOpen(false)}>
              Cancelar
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
