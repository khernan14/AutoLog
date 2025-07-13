import { useState, useEffect } from "react";
import {
  Sheet,
  Typography,
  Switch,
  Box,
  Button,
  Divider,
  Tooltip,
  Chip,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Avatar, // Nuevo: para los iconos de grupo
  ListItemContent,
  accordionDetailsClasses,
  accordionSummaryClasses, // Nuevo: para organizar contenido en el AccordionSummary
} from "@mui/joy";
// Importamos FormControl y FormLabel directamente de @mui/joy, ya que son parte de esta librería
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Stack from "@mui/joy/Stack"; // Para organizar los switches verticalmente

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"; // Icono para el acordeón
// Importa algunos iconos de ejemplo. Necesitarás mapear estos a tus categorías de permisos reales.
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded"; // Ejemplo para "vehículos"
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded"; // Ejemplo para "reportes"
import BuildRoundedIcon from "@mui/icons-material/BuildRounded"; // Ejemplo para "herramientas"
import LocationCityIcon from "@mui/icons-material/LocationCity"; // Para Ciudades
import LocalParkingIcon from "@mui/icons-material/LocalParking"; // Para Estacionamientos
import PublicIcon from "@mui/icons-material/Public"; // Para Paises
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded"; // Para Dashboard

// No necesitamos GRUPOS_POR_PAGINA si ya no paginamos los grupos con acordeones
// const GRUPOS_POR_PAGINA = 3;

const PermissionsTable = ({
  permisosAsignados,
  todosLosPermisos,
  onUpdate,
  busquedaGlobal = "",
}) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  // const [paginaActual, setPaginaActual] = useState(1); // Ya no es necesario si quitamos la paginación de grupos
  const theme = useTheme();

  useEffect(() => {
    setPermisosSeleccionados(permisosAsignados);
  }, [permisosAsignados]);

  const handleToggle = (permisoNombre) => {
    const nuevos = permisosSeleccionados.includes(permisoNombre)
      ? permisosSeleccionados.filter((p) => p !== permisoNombre)
      : [...permisosSeleccionados, permisoNombre];

    setPermisosSeleccionados(nuevos);
    onUpdate(nuevos);
  };

  const handleAsignarTodos = () => {
    const todosLosNombres = Object.values(todosLosPermisos)
      .flat()
      .map((p) => p.nombre);

    setPermisosSeleccionados(todosLosNombres);
    onUpdate(todosLosNombres);
  };

  const handleDeseleccionarTodos = () => {
    setPermisosSeleccionados([]);
    onUpdate([]);
  };

  const normalizarTexto = (txt) =>
    txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtro = normalizarTexto(busquedaGlobal);

  const permisosFiltradosPorGrupo = Object.entries(todosLosPermisos).reduce(
    (acc, [grupo, permisos]) => {
      const filtrados = permisos.filter(
        (permiso) =>
          normalizarTexto(permiso.nombre).includes(filtro) ||
          normalizarTexto(permiso.descripcion || "").includes(filtro)
      );
      if (filtrados.length > 0) acc[grupo] = filtrados;
      return acc;
    },
    {}
  );

  const grupos = Object.entries(permisosFiltradosPorGrupo);
  // La paginación de grupos ya no es necesaria con este diseño de acordeones.
  // const totalPaginas = Math.ceil(grupos.length / GRUPOS_POR_PAGINA);
  // const gruposPaginados = grupos.slice(
  //   (paginaActual - 1) * GRUPOS_POR_PAGINA,
  //   paginaActual * GRUPOS_POR_PAGINA
  // );

  // Mapeo de ejemplo para iconos de grupos (ADAPTA ESTO A TUS CATEGORÍAS REALES)
  const groupIcons = {
    Vehiculos: <DirectionsCarRoundedIcon />,
    Usuarios: <PersonRoundedIcon />,
    Reportes: <AssignmentRoundedIcon />,
    Configuracion: <SettingsRoundedIcon />,
    Seguridad: <SecurityRoundedIcon />,
    Herramientas: <BuildRoundedIcon />,
    Ciudades: <LocationCityIcon />,
    Estacionamientos: <LocalParkingIcon />,
    Paises: <PublicIcon />,
    Dashboard: <DashboardRoundedIcon />,
    // Añade más mapeos según tus categorías de permisos
  };

  // Función para obtener un color de avatar aleatorio o predefinido
  const getAvatarColor = (grupo) => {
    const colors = ["primary", "neutral", "danger", "success", "warning"];
    // Puedes asignar colores específicos a grupos o usar un hash para consistencia
    if (grupo === "Vehiculos") return "primary";
    if (grupo === "Usuarios") return "success";
    if (grupo === "Reportes") return "warning";
    // Si no hay un color específico, usa uno aleatorio para variedad
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: "lg",
        overflow: "hidden",
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.body",
        boxShadow: theme.shadow.md,
      }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
        <Button
          onClick={handleAsignarTodos}
          size="sm"
          variant="soft"
          color="success">
          Asignar todos
        </Button>
        <Button
          onClick={handleDeseleccionarTodos}
          size="sm"
          variant="outlined"
          color="danger">
          Quitar todos
        </Button>
      </Box>

      {grupos.length === 0 ? (
        <Typography level="body-sm" color="neutral" textAlign="center" my={4}>
          No se encontraron permisos con ese criterio de búsqueda.
        </Typography>
      ) : (
        <AccordionGroup
          variant="plain" // Usamos "plain" para un estilo más limpio y minimalista
          transition="0.2s"
          sx={{
            // Ajustes para que los AccordionSummary y AccordionDetails tengan padding uniforme
            [`& .${accordionDetailsClasses.content}.${accordionDetailsClasses.expanded}`]:
              {
                paddingBlock: "1rem",
              },
            [`& .${accordionSummaryClasses.button}`]: {
              paddingBlock: "1rem",
            },
          }}>
          {grupos.map(([grupo, permisos]) => (
            <Accordion key={grupo} variant="outlined">
              <AccordionSummary indicator={<KeyboardArrowDownIcon />}>
                <Avatar color={getAvatarColor(grupo)} variant="soft">
                  {groupIcons[grupo] || <SettingsRoundedIcon />}{" "}
                  {/* Usa el icono mapeado o uno por defecto */}
                </Avatar>
                <ListItemContent>
                  <Typography level="title-md">{grupo}</Typography>
                  <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    Gestiona los {permisos.length} permisos de{" "}
                    {grupo.toLowerCase()}
                  </Typography>
                </ListItemContent>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  {" "}
                  {/* Usamos Stack para organizar los FormControl verticalmente */}
                  {permisos.map((permiso) => (
                    <Tooltip
                      key={permiso.id}
                      title={permiso.descripcion || "Sin descripción"}
                      variant="soft"
                      arrow
                      placement="top">
                      <FormControl
                        orientation="horizontal"
                        sx={{ gap: 1, alignItems: "center" }}>
                        {/* Puedes añadir iconos individuales para cada permiso si lo deseas,
                            o dejar el Switch y la etiqueta. Por ahora, solo Switch y Label. */}
                        {/* Por ejemplo, un icono para el permiso específico: */}
                        {/* {permiso.icon && <permiso.icon fontSize="md" sx={{ mr: 1 }} />} */}
                        <FormLabel sx={{ flexGrow: 1 }}>
                          <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                            {permiso.nombre}
                          </Typography>
                        </FormLabel>
                        <Switch
                          checked={permisosSeleccionados.includes(
                            permiso.nombre
                          )}
                          onChange={() => handleToggle(permiso.nombre)}
                          size="md" // Tamaño del switch ligeramente más grande para mejor interacción
                          sx={{
                            "--Switch-trackWidth": "48px",
                            "--Switch-trackHeight": "24px",
                            "--Switch-thumbSize": "20px",
                          }}
                        />
                      </FormControl>
                    </Tooltip>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionGroup>
      )}
      {/* Ya no necesitamos la paginación de grupos aquí */}
      {/*
      {grupos.length > 0 && (
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          <Button
            size="sm"
            variant="outlined"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((prev) => prev - 1)}>
            Anterior
          </Button>
          <Typography level="body-sm" mt={1}>
            Página {paginaActual} de {totalPaginas}
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual((prev) => prev + 1)}>
            Siguiente
          </Button>
        </Box>
      )}
      */}
    </Sheet>
  );
};

export default PermissionsTable;
