import { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import MyAccountForm from "../../../components/Users/MyAccount/MyAccountForm";
import { getUsersById } from "../../../services/AuthServices.jsx";
import { Typography } from "@mui/joy";

export default function MyAccount() {
  const [user, setUser] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const id_usuario = storedUser?.id || 1;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUsersById(id_usuario);
        if (data && data.length > 0) {
          setUser(data[0]); // Accede al primer elemento del array
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Mostrar un mensaje de carga mientras esperamos los datos
  if (user === null) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <Typography variant="h6">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Box
        component="main"
        className="MainContent"
        sx={{
          pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
          overflow: "auto",
        }}>
        <MyAccountForm user={user} />
      </Box>
    </Box>
  );
}
