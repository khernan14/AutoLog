// src/pages/HelpPage/HelpHome.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Sheet,
  Stack,
  Typography,
  Input,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  AspectRatio,
  Divider,
  Skeleton,
  Link as JoyLink,
  List,
  ListItem,
  ListItemButton,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import HelpSearchBox from "@/components/Help/HelpSearchBox";

import { listFaqs, listTutorials, listChangelogs } from "@/services/help.api";

/* ============ utils ============ */
function useDebounce() {
  const r = useRef();
  return (fn, ms = 250) =>
    (...args) => {
      clearTimeout(r.current);
      r.current = setTimeout(() => fn(...args), ms);
    };
}

function stripHtml(s = "") {
  const el = document.createElement("div");
  el.innerHTML = s;
  return (el.textContent || el.innerText || "").trim();
}

/* ============ Contacto (puedes mover a .env) ============ */
const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "micros.teh@tecnasadesk.com";
const WHATSAPP_URL =
  import.meta.env.VITE_SUPPORT_WHATSAPP || "https://wa.me/50495989756";

function ContactUsStrip() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      justifyContent="center"
      alignItems="center"
      sx={{
        mt: 1.25,
        p: 1,
        borderRadius: "999px",
        bgcolor: "neutral.softBg",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
      }}>
      <Typography level="body-sm" color="neutral">
        ¿No encuentras lo que buscas?
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          size="sm"
          component="a"
          href={`mailto:${SUPPORT_EMAIL}`}
          sx={{ borderRadius: "999px" }}>
          Escribir a soporte
        </Button>
        <Button
          size="sm"
          variant="soft"
          component="a"
          href={WHATSAPP_URL}
          target="_blank"
          sx={{ borderRadius: "999px" }}>
          WhatsApp
        </Button>
      </Stack>
    </Stack>
  );
}

/* ============ Page ============ */
export default function HelpHome() {
  // hero search
  const [query, setQuery] = useState("");
  const [openSuggest, setOpenSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState({ faqs: [], tutorials: [] });
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const debounced = useDebounce();
  const navigate = useNavigate();

  // data blocks
  const [faqs, setFaqs] = useState([]);
  const [tuts, setTuts] = useState([]);
  const [changelogs, setChangelogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [f, t, cl] = await Promise.all([
          listFaqs({ limit: 12, isActive: 1, visibility: "public" }),
          listTutorials({ limit: 8, visibility: "public" }),
          listChangelogs({ limit: 6, _ts: Date.now() }),
        ]);
        setFaqs(f?.items || []);
        setTuts(t?.items || []);
        setChangelogs(cl?.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const go = (to) => (e) => {
    e?.preventDefault?.();
    navigate(to);
  };

  // derived
  const popularFaqs = useMemo(() => (faqs || []).slice(0, 6), [faqs]);

  const quickTopics = useMemo(() => {
    const pool =
      (faqs || [])
        .map((x) => x.category)
        .filter(Boolean)
        .slice(0, 8) || [];
    return pool.length
      ? pool
      : [
          "Precios",
          "Evaluaciones",
          "Calendario",
          "Políticas",
          "Cuentas",
          "Reportes",
        ];
  }, [faqs]);

  // suggestions
  const fetchSuggest = async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions({ faqs: [], tutorials: [] });
      setOpenSuggest(false);
      return;
    }
    setLoadingSuggest(true);
    try {
      const [fs, ts] = await Promise.all([
        listFaqs({ q, limit: 5, isActive: 1, visibility: "public" }),
        listTutorials({ q, limit: 5, visibility: "public" }),
      ]);
      setSuggestions({ faqs: fs?.items || [], tutorials: ts?.items || [] });
      setOpenSuggest(true);
    } finally {
      setLoadingSuggest(false);
    }
  };

  const onChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    debounced(fetchSuggest, 250)(v);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/admin/help/faqs?q=${encodeURIComponent(query.trim())}`);
    }
  };

  /* ============ UI ============ */
  return (
    <Box sx={{ pb: 6 }}>
      {/* HERO */}
      <Sheet
        variant="plain"
        sx={{
          borderBottom: "1px solid",
          borderColor: "neutral.outlinedBorder",
          bgcolor: "background.body",
        }}>
        <Box
          sx={{
            maxWidth: 1120,
            mx: "auto",
            px: { xs: 2, md: 3 },
            py: { xs: 6, md: 8 },
          }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography
              level="h1"
              sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 800 }}>
              Hola, ¿qué quieres aprender?
            </Typography>

            {/* 🔎 Buscador con sugerencias y navegación */}
            <Box sx={{ width: "100%", maxWidth: 680 }}>
              <HelpSearchBox
                placeholder="Busca artículos y mucho más"
                size="lg"
                // si tu HelpSearchBox acepta esto (según la implementación sugerida):
                onSubmitNavigate={(q) =>
                  navigate(`/admin/help/search?q=${encodeURIComponent(q)}`)
                }
              />
            </Box>

            {/* chips de temas */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", justifyContent: "center" }}>
              {quickTopics.map((c) => (
                <Chip
                  key={c}
                  variant="soft"
                  onClick={() =>
                    navigate(`/admin/help/search?q=${encodeURIComponent(c)}`)
                  }
                  sx={{ borderRadius: "999px" }}>
                  {c}
                </Chip>
              ))}
            </Stack>

            {/* franja de contacto */}
            <ContactUsStrip />
          </Stack>
        </Box>
      </Sheet>

      {/* SECTION: “Llega más lejos” (destacados) */}
      <Section
        title="Tutoriales y guías (destacados)"
        actionHref={go("/admin/help/tutorials")}>
        <Grid container spacing={2}>
          {(loading ? Array.from({ length: 4 }) : tuts.slice(0, 4)).map(
            (t, i) => (
              <Grid key={i} xs={12} sm={6} md={3}>
                <Card
                  variant="plain"
                  sx={{
                    border: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    borderRadius: "xl",
                    boxShadow: "sm",
                    height: "100%",
                  }}>
                  <CardContent>
                    {loading ? (
                      <>
                        <Skeleton
                          variant="rectangular"
                          height={140}
                          sx={{ borderRadius: "md" }}
                        />
                        <Skeleton level="title-sm" sx={{ mt: 1 }} />
                        <Skeleton level="body-sm" width="80%" />
                      </>
                    ) : (
                      <>
                        <AspectRatio
                          ratio={16 / 9}
                          sx={{ borderRadius: "md", overflow: "hidden" }}>
                          <img
                            src={
                              t.imageUrl ||
                              "https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop"
                            }
                            alt={t.title}
                            loading="lazy"
                          />
                        </AspectRatio>
                        <Typography
                          level="title-sm"
                          sx={{
                            mt: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}>
                          {t.title}
                        </Typography>
                        <Typography
                          level="body-sm"
                          color="neutral"
                          sx={{ mt: 0.25 }}>
                          {t.category || "Tutorial"}
                        </Typography>
                        <JoyLink
                          component="button"
                          onClick={go(
                            `/admin/help/tutorials/${encodeURIComponent(
                              t.slug || t.id
                            )}`
                          )}
                          sx={{
                            mt: 0.75,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}>
                          <PlayCircleOutlineRoundedIcon fontSize="sm" />
                          Ver tutorial
                        </JoyLink>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      </Section>

      {/* SECTION: “Tus herramientas” (artículos) */}
      <Section
        title="Preguntas frecuentes (destacadas)"
        actionHref={go("/admin/help/faqs")}>
        <Grid container spacing={2}>
          {(loading ? Array.from({ length: 6 }) : popularFaqs).map((f, i) => (
            <Grid key={i} xs={12} sm={6} md={4}>
              <Card
                variant="plain"
                sx={{
                  border: "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  borderRadius: "xl",
                  boxShadow: "sm",
                  height: "100%",
                }}>
                <CardContent>
                  {loading ? (
                    <>
                      <Skeleton level="title-sm" width="80%" />
                      <Skeleton level="body-sm" />
                      <Skeleton level="body-sm" width="70%" />
                    </>
                  ) : (
                    <>
                      <Typography level="title-sm" sx={{ mb: 0.25 }}>
                        <JoyLink
                          component="button"
                          onClick={go(
                            `/admin/help/faqs/${encodeURIComponent(
                              f.slug || f.id
                            )}`
                          )}
                          sx={{
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}>
                          {f.question}
                        </JoyLink>
                      </Typography>
                      <Typography level="body-sm" color="neutral">
                        {f.category || "General"}
                      </Typography>
                      {f.answer && (
                        <Typography
                          level="body-sm"
                          color="neutral"
                          sx={{
                            mt: 0.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}>
                          {stripHtml(f.answer)}
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* SECTION: Novedades */}
      <Section
        title="Novedades y anuncios"
        actionHref={go("/admin/help/changelog")}>
        <Card
          variant="plain"
          sx={{
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "xl",
            boxShadow: "sm",
          }}>
          <CardContent sx={{ p: 2 }}>
            {loading ? (
              <Stack spacing={2}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} level="body-sm" />
                ))}
              </Stack>
            ) : changelogs.length === 0 ? (
              <Typography color="neutral">No hay novedades aún.</Typography>
            ) : (
              <Stack spacing={1.25}>
                {changelogs.map((c) => (
                  <Stack
                    key={c.id}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start">
                    <UpdateRoundedIcon fontSize="sm" />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography level="title-sm">{c.title}</Typography>
                      <Typography level="body-xs" color="neutral">
                        {new Date(c.date).toLocaleDateString()} • {c.type}
                      </Typography>
                      {c.description && (
                        <Typography level="body-sm" sx={{ mt: 0.25 }}>
                          {c.description}
                        </Typography>
                      )}
                      <JoyLink
                        component="button"
                        onClick={go(
                          `/admin/help/changelog/${encodeURIComponent(
                            c.slug || c.id
                          )}`
                        )}>
                        Ver detalle
                      </JoyLink>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Section>
    </Box>
  );
}

/* ============ Section wrapper ============ */
function Section({ title, actionHref, children }) {
  return (
    <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, mt: 5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ mb: 2 }}>
        <Typography
          level="h2"
          sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800 }}>
          {title}
        </Typography>

        {actionHref && (
          <JoyLink component="button" onClick={actionHref} level="body-sm">
            Mostrar todos
          </JoyLink>
        )}
      </Stack>
      {children}
      <Divider sx={{ mt: 3 }} />
    </Box>
  );
}
