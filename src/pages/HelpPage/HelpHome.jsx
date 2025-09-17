// src/pages/HelpPage/HelpHome.jsx (rediseño)
// - Bordes más redondeados
// - Tarjetas alineadas y centradas visualmente
// - Superficies suaves y sombras consistentes
// - Buscador con "glass" más claro
// - Microinteracciones (hover) sutiles

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Box,
  Sheet,
  Stack,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Input,
  Link as JoyLink,
  Skeleton,
  List,
  ListItem,
  ListItemButton,
  AspectRatio,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LiveHelpRoundedIcon from "@mui/icons-material/LiveHelpRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import HeadsetMicRoundedIcon from "@mui/icons-material/HeadsetMicRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import MiscellaneousServicesRoundedIcon from "@mui/icons-material/MiscellaneousServicesRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";

import {
  listFaqs,
  voteFaqHelpful,
  listTutorials,
  getOverallStatus,
  listServices,
  listChangelogs,
  statusToJoyColor,
} from "../../services/help.api.js";

/* --------------------- helpers --------------------- */
function useDebouncedCallback(fn, delay) {
  const tRef = useRef();
  return useCallback(
    (...args) => {
      clearTimeout(tRef.current);
      tRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

const TYPE_COLOR = {
  Added: "success",
  Changed: "warning",
  Fixed: "primary",
  Removed: "neutral",
  Deprecated: "neutral",
  Security: "danger",
  Performance: "success",
};

const isPinned = (v) => v === true || v === 1 || v === "1";

const ICON_BY_CATEGORY = {
  "Cuentas & Acceso": <VerifiedUserRoundedIcon />,
  "Reservas & Uso": <DirectionsCarRoundedIcon />,
  Facturación: <ReceiptLongRoundedIcon />,
  "Activos & QR": <QrCode2RoundedIcon />,
  "Servicios & Soporte": <HeadsetMicRoundedIcon />,
  Reportes: <DescriptionRoundedIcon />,
};

export default function HelpHome() {
  /* --------- status --------- */
  const [overall, setOverall] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  /* --------- faqs --------- */
  const [faqQuery, setFaqQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [errorFaqs, setErrorFaqs] = useState(null);

  /* --------- tutorials --------- */
  const [tutorials, setTutorials] = useState([]);
  const [loadingTuts, setLoadingTuts] = useState(true);
  const [errorTuts, setErrorTuts] = useState(null);

  /* --------- changelogs --------- */
  const [changelogs, setChangelogs] = useState([]);
  const [loadingCh, setLoadingCh] = useState(true);
  const [errorCh, setErrorCh] = useState(null);

  /* --------- suggest search --------- */
  const [query, setQuery] = useState("");
  const [openSuggest, setOpenSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState({ faqs: [], tutorials: [] });
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const anchorRef = useRef(null);

  const fetchSuggestions = useDebouncedCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions({ faqs: [], tutorials: [] });
      setOpenSuggest(false);
      return;
    }
    setLoadingSuggest(true);
    try {
      const [fs, ts] = await Promise.all([
        listFaqs({ q, limit: 5, visibility: "public", isActive: 1 }),
        listTutorials({ q, limit: 5, visibility: "public" }),
      ]);
      setSuggestions({
        faqs: fs?.items || [],
        tutorials: ts?.items || [],
      });
      setOpenSuggest(true);
    } catch {
      setSuggestions({ faqs: [], tutorials: [] });
      setOpenSuggest(false);
    } finally {
      setLoadingSuggest(false);
    }
  }, 250);

  const onChangeQuery = (e) => {
    const q = e.target.value;
    setQuery(q);
    setFaqQuery(q); // sincroniza con el buscador de FAQs
    fetchSuggestions(q);
  };
  const onBlurSearch = () => setTimeout(() => setOpenSuggest(false), 120);

  /* --------- initial loaders --------- */
  useEffect(() => {
    (async () => {
      setLoadingStatus(true);
      setErrorStatus(null);
      try {
        const [ov, svcs] = await Promise.all([
          getOverallStatus(),
          listServices(),
        ]);
        setOverall(ov);
        setServices(Array.isArray(svcs) ? svcs : []);
      } catch (e) {
        setErrorStatus(
          e?.message || "No se pudo cargar el estado del sistema."
        );
      } finally {
        setLoadingStatus(false);
      }
    })();

    (async () => {
      setLoadingFaqs(true);
      setErrorFaqs(null);
      try {
        const resp = await listFaqs({
          limit: 6,
          visibility: "public",
          isActive: 1,
        });
        setFaqs(resp?.items || []);
      } catch (e) {
        setErrorFaqs(e?.message || "No se pudieron cargar las FAQs.");
      } finally {
        setLoadingFaqs(false);
      }
    })();

    (async () => {
      setLoadingTuts(true);
      setErrorTuts(null);
      try {
        const resp = await listTutorials({ limit: 6, visibility: "public" });
        setTutorials(resp?.items || []);
      } catch (e) {
        setErrorTuts(e?.message || "No se pudieron cargar los tutoriales.");
      } finally {
        setLoadingTuts(false);
      }
    })();

    (async () => {
      setLoadingCh(true);
      setErrorCh(null);
      try {
        // 1) Fijados (hasta 3)  2) No fijados (hasta 6)
        const [fix, rest] = await Promise.all([
          listChangelogs({ pinned: 1, limit: 3, _ts: Date.now() }),
          listChangelogs({ pinned: 0, limit: 6, _ts: Date.now() }),
        ]);

        const pinnedItems = fix?.items || [];
        const otherItems = (rest?.items || []).filter(
          (x) => !pinnedItems.some((y) => y.id === x.id)
        );

        // Final: fijados primero, luego recientes no fijados (muestra 4)
        const final = [...pinnedItems, ...otherItems].slice(0, 4);
        setChangelogs(final);
      } catch (e) {
        setErrorCh(e?.message || "No se pudieron cargar las novedades.");
        setChangelogs([]);
      } finally {
        setLoadingCh(false);
      }
    })();
  }, []);

  /* --------- search FAQs submit --------- */
  const onSearchFaqs = async (e) => {
    e?.preventDefault?.();
    setLoadingFaqs(true);
    setErrorFaqs(null);
    try {
      const resp = await listFaqs({
        q: faqQuery,
        limit: 8,
        visibility: "public",
        isActive: 1,
      });
      setFaqs(resp?.items || []);
    } catch (e) {
      setErrorFaqs(e?.message || "No se pudieron cargar las FAQs.");
    } finally {
      setLoadingFaqs(false);
    }
  };

  const handleVote = async (id, up) => {
    try {
      await voteFaqHelpful(id, { up });
    } catch {}
  };

  /* --------- derive --------- */
  const faqByCategory = useMemo(() => {
    const map = new Map();
    for (const f of faqs) {
      const cat = f.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(f);
    }
    return Array.from(map.entries()).sort(
      (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])
    );
  }, [faqs]);

  const topCategories = useMemo(
    () => faqByCategory.slice(0, 6),
    [faqByCategory]
  );
  const popularFaqs = useMemo(() => faqs.slice(0, 6), [faqs]);

  /* --------- UI --------- */
  return (
    <Box borderRadius={{ xs: 0, md: "xl" }}>
      {/* HERO con degradado + buscador moderno + sugerencias */}
      <Sheet
        variant="plain"
        sx={{
          background: "white",
          color: "common.black",
          borderBottomLeftRadius: { xs: 0, md: "xl" },
          borderBottomRightRadius: { xs: 0, md: "xl" },
        }}>
        <PageSection py={{ xs: 4, md: 6 }}>
          <Stack spacing={2.25} alignItems="center" textAlign="center">
            <Typography level="h2">Centro de Ayuda</Typography>
            <Typography
              level="body-lg"
              textColor="common.black"
              sx={{ opacity: 0.88 }}>
              Busca respuestas, explora categorías o contáctanos.
            </Typography>

            <Box
              sx={{ width: "100%", maxWidth: 720, mt: 1, position: "relative" }}
              ref={anchorRef}>
              <form onSubmit={onSearchFaqs}>
                <Input
                  variant="outlined"
                  size="lg"
                  value={query}
                  onChange={onChangeQuery}
                  onFocus={() =>
                    query?.length >= 2 ? setOpenSuggest(true) : null
                  }
                  onBlur={onBlurSearch}
                  placeholder="Busca: soporte, reservas, QR, cuentas…"
                  startDecorator={<SearchRoundedIcon />}
                  slotProps={{
                    input: {
                      sx: {
                        color: "text.primary",
                        "&::placeholder": {
                          color: "text.tertiary",
                          opacity: 1,
                        },
                      },
                    },
                    decorator: { sx: { color: "text.tertiary" } },
                  }}
                  sx={{
                    "--Input-radius": "999px",
                    "--Input-minHeight": "56px",
                    bgcolor: "common.white",
                    borderColor: "neutral.outlinedBorder",
                    "&:hover": { borderColor: "neutral.outlinedBorder" },
                    "&:focus-within": {
                      borderColor: "text.primary",
                      boxShadow: "md",
                    },
                  }}
                />
              </form>

              {openSuggest && (
                <Sheet
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    borderRadius: "lg",
                    p: 0,
                    zIndex: 1200,
                    bgcolor: "background.body",
                    boxShadow: "lg",
                  }}>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "neutral.outlinedBorder",
                    }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      Principales resultados de búsqueda
                    </Typography>
                  </Box>

                  {loadingSuggest ? (
                    <Box sx={{ p: 1.25 }}>
                      <ListSkeleton rows={4} />
                    </Box>
                  ) : suggestions.faqs.length === 0 &&
                    suggestions.tutorials.length === 0 ? (
                    <Box sx={{ p: 1.25 }}>
                      <Typography level="body-sm" color="neutral">
                        Sin coincidencias. Prueba con otras palabras.
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ py: 0 }}>
                      {suggestions.faqs.map((f) => (
                        <ListItem key={`faq-${f.id}`} sx={{ py: 0 }}>
                          <ListItemButton
                            component="a"
                            href={`/admin/help/faqs/${encodeURIComponent(
                              f.slug || f.id
                            )}`}>
                            <Stack spacing={0.25}>
                              <Typography level="body-sm">
                                {f.question}
                              </Typography>
                              <Typography level="body-xs" color="neutral">
                                Centro de Ayuda &gt; {f.category || "General"}
                              </Typography>
                            </Stack>
                          </ListItemButton>
                        </ListItem>
                      ))}
                      {suggestions.tutorials.map((t) => (
                        <ListItem key={`tut-${t.id}`} sx={{ py: 0 }}>
                          <ListItemButton
                            component="a"
                            href={`/admin/help/tutorials/${encodeURIComponent(
                              t.slug || t.id
                            )}`}>
                            <Stack spacing={0.25}>
                              <Typography level="body-sm">{t.title}</Typography>
                              {t.category ? (
                                <Typography level="body-xs" color="neutral">
                                  Tutorial &gt; {t.category}
                                </Typography>
                              ) : null}
                            </Stack>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Sheet>
              )}
            </Box>

            <SystemMiniStatus
              loading={loadingStatus}
              error={errorStatus}
              overall={overall}
            />
          </Stack>
        </PageSection>
      </Sheet>

      {/* Categorías */}
      <PageSection>
        <SectionTitle title="Explorar por categoría" />
        <Grid container spacing={1.5} alignItems="stretch">
          {topCategories.length === 0 &&
            (loadingFaqs ? (
              [...Array(6)].map((_, i) => (
                <Grid key={i} xs={12} sm={6} md={4}>
                  <CategorySkeleton />
                </Grid>
              ))
            ) : (
              <Grid xs={12}>
                <Typography color="neutral">
                  Sin categorías por ahora.
                </Typography>
              </Grid>
            ))}
          {topCategories.map(([cat, items]) => (
            <Grid key={cat} xs={12} sm={6} md={4}>
              <CategoryCard
                icon={ICON_BY_CATEGORY[cat] || <LiveHelpRoundedIcon />}
                title={cat}
                count={items.length}
                href={`/admin/help/faqs?category=${encodeURIComponent(cat)}`}
              />
            </Grid>
          ))}
        </Grid>
      </PageSection>

      {/* Populares & Tutoriales */}
      <PageSection py={{ xs: 1, md: 2 }}>
        <Grid container spacing={1.5} alignItems="stretch">
          <Grid xs={12} md={6}>
            <SectionCard
              title="Artículos populares"
              icon={<LiveHelpRoundedIcon />}>
              {loadingFaqs ? (
                <ListSkeleton rows={6} />
              ) : errorFaqs ? (
                <ErrorInline message={errorFaqs} />
              ) : (
                <Stack spacing={1}>
                  {popularFaqs.map((f) => (
                    <JoyLink
                      key={f.id}
                      href={`/admin/help/faqs/${encodeURIComponent(
                        f.slug || f.id
                      )}`}>
                      {f.question}
                    </JoyLink>
                  ))}
                  {popularFaqs.length === 0 && (
                    <Typography color="neutral">
                      Aún no hay artículos.
                    </Typography>
                  )}
                </Stack>
              )}
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" justifyContent="flex-end">
                <JoyLink href="/admin/help/faqs">Ver todas las FAQs</JoyLink>
              </Stack>
            </SectionCard>
          </Grid>

          <Grid xs={12} md={6}>
            <SectionCard
              title="Tutoriales destacados"
              icon={<PlayCircleOutlineRoundedIcon />}>
              {loadingTuts ? (
                <TutorialsSkeleton compact />
              ) : errorTuts ? (
                <ErrorInline message={errorTuts} />
              ) : (
                <Stack spacing={1.25}>
                  {(tutorials || []).slice(0, 2).map((t) => (
                    <TutorialRow key={t.id} t={t} />
                  ))}
                  {!tutorials?.length && (
                    <Typography color="neutral">Sin tutoriales aún.</Typography>
                  )}
                </Stack>
              )}

              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" justifyContent="flex-end">
                <JoyLink href="/admin/help/tutorials">
                  Ver todos los tutoriales
                </JoyLink>
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </PageSection>

      {/* Novedades & Soporte */}
      <PageSection py={{ xs: 1, md: 3 }}>
        <Grid container spacing={1.5} alignItems="stretch">
          <Grid xs={12} md={7}>
            <SectionCard
              title="Novedades y anuncios"
              icon={<UpdateRoundedIcon />}>
              {loadingCh ? (
                <ChangelogSkeleton rows={4} />
              ) : errorCh ? (
                <ErrorInline message={errorCh} />
              ) : (
                <ChangelogList items={changelogs} />
              )}
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" justifyContent="flex-end">
                <JoyLink href="/admin/help/changelog">
                  Ver todas las novedades
                </JoyLink>
              </Stack>
            </SectionCard>
          </Grid>
          <Grid xs={12} md={5}>
            <SupportCard />
          </Grid>
        </Grid>
      </PageSection>
    </Box>
  );
}

/* --------------------- subcomponentes --------------------- */
function PageSection({ children, py }) {
  return (
    <Box
      sx={{
        maxWidth: 1120,
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: py || { xs: 2.5, md: 3.5 },
      }}>
      {children}
    </Box>
  );
}

function SectionTitle({ title }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 1.5 }}>
      <Typography level="h4">{title}</Typography>
    </Stack>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <Card
      variant="plain"
      sx={{
        borderRadius: "xl",
        height: "100%",
        boxShadow: "md",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        bgcolor: "background.body",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": { boxShadow: "lg", transform: "translateY(-2px)" },
      }}>
      <CardContent
        sx={{
          p: 2.25,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "md",
              bgcolor: "primary.softBg",
              color: "primary.solidColor",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}>
            {icon}
          </Box>
          <Typography level="title-md">{title}</Typography>
        </Stack>
        <Divider sx={{ mb: 1.25 }} />
        <Box sx={{ flex: 1 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ icon, title, count, href }) {
  return (
    <Card
      component="a"
      href={href}
      variant="soft"
      sx={{
        height: 140,
        borderRadius: "xl",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 2,
        boxShadow: "xs",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": { boxShadow: "md", transform: "translateY(-3px)" },
      }}>
      <Stack spacing={0.75} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "md",
            bgcolor: "primary.softBg",
            color: "primary.solidColor",
            display: "grid",
            placeItems: "center",
          }}>
          {icon}
        </Box>
        <Typography level="title-sm">{title}</Typography>
        <Typography level="body-xs" color="neutral">
          {count} artículo{count === 1 ? "" : "s"}
        </Typography>
      </Stack>
    </Card>
  );
}

function CategorySkeleton() {
  return (
    <Card variant="soft" sx={{ height: 140, borderRadius: "xl" }}>
      <CardContent sx={{ p: 2 }}>
        <Skeleton
          variant="rectangular"
          width={44}
          height={44}
          sx={{ borderRadius: 10 }}
        />
        <Skeleton level="title-sm" sx={{ mt: 1, width: "60%" }} />
        <Skeleton level="body-xs" sx={{ mt: 0.5, width: "40%" }} />
      </CardContent>
    </Card>
  );
}

function TutorialsSkeleton({ compact = false }) {
  const items = compact ? 4 : 6;
  return (
    <Grid container spacing={1.25}>
      {[...Array(items)].map((_, i) => (
        <Grid key={i} xs={12} sm={6}>
          <Card
            size="sm"
            variant="soft"
            sx={{ borderRadius: "lg", height: "100%" }}>
            <CardContent>
              <Skeleton level="title-sm" width="70%" />
              <Skeleton variant="rectangular" height={110} sx={{ mt: 0.75 }} />
              <Skeleton level="body-sm" sx={{ mt: 0.75 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function ListSkeleton({ rows = 6 }) {
  return (
    <Stack spacing={1}>
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} level="body-sm" />
      ))}
    </Stack>
  );
}

function ChangelogSkeleton({ rows = 4 }) {
  return (
    <Stack spacing={1.25}>
      {[...Array(rows)].map((_, i) => (
        <Stack key={i} direction="row" spacing={1}>
          <Skeleton
            variant="circular"
            width={10}
            height={10}
            sx={{ mt: "7px" }}
          />
          <Stack sx={{ flex: 1 }}>
            <Skeleton level="title-sm" width="60%" />
            <Skeleton level="body-xs" width="30%" />
            <Skeleton level="body-sm" width="90%" />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

function SystemMiniStatus({ loading, error, overall }) {
  if (loading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <Skeleton variant="circular" width={10} height={10} />
        <Skeleton level="body-sm" width={220} />
      </Stack>
    );
  }
  if (error) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <ErrorOutlineRoundedIcon fontSize="sm" />
        <Typography level="body-sm">{error}</Typography>
      </Stack>
    );
  }
  const ok = (overall?.overall_status || "").toUpperCase() === "OK";
  return (
    <Chip
      size="sm"
      variant="soft"
      color={ok ? "success" : "warning"}
      startDecorator={<BoltRoundedIcon />}
      sx={{ mt: 1, bgcolor: "background.gray", borderRadius: "999px" }}>
      {ok ? "Todos los sistemas operando" : "Incidencias detectadas"}
    </Chip>
  );
}

function ErrorInline({ message }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ErrorOutlineRoundedIcon />
      <Typography level="body-sm">{message || "Error"}</Typography>
    </Stack>
  );
}

function TutorialTile({ t }) {
  return (
    <Card size="sm" variant="soft" sx={{ height: "100%", borderRadius: "lg" }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Typography level="title-sm">{t.title}</Typography>
          {t.imageUrl ? (
            <AspectRatio
              ratio={16 / 9}
              sx={{
                borderRadius: "md",
                border: "1px solid",
                borderColor: "neutral.outlinedBorder",
              }}>
              <img src={t.imageUrl} alt={t.title} loading="lazy" />
            </AspectRatio>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 110,
                borderRadius: "md",
                border: "1px dashed",
                borderColor: "neutral.outlinedBorder",
                display: "grid",
                placeItems: "center",
                color: "neutral.500",
              }}>
              <PlayCircleOutlineRoundedIcon />
            </Box>
          )}
          <Typography level="body-sm" color="neutral">
            {t.description || "—"}
          </Typography>
          <Stack direction="row" spacing={1}>
            {t.category && <Chip size="sm">{t.category}</Chip>}
            {t.duration_seconds ? (
              <Chip size="sm" variant="soft" color="neutral">
                {Math.round(t.duration_seconds / 60)} min
              </Chip>
            ) : null}
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <JoyLink
              href={`/admin/help/tutorials/${encodeURIComponent(
                t.slug || t.id
              )}`}>
              Ver tutorial
            </JoyLink>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function TutorialRow({ t }) {
  return (
    <Card
      variant="soft"
      sx={{
        borderRadius: "lg",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        bgcolor: "background.body",
      }}>
      <CardContent sx={{ p: 1.25 }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            component="img"
            src={
              t.imageUrl ||
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            }
            alt={t.title}
            sx={{
              width: 136,
              height: 88,
              objectFit: "cover",
              borderRadius: "sm",
              border: "1px solid",
              borderColor: "neutral.outlinedBorder",
              flexShrink: 0,
            }}
          />
          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              level="title-sm"
              sx={{
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
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
              {t.description || "—"}
            </Typography>
            <Stack direction="row" spacing={1}>
              {t.category && <Chip size="sm">{t.category}</Chip>}
              {t.duration_seconds ? (
                <Chip size="sm" variant="soft" color="neutral">
                  {Math.round(t.duration_seconds / 60)} min
                </Chip>
              ) : null}
            </Stack>
            <Stack direction="row" justifyContent="flex-end">
              <JoyLink
                href={`/admin/help/tutorials/${encodeURIComponent(
                  t.slug || t.id
                )}`}>
                Ver tutorial
              </JoyLink>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ChangelogList({ items }) {
  if (!items?.length) {
    return <Typography color="neutral">No hay novedades aún.</Typography>;
  }
  return (
    <Stack spacing={1.25}>
      {items.map((c) => (
        <Stack
          key={c.id}
          direction="row"
          spacing={1.25}
          alignItems="flex-start">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "99px",
              mt: "7px",
              bgcolor:
                (TYPE_COLOR[c.type] && `${TYPE_COLOR[c.type]}.solidBg`) ||
                "neutral.solidBg",
              flexShrink: 0,
            }}
          />
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                {c.title}
              </Typography>
              {isPinned(c.pinned) && (
                <Chip
                  size="sm"
                  variant="soft"
                  color="success"
                  startDecorator={<PushPinRoundedIcon fontSize="sm" />}>
                  Fijado
                </Chip>
              )}
            </Stack>

            <Typography level="body-xs" color="neutral">
              {formatDate(c.date)} • {c.type}
            </Typography>

            {c.description ? (
              <Typography level="body-sm" sx={{ mt: 0.25 }}>
                {c.description}
              </Typography>
            ) : null}

            <JoyLink
              href={`/admin/help/changelog/${encodeURIComponent(
                c.slug || c.id
              )}`}>
              Ver detalle
            </JoyLink>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

function SupportCard() {
  const SUPPORT_EMAIL = "soporte@tu-dominio.com";
  const WHATSAPP = "https://wa.me/50495989756";

  return (
    <Card
      variant="plain"
      sx={{
        borderRadius: "xl",
        height: "100%",
        boxShadow: "md",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": { boxShadow: "lg", transform: "translateY(-2px)" },
      }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <HeadsetMicRoundedIcon />
            <Typography level="title-md">¿Necesitas más ayuda?</Typography>
          </Stack>
          <Typography level="body-sm" color="neutral">
            Nuestro equipo responde de L–V, 8:00–17:00 (SLA 24–48h).
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              component="a"
              href={`mailto:${SUPPORT_EMAIL}`}
              sx={{ borderRadius: "999px" }}>
              Escribir a soporte
            </Button>
            <Button
              variant="soft"
              component="a"
              href={WHATSAPP}
              target="_blank"
              sx={{ borderRadius: "999px" }}>
              WhatsApp
            </Button>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MiscellaneousServicesRoundedIcon fontSize="sm" />
              <JoyLink href="/admin/help/status">Estado del sistema</JoyLink>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <DescriptionRoundedIcon fontSize="sm" />
              <JoyLink href="/admin/help/changelog">
                Novedades recientes
              </JoyLink>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* --------------------- utils --------------------- */
function formatDate(d) {
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d || "");
  }
}
