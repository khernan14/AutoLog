// src/components/HelpPage/HelpPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react"; // Agregamos useEffect y useCallback
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Option,
  Select,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack,
  CircularProgress, // Importamos CircularProgress para los estados de carga
} from "@mui/joy";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ContactSupportRoundedIcon from "@mui/icons-material/ContactSupportRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { toast } from "react-toastify"; // Asegúrate de tener react-toastify configurado en tu app

// Importamos los servicios de la API
import {
  getFAQs,
  getTutorials,
  getChangelogs,
  getSystemServices,
  getOverallStatusHistory,
  // addFAQ, updateFAQ, deleteFAQ, etc. (para gestión futura)
} from "../../services/HelpServices"; // Ajusta la ruta a tu archivo helpServices.jsx

// --- Componente Principal HelpPage ---
export default function HelpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Define el breakpoint para móvil

  const [activeSection, setActiveSection] = useState("faq"); // Sección activa
  const [faqSearchText, setFaqSearchText] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    description: "",
    priority: "media",
    attachment: null,
  });

  // --- Estados para los datos dinámicos y sus estados de carga/error ---
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [errorFaqs, setErrorFaqs] = useState(null);

  const [tutorials, setTutorials] = useState([]);
  const [loadingTutorials, setLoadingTutorials] = useState(false);
  const [errorTutorials, setErrorTutorials] = useState(null);

  const [changelogs, setChangelogs] = useState([]);
  const [loadingChangelogs, setLoadingChangelogs] = useState(false);
  const [errorChangelogs, setErrorChangelogs] = useState(null);

  const [systemServices, setSystemServices] = useState([]);
  const [overallStatus, setOverallStatus] = useState({
    overall: "Desconocido",
    lastUpdated: "N/A",
  });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // --- Efecto para cargar datos cuando cambia la sección activa ---
  useEffect(() => {
    const fetchData = async () => {
      switch (activeSection) {
        case "faq":
          setLoadingFaqs(true);
          setErrorFaqs(null);
          try {
            const data = await getFAQs();
            setFaqs(data);
          } catch (err) {
            setErrorFaqs("Error al cargar las preguntas frecuentes.");
            toast.error("No se pudieron cargar las preguntas frecuentes.");
          } finally {
            setLoadingFaqs(false);
          }
          break;
        case "tutorials":
          setLoadingTutorials(true);
          setErrorTutorials(null);
          try {
            const data = await getTutorials();
            setTutorials(data);
          } catch (err) {
            setErrorTutorials("Error al cargar los tutoriales.");
            toast.error("No se pudieron cargar los tutoriales.");
          } finally {
            setLoadingTutorials(false);
          }
          break;
        case "changelog":
          setLoadingChangelogs(true);
          setErrorChangelogs(null);
          try {
            const data = await getChangelogs();
            setChangelogs(data);
          } catch (err) {
            setErrorChangelogs("Error al cargar las novedades y anuncios.");
            toast.error("No se pudieron cargar las novedades.");
          } finally {
            setLoadingChangelogs(false);
          }
          break;
        case "status":
          setLoadingStatus(true);
          setErrorStatus(null);
          try {
            const servicesData = await getSystemServices();
            setSystemServices(servicesData);

            const overallLog = await getOverallStatusHistory();
            if (overallLog && overallLog.length > 0) {
              const latestLog = overallLog[0]; // El historial viene ordenado por fecha descendente
              setOverallStatus({
                overall: latestLog.overall_status,
                lastUpdated: new Date(
                  latestLog.status_timestamp
                ).toLocaleString("es-ES"),
              });
            } else {
              setOverallStatus({ overall: "Desconocido", lastUpdated: "N/A" });
            }
          } catch (err) {
            setErrorStatus("Error al cargar el estado del sistema.");
            toast.error("No se pudo cargar el estado del sistema.");
          } finally {
            setLoadingStatus(false);
          }
          break;
        default:
          break;
      }
    };

    fetchData();
  }, [activeSection]); // Dependencia del useEffect

  // Filtrar FAQs basado en el texto de búsqueda (ahora usa el estado `faqs`)
  const filteredFaqs = useMemo(() => {
    // Asegúrate de que faqs sea un array antes de filtrar
    const faqsToFilter = Array.isArray(faqs) ? faqs : [];
    if (!faqSearchText) return faqsToFilter.filter((faq) => faq.isActive); // Muestra solo activos por defecto
    const lowerCaseSearch = faqSearchText.toLowerCase();
    return faqsToFilter.filter(
      (faq) =>
        faq.isActive && // Solo FAQs activas
        (faq.question.toLowerCase().includes(lowerCaseSearch) ||
          faq.answer.toLowerCase().includes(lowerCaseSearch) ||
          faq.category.toLowerCase().includes(lowerCaseSearch))
    );
  }, [faqs, faqSearchText]);

  // Manejar cambios en el formulario de contacto
  const handleContactFormChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value, // Asume un solo archivo
    }));
  }, []);

  // Enviar formulario de contacto (simulado, ya que no tenemos un servicio de envío de correos aquí)
  const handleSubmitContactForm = useCallback(
    (e) => {
      e.preventDefault();
      // Aquí iría la lógica para enviar el formulario a tu servicio de soporte
      // Por ahora, solo simula el envío y muestra un toast
      console.log("Formulario de contacto enviado:", contactForm);
      toast.success("Tu solicitud ha sido enviada. Te contactaremos pronto.");
      setContactForm({
        subject: "",
        description: "",
        priority: "media",
        attachment: null,
      }); // Limpiar formulario
    },
    [contactForm]
  );

  // Determina el color del Chip/Alert según el estado del servicio
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Operativo":
        return "success";
      case "Degradado":
        return "warning";
      case "Interrupción":
        return "danger";
      case "Mantenimiento":
        return "neutral";
      default:
        return "neutral";
    }
  }, []);

  // Función para renderizar el contenido de una sección
  const renderSectionContent = () => {
    switch (activeSection) {
      case "faq":
        if (loadingFaqs)
          return (
            <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
          );
        if (errorFaqs) return <Alert color="danger">{errorFaqs}</Alert>;
        if (filteredFaqs.length === 0 && faqSearchText === "") {
          return (
            <Typography
              level="body-md"
              color="text.secondary"
              textAlign="center"
              sx={{ my: 4 }}>
              No hay preguntas frecuentes disponibles en este momento.
            </Typography>
          );
        }
        if (filteredFaqs.length === 0 && faqSearchText !== "") {
          return (
            <Typography
              level="body-md"
              color="text.secondary"
              textAlign="center"
              sx={{ my: 4 }}>
              No se encontraron resultados para tu búsqueda.
            </Typography>
          );
        }
        return (
          <Box>
            <Typography level="h3" sx={{ mb: 2 }}>
              Preguntas Frecuentes (FAQ)
            </Typography>
            <Input
              placeholder="Buscar preguntas..."
              startDecorator={<SearchRoundedIcon />}
              value={faqSearchText}
              onChange={(e) => setFaqSearchText(e.target.value)}
              sx={{ mb: 3, maxWidth: { xs: "100%", sm: "400px" } }}
            />
            <AccordionGroup sx={{ maxWidth: "800px" }}>
              {filteredFaqs.map((faq) => (
                <Accordion key={faq.id} sx={{ mb: 1, borderRadius: "md" }}>
                  <AccordionSummary>
                    <Typography level="title-md">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography level="body-md">{faq.answer}</Typography>
                    <Chip
                      size="sm"
                      variant="soft"
                      color="neutral"
                      sx={{ mt: 1 }}>
                      {faq.category}
                    </Chip>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionGroup>
          </Box>
        );

      case "contact":
        return (
          <Box>
            <Typography level="h3" sx={{ mb: 2 }}>
              Contacto con Soporte
            </Typography>
            <Typography level="body-md" sx={{ mb: 3 }}>
              Si no encuentras lo que buscas en nuestras FAQs, por favor,
              envíanos un mensaje.
            </Typography>
            <form onSubmit={handleSubmitContactForm}>
              <Stack spacing={2} sx={{ maxWidth: "600px" }}>
                <FormControl required>
                  <FormLabel>Asunto</FormLabel>
                  <Input
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    placeholder="Ej. Problema de inicio de sesión"
                  />
                </FormControl>
                <FormControl required>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea
                    name="description"
                    value={contactForm.description}
                    onChange={handleContactFormChange}
                    minRows={4}
                    placeholder="Describe tu problema en detalle..."
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Prioridad</FormLabel>
                  <Select
                    name="priority"
                    value={contactForm.priority}
                    onChange={(e, newValue) =>
                      setContactForm((prev) => ({
                        ...prev,
                        priority: newValue,
                      }))
                    }>
                    <Option value="baja">Baja</Option>
                    <Option value="media">Media</Option>
                    <Option value="alta">Alta</Option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Adjuntar archivo (Opcional)</FormLabel>
                  <Input
                    type="file"
                    name="attachment"
                    onChange={handleContactFormChange}
                  />
                </FormControl>
                <Button type="submit" sx={{ alignSelf: "flex-start" }}>
                  Enviar Solicitud
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 4 }} />

            <Typography level="h4" sx={{ mb: 2 }}>
              Información de Contacto Directa
            </Typography>
            <Typography level="body-md">
              <strong>Email:</strong> support@herndevs.com
            </Typography>
            <Typography level="body-md">
              <strong>Teléfono:</strong> +504 9595-0299 (Lunes a Viernes, 9 AM -
              5 PM HNL)
            </Typography>
          </Box>
        );

      case "tutorials":
        if (loadingTutorials)
          return (
            <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
          );
        if (errorTutorials)
          return <Alert color="danger">{errorTutorials}</Alert>;
        if (tutorials.length === 0) {
          return (
            <Typography
              level="body-md"
              color="text.secondary"
              textAlign="center"
              sx={{ my: 4 }}>
              No hay tutoriales disponibles en este momento.
            </Typography>
          );
        }
        return (
          <Box>
            <Typography level="h3" sx={{ mb: 2 }}>
              Tutoriales y Guías
            </Typography>
            <Typography level="body-md" sx={{ mb: 3 }}>
              Aprende a usar nuestra plataforma con estos videos y guías paso a
              paso.
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(auto-fill, minmax(280px, 1fr))",
                },
                gap: 3,
              }}>
              {tutorials.map((tutorial) => (
                <Card
                  key={tutorial.id}
                  variant="outlined"
                  sx={{
                    borderRadius: "lg",
                    boxShadow: "sm",
                    "&:hover": {
                      boxShadow: "md",
                      borderColor: "primary.outlinedHoverBorder",
                    },
                  }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 180,
                      bgcolor: "neutral.softBg",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "md",
                      overflow: "hidden",
                      position: "relative",
                    }}>
                    {tutorial.videoUrl ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={tutorial.videoUrl}
                        title={tutorial.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}></iframe>
                    ) : (
                      <img
                        src={tutorial.imageUrl}
                        alt={tutorial.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/400x225/E0F2F7/00796B?text=Video+No+Disponible";
                        }}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    )}
                    {!tutorial.videoUrl && (
                      <PlayCircleOutlineRoundedIcon
                        sx={{
                          position: "absolute",
                          fontSize: "4rem",
                          color: "white",
                          opacity: 0.8,
                          "&:hover": { opacity: 1, cursor: "pointer" },
                        }}
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Typography level="title-md" sx={{ mb: 1 }}>
                      {tutorial.title}
                    </Typography>
                    <Typography level="body-sm">
                      {tutorial.description}
                    </Typography>
                    <Button
                      variant="soft"
                      size="sm"
                      sx={{ mt: 2, alignSelf: "flex-start" }}
                      onClick={() =>
                        window.open(
                          tutorial.videoUrl || tutorial.imageUrl,
                          "_blank"
                        )
                      }>
                      Ver Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );

      case "status":
        if (loadingStatus)
          return (
            <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
          );
        if (errorStatus) return <Alert color="danger">{errorStatus}</Alert>;
        if (
          systemServices.length === 0 &&
          overallStatus.overall === "Desconocido"
        ) {
          return (
            <Typography
              level="body-md"
              color="text.secondary"
              textAlign="center"
              sx={{ my: 4 }}>
              No hay información de estado del sistema disponible.
            </Typography>
          );
        }
        return (
          <Box>
            <Typography level="h3" sx={{ mb: 2 }}>
              Estado del Sistema
            </Typography>
            <Alert
              variant="soft"
              color={getStatusColor(overallStatus.overall)}
              startDecorator={
                overallStatus.overall === "Operativo" ? (
                  <CheckCircleOutlineRoundedIcon />
                ) : (
                  <ErrorOutlineRoundedIcon />
                )
              }
              sx={{ mb: 3, borderRadius: "md" }}>
              <Typography level="title-md">
                Estado General: {overallStatus.overall}
              </Typography>
              <Typography level="body-sm">
                Última actualización: {overallStatus.lastUpdated}
              </Typography>
            </Alert>

            <Typography level="h4" sx={{ mb: 2 }}>
              Estado de los Servicios
            </Typography>
            {systemServices.length > 0 ? (
              <List
                variant="outlined"
                sx={{
                  borderRadius: "md",
                  "--ListItemDecorator-size": "32px",
                  "--ListItem-paddingY": "8px",
                }}>
                {systemServices.map((service) => (
                  <ListItem key={service.id}>
                    {" "}
                    {/* Usamos service.id como key */}
                    <ListItemContent>
                      <Typography level="body-md">{service.name}</Typography>
                    </ListItemContent>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={getStatusColor(service.status)}
                      sx={{ "--Chip-radius": "sm" }}>
                      {service.status}
                    </Chip>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography
                level="body-md"
                color="text.secondary"
                textAlign="center"
                sx={{ my: 4 }}>
                No hay servicios registrados.
              </Typography>
            )}
          </Box>
        );

      case "changelog":
        if (loadingChangelogs)
          return (
            <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
          );
        if (errorChangelogs)
          return <Alert color="danger">{errorChangelogs}</Alert>;
        if (changelogs.length === 0) {
          return (
            <Typography
              level="body-md"
              color="text.secondary"
              textAlign="center"
              sx={{ my: 4 }}>
              No hay novedades o anuncios disponibles en este momento.
            </Typography>
          );
        }
        return (
          <Box>
            <Typography level="h3" sx={{ mb: 2 }}>
              Novedades y Anuncios
            </Typography>
            <Typography level="body-md" sx={{ mb: 3 }}>
              Mantente al día con las últimas mejoras y nuevas funcionalidades
              de la plataforma.
            </Typography>
            <List
              variant="outlined"
              sx={{
                borderRadius: "md",
                "--ListItem-paddingY": "12px",
                "--ListItem-paddingX": "16px",
              }}>
              {changelogs.map((item, index) => (
                <ListItem
                  key={item.id}
                  sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      mb: 1,
                    }}>
                    <Typography level="title-md">{item.title}</Typography>
                    <Chip
                      size="sm"
                      variant="soft"
                      color="neutral"
                      sx={{ "--Chip-radius": "sm" }}>
                      {item.type}
                    </Chip>
                  </Box>
                  <Typography
                    level="body-sm"
                    color="text.secondary"
                    sx={{ mb: 1 }}>
                    {new Date(item.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                  <Typography level="body-md">{item.description}</Typography>
                  {index < changelogs.length - 1 && ( // No mostrar Divider en el último elemento
                    <Divider sx={{ width: "100%", mt: 2 }} />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
        p: { xs: 2, md: 4 },
        bgcolor: "background.body",
        minHeight: "calc(100vh - 64px)",
      }}>
      {/* --- Navegación Lateral (Sidebar) --- */}
      <Box
        sx={{
          width: { xs: "100%", md: "250px" },
          flexShrink: 0,
          bgcolor: "background.surface",
          borderRadius: "lg",
          boxShadow: "md",
          p: 2,
          maxHeight: { xs: "auto", md: "calc(100vh - 100px)" },
          overflowY: "auto",
        }}>
        <Typography level="h4" sx={{ mb: 2, color: "text.primary" }}>
          Centro de Ayuda
        </Typography>
        <List
          size="lg"
          sx={{
            "--ListItem-radius": "lg",
            "--List-gap": "8px",
          }}>
          <ListItem>
            <ListItemButton
              selected={activeSection === "faq"}
              onClick={() => setActiveSection("faq")}>
              <HelpOutlineRoundedIcon />
              <ListItemContent>Preguntas Frecuentes (FAQ)</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={activeSection === "contact"}
              onClick={() => setActiveSection("contact")}>
              <ContactSupportRoundedIcon />
              <ListItemContent>Contacto con Soporte</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={activeSection === "tutorials"}
              onClick={() => setActiveSection("tutorials")}>
              <PlayCircleOutlineRoundedIcon />
              <ListItemContent>Tutoriales y Guías</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={activeSection === "status"}
              onClick={() => setActiveSection("status")}>
              <InfoOutlinedIcon />
              <ListItemContent>Estado del Sistema</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={activeSection === "changelog"}
              onClick={() => setActiveSection("changelog")}>
              <UpdateRoundedIcon />
              <ListItemContent>Novedades y Anuncios</ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* --- Contenido Principal --- */}
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "background.surface",
          borderRadius: "lg",
          boxShadow: "md",
          p: { xs: 2, md: 4 },
          overflowY: "auto",
        }}>
        {renderSectionContent()}{" "}
        {/* Llama a la función que renderiza el contenido */}
      </Box>
    </Box>
  );
}
