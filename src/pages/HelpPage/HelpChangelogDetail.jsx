// src/pages/HelpPage/HelpChangelogDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Sheet,
  Skeleton,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  Button,
  Link as JoyLink,
} from "@mui/joy";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import HeadsetMicRoundedIcon from "@mui/icons-material/HeadsetMicRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

import { getChangelogBySlug, listChangelogs } from "@/services/help.api";

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "micros.teh@tecnasadesk.com";
const WHATSAPP_URL =
  import.meta.env.VITE_SUPPORT_WHATSAPP || "https://wa.me/50495989756";

const TYPE_COLOR = {
  Added: "success",
  Changed: "warning",
  Fixed: "primary",
  Removed: "neutral",
  Deprecated: "neutral",
  Security: "danger",
  Performance: "success",
};

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function HelpChangelogDetail() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  const [related, setRelated] = useState([]);
  const [loadingRel, setLoadingRel] = useState(false);

  // Cargar novedad
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const c = await getChangelogBySlug(slug);
        setItem(c || null);
      } catch (e) {
        setError(e?.message || "No se pudo cargar la novedad.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Cargar relacionadas (mismo type si se puede; si no, últimas)
  useEffect(() => {
    (async () => {
      if (!item) return;
      setLoadingRel(true);
      try {
        const paramsSameType = item?.type
          ? { type: item.type, limit: 8 }
          : { limit: 8 };
        const res = await listChangelogs({
          ...paramsSameType,
          _ts: Date.now(),
        });
        const items = (res?.items || []).filter(
          (x) => (x.slug || String(x.id)) !== (item.slug || String(item.id))
        );
        // fallback si no hay del mismo tipo
        if (!items.length) {
          const res2 = await listChangelogs({ limit: 8, _ts: Date.now() });
          const alt = (res2?.items || []).filter(
            (x) => (x.slug || String(x.id)) !== (item.slug || String(item.id))
          );
          setRelated(alt.slice(0, 6));
        } else {
          setRelated(items.slice(0, 6));
        }
      } catch {
        setRelated([]);
      } finally {
        setLoadingRel(false);
      }
    })();
  }, [item?.type, item?.slug, item?.id, item]);

  const typeColor = TYPE_COLOR[item?.type] || "neutral";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const isPinned = useMemo(
    () =>
      item &&
      (item.pinned === true || item.pinned === 1 || item.pinned === "1"),
    [item]
  );

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
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
            py: { xs: 3, md: 4 },
          }}>
          <Stack spacing={1.25}>
            <Button
              size="sm"
              variant="plain"
              component={RouterLink}
              to="/admin/help/changelog"
              startDecorator={<ArrowBackRoundedIcon />}
              sx={{ alignSelf: "flex-start" }}>
              Volver a Novedades
            </Button>

            {loading ? (
              <>
                <Skeleton level="h2" width="70%" />
                <Stack direction="row" spacing={1}>
                  <Skeleton
                    variant="rectangular"
                    width={90}
                    height={28}
                    sx={{ borderRadius: 999 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={140}
                    height={28}
                    sx={{ borderRadius: 999 }}
                  />
                </Stack>
              </>
            ) : error ? (
              <Typography level="body-md" color="danger">
                {error}
              </Typography>
            ) : (
              <>
                <Typography
                  level="h1"
                  sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800 }}>
                  {item?.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ flexWrap: "wrap" }}>
                  {item?.type && (
                    <Chip size="sm" variant="soft" color={typeColor}>
                      {item.type}
                    </Chip>
                  )}
                  {item?.audience && (
                    <Chip size="sm" variant="soft" color="neutral">
                      Audiencia: {item.audience}
                    </Chip>
                  )}
                  {item?.date && (
                    <Chip size="sm" variant="soft" color="neutral">
                      {fmtDate(item.date)}
                    </Chip>
                  )}
                  {isPinned && (
                    <Chip
                      size="sm"
                      variant="soft"
                      color="success"
                      startDecorator={<PushPinRoundedIcon fontSize="sm" />}>
                      Fijado
                    </Chip>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Sheet>

      {/* Content + Sidebar */}
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, mt: 3 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 2, lg: 3 }}>
          {/* Main */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card
              variant="plain"
              sx={{
                border: "1px solid",
                borderColor: "neutral.outlinedBorder",
                borderRadius: "xl",
                boxShadow: "sm",
              }}>
              <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
                {loading ? (
                  <>
                    <Skeleton level="title-md" width="35%" />
                    <Skeleton level="body-md" />
                    <Skeleton level="body-md" width="95%" />
                    <Skeleton level="body-md" width="80%" />
                  </>
                ) : error ? (
                  <Sheet
                    variant="soft"
                    color="danger"
                    sx={{ p: 2, borderRadius: "md" }}>
                    <Typography>{error}</Typography>
                  </Sheet>
                ) : (
                  <>
                    {item?.description ? (
                      <Box
                        sx={{
                          "& p": { mb: 1.25 },
                          "& ul, & ol": { pl: 3, mb: 1.25 },
                          "& h1,& h2,& h3": { mt: 1.25, mb: 0.5 },
                          "& code": {
                            px: 0.5,
                            py: 0.25,
                            borderRadius: "sm",
                            bgcolor: "neutral.softBg",
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    ) : (
                      <Typography color="neutral">Sin descripción.</Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      justifyContent="space-between">
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        color="neutral">
                        <UpdateRoundedIcon fontSize="sm" />
                        <Typography level="body-sm">
                          Publicado {item?.date ? fmtDate(item.date) : "—"}
                        </Typography>
                      </Stack>

                      <Button
                        size="sm"
                        variant="plain"
                        startDecorator={<ContentCopyRoundedIcon />}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              window.location.href
                            );
                          } catch {}
                        }}>
                        Copiar enlace
                      </Button>
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Related */}
            <Box sx={{ mt: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mb: 1 }}>
                <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                  Novedades relacionadas
                </Typography>
                <JoyLink href="/admin/help/changelog" level="body-sm">
                  Ver todas
                </JoyLink>
              </Stack>

              {loadingRel ? (
                <Stack spacing={1.25}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card
                      key={i}
                      variant="plain"
                      sx={{
                        border: "1px solid",
                        borderColor: "neutral.outlinedBorder",
                        borderRadius: "xl",
                      }}>
                      <CardContent sx={{ p: 1.25 }}>
                        <Skeleton level="title-sm" width="70%" />
                        <Skeleton level="body-xs" width="40%" />
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : !related.length ? (
                <Typography level="body-sm" color="neutral">
                  No hay más anuncios por ahora.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {related.map((c) => (
                    <Card
                      key={c.id}
                      variant="plain"
                      component={RouterLink}
                      to={`/admin/help/changelog/${encodeURIComponent(
                        c.slug || c.id
                      )}`}
                      sx={{
                        border: "1px solid",
                        borderColor: "neutral.outlinedBorder",
                        borderRadius: "xl",
                        boxShadow: "sm",
                        textDecoration: "none",
                        "&:hover": {
                          boxShadow: "md",
                          transform: "translateY(-2px)",
                        },
                        transition: "all .15s ease",
                      }}>
                      <CardContent sx={{ p: 1.25 }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                          {c.title}
                        </Typography>
                        <Typography
                          level="body-xs"
                          color="neutral"
                          sx={{ mt: 0.25 }}>
                          {c.date ? fmtDate(c.date) : ""} • {c.type}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>

          {/* Sidebar */}
          <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0 }}>
            <Stack spacing={2}>
              <Card
                variant="plain"
                sx={{
                  border: "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  borderRadius: "xl",
                  boxShadow: "sm",
                }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HeadsetMicRoundedIcon />
                      <Typography level="title-sm">
                        ¿Necesitas más ayuda?
                      </Typography>
                    </Stack>
                    <Typography level="body-sm" color="neutral">
                      Nuestro equipo responde de L–V, 8:00–17:00.
                    </Typography>
                    <Stack
                      direction="column-reverse"
                      spacing={1}
                      flexWrap="wrap">
                      <Button
                        component="a"
                        href={`mailto:${SUPPORT_EMAIL}`}
                        sx={{ borderRadius: "999px" }}>
                        Escribir a soporte
                      </Button>
                      <Button
                        variant="soft"
                        component="a"
                        href={WHATSAPP_URL}
                        target="_blank"
                        sx={{ borderRadius: "999px" }}>
                        WhatsApp
                      </Button>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <HelpOutlineRoundedIcon fontSize="sm" />
                      <JoyLink href="/admin/help">
                        Ir al Centro de ayuda
                      </JoyLink>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
