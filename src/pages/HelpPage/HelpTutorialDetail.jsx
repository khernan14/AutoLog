// src/pages/HelpPage/HelpTutorialDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Sheet,
  Skeleton,
  Card,
  CardContent,
  Link as JoyLink,
  AspectRatio,
  Divider,
  Button,
} from "@mui/joy";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import { getTutorialBySlug } from "@/services/help.api";

/* Helpers */
function minutesFromSeconds(s) {
  const n = Number(s || 0);
  if (!n) return null;
  return Math.max(1, Math.round(n / 60));
}
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
function isYouTube(url = "") {
  return /youtu\.be|youtube\.com/i.test(url);
}
function isVimeo(url = "") {
  return /vimeo\.com/i.test(url);
}
function toYouTubeEmbed(url) {
  try {
    // soporta youtu.be/<id> o youtube.com/watch?v=<id>
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
    }
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}
function toVimeoEmbed(url) {
  try {
    const u = new URL(url);
    const id = u.pathname.split("/").filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}` : url;
  } catch {
    return url;
  }
}

export default function HelpTutorialDetail() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [tut, setTut] = useState(null);
  const [error, setError] = useState(null);

  const durationMin = useMemo(
    () => minutesFromSeconds(tut?.duration_seconds),
    [tut?.duration_seconds]
  );

  const canEmbed = useMemo(() => {
    if (!tut?.videoUrl) return false;
    return isYouTube(tut.videoUrl) || isVimeo(tut.videoUrl);
  }, [tut?.videoUrl]);

  const embedSrc = useMemo(() => {
    if (!tut?.videoUrl) return null;
    if (isYouTube(tut.videoUrl)) return toYouTubeEmbed(tut.videoUrl);
    if (isVimeo(tut.videoUrl)) return toVimeoEmbed(tut.videoUrl);
    return null;
  }, [tut?.videoUrl]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const t = await getTutorialBySlug(slug);
        setTut(t);
      } catch (e) {
        setError(e?.message || "No se pudo cargar el tutorial.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Encabezado / breadcrumb */}
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
          <Stack spacing={1.5}>
            <Button
              size="sm"
              variant="plain"
              component={RouterLink}
              to="/admin/help/tutorials"
              startDecorator={<ArrowBackRoundedIcon />}
              sx={{ alignSelf: "flex-start" }}>
              Volver a tutoriales
            </Button>

            {loading ? (
              <>
                <Skeleton level="h2" width="60%" />
                <Stack direction="row" spacing={1}>
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={28}
                    sx={{ borderRadius: 999 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={80}
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
                  sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800 }}>
                  {tut?.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ flexWrap: "wrap" }}>
                  {tut?.category && <Chip variant="soft">{tut.category}</Chip>}
                  {durationMin && (
                    <Chip
                      variant="soft"
                      color="neutral"
                      startDecorator={<AccessTimeRoundedIcon />}>
                      {durationMin} min
                    </Chip>
                  )}
                  {tut?.published_at && (
                    <Chip size="sm" variant="soft" color="neutral">
                      Publicado: {fmtDate(tut.published_at)}
                    </Chip>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Sheet>

      {/* Media + Layout 2 columnas */}
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, mt: 3 }}>
        {/* Portada (video embed o imagen) */}
        <Card
          variant="plain"
          sx={{
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "xl",
            overflow: "hidden",
            boxShadow: "sm",
          }}>
          <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{ borderRadius: "md" }}
              />
            ) : tut?.imageUrl || canEmbed ? (
              <AspectRatio
                ratio={16 / 9}
                sx={{ borderRadius: "md", overflow: "hidden" }}>
                {canEmbed ? (
                  <iframe
                    src={embedSrc}
                    title={tut?.title || "video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0, width: "100%", height: "100%" }}
                  />
                ) : (
                  <img
                    src={tut?.imageUrl}
                    alt={tut?.title || "cover"}
                    loading="lazy"
                  />
                )}
              </AspectRatio>
            ) : (
              <Sheet
                variant="soft"
                sx={{
                  height: 220,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "md",
                }}>
                <PlayCircleOutlineRoundedIcon />
                <Typography level="body-sm" color="neutral">
                  Sin portada
                </Typography>
              </Sheet>
            )}
          </CardContent>
        </Card>

        {/* Grid de contenido */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 2, lg: 3 }}
          sx={{ mt: 2 }}>
          {/* Columna principal */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card
              variant="plain"
              sx={{
                border: "1px solid",
                borderColor: "neutral.outlinedBorder",
                borderRadius: "xl",
                boxShadow: "sm",
                height: "100%",
              }}>
              <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
                {loading ? (
                  <>
                    <Skeleton level="title-md" width="40%" />
                    <Skeleton level="body-md" />
                    <Skeleton level="body-md" width="95%" />
                    <Skeleton level="body-md" width="80%" />
                  </>
                ) : (
                  <>
                    {tut?.description && (
                      <>
                        <Typography level="title-md">Descripción</Typography>
                        <Typography
                          level="body-md"
                          sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                          {tut.description}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                      </>
                    )}

                    {/* Pasos */}
                    {Array.isArray(tut?.steps) && tut.steps.length > 0 ? (
                      <>
                        <Typography
                          level="title-md"
                          startDecorator={<ChecklistRoundedIcon />}>
                          Pasos
                        </Typography>
                        <Stack spacing={1.25} sx={{ mt: 1 }}>
                          {tut.steps
                            .sort((a, b) => (a.step_no || 0) - (b.step_no || 0))
                            .map((s, idx) => (
                              <Card
                                key={s.id || idx}
                                variant="soft"
                                sx={{
                                  borderRadius: "lg",
                                  border: "1px solid",
                                  borderColor: "neutral.outlinedBorder",
                                  bgcolor: "background.body",
                                }}>
                                <CardContent sx={{ p: 1.5 }}>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center">
                                    <Chip
                                      size="sm"
                                      variant="solid"
                                      color="primary"
                                      sx={{ borderRadius: "999px" }}>
                                      Paso {s.step_no ?? idx + 1}
                                    </Chip>
                                    <Typography level="title-sm">
                                      {s.title ||
                                        `Paso ${s.step_no ?? idx + 1}`}
                                    </Typography>
                                  </Stack>

                                  {s.body && (
                                    <Typography
                                      level="body-sm"
                                      sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                                      {s.body}
                                    </Typography>
                                  )}

                                  {s.imageUrl && (
                                    <AspectRatio
                                      ratio={16 / 9}
                                      sx={{ mt: 1, borderRadius: "md" }}>
                                      <img
                                        src={s.imageUrl}
                                        alt={s.title || ""}
                                        loading="lazy"
                                      />
                                    </AspectRatio>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                        </Stack>
                      </>
                    ) : (
                      <Typography level="body-sm" color="neutral">
                        Este tutorial no incluye pasos detallados.
                      </Typography>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0 }}>
            <Stack spacing={2}>
              {/* CTA / Acciones */}
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
                    {tut?.videoUrl && (
                      <Button
                        fullWidth
                        component="a"
                        href={tut.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        startDecorator={<PlayCircleOutlineRoundedIcon />}
                        sx={{ borderRadius: "999px" }}>
                        Abrir video
                      </Button>
                    )}
                    {tut?.source_url && (
                      <Button
                        fullWidth
                        variant="soft"
                        component="a"
                        href={tut.source_url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ borderRadius: "999px" }}>
                        Ver fuente
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Metadatos */}
              <Card
                variant="plain"
                sx={{
                  border: "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  borderRadius: "xl",
                  boxShadow: "sm",
                }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography level="title-sm">Información</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.5}>
                    {tut?.category && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FolderOpenRoundedIcon fontSize="sm" />
                        <Typography level="body-sm">{tut.category}</Typography>
                      </Stack>
                    )}
                    {durationMin && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeRoundedIcon fontSize="sm" />
                        <Typography level="body-sm">
                          {durationMin} min
                        </Typography>
                      </Stack>
                    )}
                    {tut?.published_at && (
                      <Typography level="body-sm" color="neutral">
                        Publicado: {fmtDate(tut.published_at)}
                      </Typography>
                    )}
                    {tut?.updated_at && (
                      <Typography level="body-sm" color="neutral">
                        Actualizado: {fmtDate(tut.updated_at)}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Adjuntos */}
              {Array.isArray(tut?.attachments) &&
                tut.attachments.length > 0 && (
                  <Card
                    variant="plain"
                    sx={{
                      border: "1px solid",
                      borderColor: "neutral.outlinedBorder",
                      borderRadius: "xl",
                      boxShadow: "sm",
                    }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography level="title-sm">Archivos</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Stack spacing={0.75}>
                        {tut.attachments.map((a) => (
                          <JoyLink
                            key={a.id}
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            startDecorator={<DownloadRoundedIcon />}>
                            {a.name || a.url}
                          </JoyLink>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
