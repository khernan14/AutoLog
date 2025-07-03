import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  IconButton,
  Sheet,
  Stack,
  Typography,
  Divider,
  Tooltip,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  addGroupUser,
} from "../../../services/GroupServices";

import GroupModal from "../../../components/Administration/NotificationGroups/GroupModal";
import AssignUsersForm from "../../../components/Administration/NotificationGroups/AssignUsersForm";

const NotificationGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [editGroupData, setEditGroupData] = useState(null);

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    const data = await getGroups();
    if (data) setGroups(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupSave = async (formData) => {
    if (formData.id) {
      await updateGroup(formData.id, formData);
    } else {
      await addGroup(formData);
    }
    setOpenGroupModal(false);
    fetchGroups();
  };

  const handleGroupDelete = async (id) => {
    if (confirm("¿Estás seguro que deseas eliminar este grupo?")) {
      await deleteGroup(id);
      fetchGroups();
    }
  };

  const handleAssignUsers = async ({ groupId, userIds }) => {
    await addGroupUser({
      grupo_id: groupId,
      id_usuarios: userIds,
    });
    fetchGroups();
  };

  return (
    <Sheet sx={{ p: 3, height: "100vh", boxSizing: "border-box" }}>
      <Typography level="h3" mb={2} textAlign="center">
        Gestión de Grupos de Notificación
      </Typography>

      <Sheet sx={{ display: "flex", gap: 2, height: "100%" }}>
        {/* Panel Izquierdo - Lista de Grupos */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Stack spacing={2}>
            <Button
              startDecorator={<AddIcon />}
              variant="soft"
              onClick={() => {
                setEditGroupData(null);
                setOpenGroupModal(true);
              }}>
              Crear Grupo
            </Button>

            {groups.map((group) => (
              <Card key={group.id} variant="outlined">
                <Stack direction="row" justifyContent="space-between">
                  <Stack spacing={0.5}>
                    <Typography level="title-md">{group.nombre}</Typography>
                    <Typography level="body-sm" color="neutral">
                      {group.descripcion || "Sin descripción"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => {
                          setEditGroupData(group);
                          setOpenGroupModal(true);
                        }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Asignar usuarios">
                      <IconButton onClick={() => setSelectedGroupId(group.id)}>
                        <GroupIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        color="danger"
                        onClick={() => handleGroupDelete(group.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Divider orientation="vertical" />

        {/* Panel Derecho - Asignar Usuarios */}
        <Box sx={{ flex: 1, p: 2 }}>
          {selectedGroupId ? (
            <AssignUsersForm
              groupId={selectedGroupId}
              onAssign={handleAssignUsers}
              onCancel={() => setSelectedGroupId(null)}
            />
          ) : (
            <Typography level="body-md" color="neutral">
              Selecciona un grupo para asignar usuarios.
            </Typography>
          )}
        </Box>
      </Sheet>

      {/* Modal para crear/editar grupo */}
      <GroupModal
        open={openGroupModal}
        onClose={() => setOpenGroupModal(false)}
        onSubmit={handleGroupSave}
        initialData={editGroupData || {}}
      />
    </Sheet>
  );
};

export default NotificationGroupsPage;
