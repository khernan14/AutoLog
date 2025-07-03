import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AssignUsersForm from "./AssignUsersForm";

const AssignUsersModal = ({ open, onClose, groupId, onAssign }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog layout="center" size="lg">
        <DialogTitle>
          Asignar Usuarios al Grupo
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
          <AssignUsersForm
            groupId={groupId}
            onAssign={onAssign}
            onCancel={onClose}
          />
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default AssignUsersModal;
