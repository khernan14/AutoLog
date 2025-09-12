import { Typography, List } from "@mui/joy";

export default function SidebarGroup({ title, children }) {
    return (
        <>
            <Typography level="body-sm" sx={{ px: 2, mt: 1, mb: 0.5 }}>
                {title}
            </Typography>
            <List size="sm">{children}</List>
        </>
    );
}
