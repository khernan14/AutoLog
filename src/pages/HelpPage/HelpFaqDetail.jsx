// src/pages/HelpPage/HelpFaqDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Sheet,
  Skeleton,
  Card,
  CardContent,
  Divider,
  Link as JoyLink,
} from "@mui/joy";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import ThumbDownAltRoundedIcon from "@mui/icons-material/ThumbDownAltRounded";
import HeadsetMicRoundedIcon from "@mui/icons-material/HeadsetMicRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

import { getFaqBySlug, voteFaqHelpful, listFaqs } from "@/services/help.api";

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "soporte@tu-dominio.com";
const WHATSAPP_URL =
  import.meta.env.VITE_SUPPORT_WHATSAPP || "hmicros.teh@tecnasadesk.com";

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

export default function HelpFaqDetail() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [faq, setFaq] = useState(null);
  const [error, setError] = useState(null);

  // voto útil
  const [voted, setVoted] = useState(false);
  const [voteState, setVoteState] = useState(null); // "up" | "down" | null
  const votedMsg = useMemo(() => {
    if (voteState === "up") return "¡Gracias por tu opinión!";
    if (voteState === "down")
      return "Gracias. Usaremos tu feedback para mejorar este artículo.";
    return "";
  }, [voteState]);

  // relacionados
  const [related, setRelated] = useState([]);
  const [loadingRel, setLoadingRel] = useState(false);

  const navigate = useNavigate();

  // cargar FAQ
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      setVoted(false);
      setVoteState(null);
      try {
        const f = await getFaqBySlug(slug);
        setFaq(f || null);
      } catch (e) {
        setError(e?.message || "No se pudo cargar la FAQ.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // cargar relacionados por categoría
  useEffect(() => {
    (async () => {
      if (!faq?.category) {
        setRelated([]);
        return;
      }
      setLoadingRel(true);
      try {
        const r = await listFaqs({
          category: faq.category,
          limit: 8,
          visibility: "public",
          isActive: 1,
        });
        const items = (r?.items || []).filter(
          (x) => (x.slug || String(x.id)) !== (faq.slug || String(faq.id))
        );
        setRelated(items.slice(0, 6));
      } catch {
        setRelated([]);
      } finally {
        setLoadingRel(false);
      }
    })();
  }, [faq?.category, faq?.slug, faq?.id]);

  const onVote = async (up) => {
    if (!faq || voted) return;
    try {
      await voteFaqHelpful(faq.id, { up });
      setVoted(true);
      setVoteState(up ? "up" : "down");
    } catch {
      // silently ignore
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const go = (to) => (e) => {
    e?.preventDefault?.();
    navigate(to);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Encabezado */}
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
              to="/admin/help/faqs"
              startDecorator={<ArrowBackRoundedIcon />}
              sx={{ alignSelf: "flex-start" }}>
              Volver a FAQs
            </Button>

            {loading ? (
              <>
                <Skeleton level="h2" width="70%" />
                <Stack direction="row" spacing={1}>
                  <Skeleton
                    variant="rectangular"
                    width={80}
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
                  {faq?.question}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ flexWrap: "wrap" }}>
                  <Chip size="sm" variant="soft">
                    {faq?.category || "General"}
                  </Chip>
                  {faq?.updatedAt && (
                    <Chip size="sm" variant="soft" color="neutral">
                      Actualizado: {fmtDate(faq.updatedAt)}
                    </Chip>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Sheet>

      {/* Contenido + Sidebar */}
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, mt: 3 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 2, lg: 3 }}>
          {/* Columna principal */}
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
                    {/* Respuesta: si viene con HTML, lo renderizamos */}
                    {faq?.answer ? (
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
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    ) : (
                      <Typography color="neutral">
                        Este artículo aún no tiene contenido.
                      </Typography>
                    )}

                    {/* Acciones */}
                    <Divider sx={{ my: 2 }} />
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between">
                      {/* Voto útil */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography level="body-sm">
                          ¿Te resultó útil?
                        </Typography>
                        <Button
                          size="sm"
                          variant="soft"
                          startDecorator={<ThumbUpAltRoundedIcon />}
                          disabled={voted}
                          onClick={() => onVote(true)}>
                          Sí
                        </Button>
                        <Button
                          size="sm"
                          variant="plain"
                          startDecorator={<ThumbDownAltRoundedIcon />}
                          disabled={voted}
                          onClick={() => onVote(false)}>
                          No
                        </Button>
                        {voted && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            sx={{ ml: 1 }}>
                            <CheckCircleRoundedIcon fontSize="sm" />
                            <Typography level="body-sm">{votedMsg}</Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* Copiar enlace */}
                      <Button
                        size="sm"
                        variant="plain"
                        startDecorator={<ContentCopyRoundedIcon />}
                        onClick={copyLink}
                        sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}>
                        Copiar enlace
                      </Button>
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Relacionados */}
            <Box sx={{ mt: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ mb: 1 }}>
                <Typography level="title-lg" sx={{ fontWeight: 700 }}>
                  Artículos relacionados
                </Typography>
                <JoyLink href="/admin/help/faqs" level="body-sm">
                  Ver todos
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
                  No hay sugerencias en esta categoría.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {related.map((f) => (
                    <Card
                      key={f.id}
                      variant="plain"
                      component={RouterLink}
                      to={`/admin/help/faqs/${encodeURIComponent(
                        f.slug || f.id
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
                          {f.question}
                        </Typography>
                        {f.category && (
                          <Typography
                            level="body-xs"
                            color="neutral"
                            sx={{ mt: 0.25 }}>
                            {f.category}
                          </Typography>
                        )}
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
              {/* Contáctanos */}
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
                      <JoyLink component="button" onClick={go("/admin/help")}>
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
