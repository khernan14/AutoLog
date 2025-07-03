import { useState, useEffect } from "react";
import {
  Table,
  Sheet,
  Typography,
  Switch,
  Box,
  Button,
  Divider,
  Tooltip,
  Chip,
} from "@mui/joy";

const GRUPOS_POR_PAGINA = 3;

const PermissionsTable = ({
  permisosAsignados,
  todosLosPermisos,
  onUpdate,
  busquedaGlobal = "",
}) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    setPermisosSeleccionados(permisosAsignados);
  }, [permisosAsignados]);

  const handleToggle = (permiso) => {
    const nuevos = permisosSeleccionados.includes(permiso)
      ? permisosSeleccionados.filter((p) => p !== permiso)
      : [...permisosSeleccionados, permiso];

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
      const filtrados = permisos.filter((permiso) =>
        normalizarTexto(permiso.nombre).includes(filtro)
      );
      if (filtrados.length > 0) acc[grupo] = filtrados;
      return acc;
    },
    {}
  );

  const grupos = Object.entries(permisosFiltradosPorGrupo);
  const totalPaginas = Math.ceil(grupos.length / GRUPOS_POR_PAGINA);
  const gruposPaginados = grupos.slice(
    (paginaActual - 1) * GRUPOS_POR_PAGINA,
    paginaActual * GRUPOS_POR_PAGINA
  );

  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: "md",
        overflow: "hidden",
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.body",
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
          No se encontraron permisos con ese criterio.
        </Typography>
      ) : (
        <>
          {gruposPaginados.map(([grupo, permisos], index) => (
            <Box key={grupo} sx={{ mb: 3 }}>
              <Chip variant="soft" color="primary" size="sm" sx={{ mb: 1 }}>
                {grupo}
              </Chip>

              <Table
                variant="soft"
                borderAxis="bothBetween"
                stickyHeader
                hoverRow
                size="sm"
                sx={{
                  mb: 2,
                  borderRadius: "md",
                  overflow: "hidden",
                  "& tr:nth-of-type(even)": {
                    backgroundColor: "background.level1",
                  },
                  "& th": {
                    backgroundColor: "background.level2",
                    fontWeight: "bold",
                  },
                  "& td, & th": {
                    padding: "12px",
                  },
                }}>
                <thead>
                  <tr>
                    <th>Permiso</th>
                    <th style={{ textAlign: "center" }}>Asignado</th>
                  </tr>
                </thead>
                <tbody>
                  {permisos.map((permiso) => (
                    <tr key={permiso.id}>
                      <td>
                        <Tooltip
                          title={permiso.descripcion || "Sin descripción"}
                          variant="soft"
                          arrow
                          placement="top">
                          <Typography
                            level="body-sm"
                            sx={{ cursor: "help", fontWeight: 500 }}>
                            {permiso.nombre}
                          </Typography>
                        </Tooltip>
                      </td>
                      <td>
                        <Box display="flex" justifyContent="center">
                          <Switch
                            checked={permisosSeleccionados.includes(
                              permiso.nombre
                            )}
                            onChange={() => handleToggle(permiso.nombre)}
                          />
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {index !== gruposPaginados.length - 1 && (
                <Divider inset="context" />
              )}
            </Box>
          ))}

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
        </>
      )}
    </Sheet>
  );
};

export default PermissionsTable;
