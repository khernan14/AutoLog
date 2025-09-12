import { ListItem, ListItemButton, ListItemDecorator, ListItemContent } from "@mui/joy";
import { Link } from "react-router-dom";

export default function SidebarItem({ to, icon, label, active }) {
    return (
        <ListItem>
            <ListItemButton
                component={Link}
                to={to}
                selected={active}
            >
                {icon && <ListItemDecorator>{icon}</ListItemDecorator>}
                <ListItemContent>{label}</ListItemContent>
            </ListItemButton>
        </ListItem>
    );
}
