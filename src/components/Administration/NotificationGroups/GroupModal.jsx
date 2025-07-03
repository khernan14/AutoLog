import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GroupForm from "./GroupForm";

const GroupModal = ({ open, onClose, onSubmit, initialData }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="center" size="md">
        <DialogTitle>
          {initialData?.id ? "Editar Grupo" : "Crear Grupo"}
          <IconButton
            aria-label="Cerrar"
            variant="plain"
            color="neutral"
            onClick={onClose}
            sx={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <GroupForm
            onSubmit={onSubmit}
            initialData={initialData || {}}
            onCancel={onClose}
          />
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default GroupModal;
