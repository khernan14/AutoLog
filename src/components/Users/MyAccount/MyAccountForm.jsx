import {
  Box,
  List,
  ListItem,
  ListItemDecorator,
  Typography,
  Divider,
} from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";

export default function MyAccountForm({ user }) {
  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <Typography level="h4">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 4 }, py: 2 }}>
      <Typography level="h4" fontWeight="lg" mb={2}>
        Información de la cuenta
      </Typography>

      <List
        size="sm"
        variant="plain"
        sx={{
          "--ListItem-paddingY": "12px",
          "--ListItemDecorator-size": "32px",
          borderRadius: "md",
        }}>
        <ListItem>
          <ListItemDecorator>
            <PersonIcon />
          </ListItemDecorator>
          <Box>
            <Typography level="body-sm" color="neutral">
              Nombre completo
            </Typography>
            <Typography level="body-md">{user.nombre}</Typography>
          </Box>
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemDecorator>
            <EmailIcon />
          </ListItemDecorator>
          <Box>
            <Typography level="body-sm" color="neutral">
              Correo electrónico
            </Typography>
            <Typography level="body-md">{user.email}</Typography>
          </Box>
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemDecorator>
            <AccountCircleIcon />
          </ListItemDecorator>
          <Box>
            <Typography level="body-sm" color="neutral">
              Usuario
            </Typography>
            <Typography level="body-md">{user.username}</Typography>
          </Box>
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemDecorator>
            <PublicIcon />
          </ListItemDecorator>
          <Box>
            <Typography level="body-sm" color="neutral">
              País
            </Typography>
            <Typography level="body-md">{user.pais}</Typography>
          </Box>
        </ListItem>
        <Divider />

        <ListItem>
          <ListItemDecorator>
            <LocationCityIcon />
          </ListItemDecorator>
          <Box>
            <Typography level="body-sm" color="neutral">
              Ciudad
            </Typography>
            <Typography level="body-md">{user.ciudad}</Typography>
          </Box>
        </ListItem>
      </List>
    </Box>
  );
}
