import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { useSettings } from "../../../context/SettingsContext.jsx";

export default function Seguridad({ initialData = {}, onSave }) {
  const { t } = useTranslation(); // 👈 Hook
  const perms = usePermissions();
  const { reload } = useSettings();
  const canEdit = perms.has("editar_configuraciones") || perms.isAdmin;

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    setTfaEnabled(Boolean(initialData?.tfa_enabled));
  }, [initialData]);

  const handleToggleTfa = async (event) => {
    const isChecking = event.target.checked;
    if (isChecking) {
      try {
        setLoadingAction(true);
        const res = await onSave({ tfa_enroll_init: true });
        const data = res.data || res;

        if (data?.qr_image) {
          setSetupData(data);
          setSetupModalOpen(true);
        } else {
          await reload();
        }
      } catch (error) {
        console.error("Error iniciando 2FA", error);
        reload();
      } finally {
        setLoadingAction(false);
      }
    } else {
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
      await reload();
      return res;
    } catch (error) {
      throw error;
    }
  };

  const handleCloseModal = () => {
    setSetupModalOpen(false);
    setSetupData(null);
    reload();
  };

  const handleConfirmDisable = async () => {
    try {
      setLoadingAction(true);
      await onSave({ tfa_enabled: false });
      setConfirmDisableOpen(false);
      await reload();
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
          title={t("settings.security.title")}
          subtitle={t("settings.security.subtitle")}
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
                {t("settings.security.2fa.title")}
              </Typography>
              <Typography level="body-sm" color="neutral">
                {t("settings.security.2fa.desc")}
              </Typography>
              {tfaEnabled && (
                <Chip size="sm" color="success" variant="soft" sx={{ mt: 1 }}>
                  {t("common.status.active")}
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
                {t("settings.security.alerts.title")}
              </Typography>
              <Typography level="body-sm">
                {t("settings.security.alerts.desc")}
              </Typography>
            </ListItemContent>
            <Switch
              checked={!!initialData?.login_alerts}
              disabled={!canEdit}
              onChange={async (e) => {
                await onSave({ login_alerts: e.target.checked });
              }}
            />
          </ListItem>
        </List>
      </Card>

      <TwoFactorSetupModal
        open={setupModalOpen}
        onClose={handleCloseModal}
        setupData={setupData}
        onVerify={handleVerifyCode}
      />

      <Modal
        open={confirmDisableOpen}
        onClose={() => setConfirmDisableOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <AlertTriangle /> {t("settings.security.disable_modal.title")}
          </DialogTitle>
          <Divider />
          <DialogContent>
            {t("settings.security.disable_modal.desc")}
          </DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              onClick={handleConfirmDisable}
              loading={loadingAction}>
              {t("settings.security.disable_modal.confirm")}
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setConfirmDisableOpen(false)}>
              {t("common.actions.cancel")}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
