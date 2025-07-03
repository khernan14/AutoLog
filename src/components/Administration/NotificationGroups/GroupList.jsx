import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  Typography,
  Button,
  Stack,
} from "@mui/joy";
import { getGroups } from "../../../services/GroupServices";

const GroupList = ({ onSelectGroup, selectedGroup }) => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const data = await getGroups();
    if (data) setGroups(data);
  };

  return (
    <Stack spacing={1}>
      <Typography level="title-md">Grupos</Typography>
      <Button size="sm" variant="soft">
        + Nuevo Grupo
      </Button>

      <List>
        {groups.map((group) => (
          <ListItem
            key={group.id}
            variant={selectedGroup?.id === group.id ? "soft" : "plain"}>
            <ListItemButton onClick={() => onSelectGroup(group)}>
              {group.nombre}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

export default GroupList;
