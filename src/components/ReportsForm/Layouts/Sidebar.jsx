import { Sheet, List, ListItemButton, Typography } from "@mui/joy";

const reports = [
  { id: "registerReport", label: "Register Report" },
  { id: "reportB", label: "Reporte B" },
  { id: "reportC", label: "Reporte C" },
];

export default function Sidebar({ selected, onSelect }) {
  return (
    <Sheet variant="outlined" sx={{ width: 220, p: 2 }}>
      <Typography level="h4" mb={2}>
        Reportes
      </Typography>
      <List>
        {reports.map((r) => (
          <ListItemButton
            key={r.id}
            selected={selected === r.id}
            onClick={() => onSelect(r.id)}>
            {r.label}
          </ListItemButton>
        ))}
      </List>
    </Sheet>
  );
}
