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
// Asegúrate de crear este archivo en el paso 3
import TwoFactorSetupModal from "./modals/TwoFactorSetupModal.jsx";
import usePermissions from "../../../hooks/usePermissions.js";

export default function Seguridad({ initialData = {}, onSave }) {
  const perms = usePermissions();
  const canEdit = perms.has("editar_configuraciones") || perms.isAdmin;

  // Estados para manejar la UI
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupData, setSetupData] = useState(null); // Aquí guardamos el QR y el secret
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Sincronizar estado inicial
  useEffect(() => {
    setTfaEnabled(Boolean(initialData?.tfa_enabled));
  }, [initialData]);

  // Manejar el click en el Switch
  const handleToggleTfa = async (event) => {
    const isChecking = event.target.checked; // ¿El usuario quiere activar (true) o desactivar (false)?

    if (isChecking) {
      // --- ACTIVAR ---
      try {
        setLoadingAction(true);
        // Pedimos al backend que inicie el proceso (nos debe devolver el QR)
        const res = await onSave({ tfa_enroll_init: true });

        // Si el backend responde con datos, abrimos el modal
        // La estructura de 'res' depende de cómo la devuelve 'saveSection' en SettingsContext
        // Normalmente viene en res.data o res directamente.
        const data = res.data || res;

        if (data?.qr_image) {
          setSetupData(data);
          setSetupModalOpen(true); // ¡ABRIR MODAL!
        } else {
          console.warn("No se recibió código QR del backend:", res);
        }
      } catch (error) {
        console.error("Error iniciando 2FA", error);
      } finally {
        setLoadingAction(false);
      }
    } else {
      // --- DESACTIVAR ---
      setConfirmDisableOpen(true); // Pedir confirmación antes de apagar
    }
  };

  // Verificar el código que ingresa el usuario en el modal
  const handleVerifyCode = async (code) => {
    const res = await onSave({
      tfa_enroll_verify: true,
      token: code,
      secret: setupData?.secret,
    });
    // Si no da error, asumimos éxito
    setTfaEnabled(true);
    setSetupModalOpen(false);
    setSetupData(null);
    return res;
  };

  // Confirmar desactivación
  const handleConfirmDisable = async () => {
    try {
      setLoadingAction(true);
      await onSave({ tfa_enabled: false });
      setTfaEnabled(false);
      setConfirmDisableOpen(false);
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
            {/* Este switch controla 'login_alerts' directamente */}
            <Switch
              checked={!!initialData?.login_alerts}
              disabled={!canEdit}
              onChange={(e) => onSave({ login_alerts: e.target.checked })}
            />
          </ListItem>
        </List>
      </Card>

      {/* Modales */}
      <TwoFactorSetupModal
        open={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
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
