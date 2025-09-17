// src/pages/HelpPage/HelpTutorialDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/joy";
import { getTutorialBySlug } from "../../services/help.api";

export default function HelpTutorialDetail() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [tut, setTut] = useState(null);
  const [error, setError] = useState(null);

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
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      {loading ? (
        <>
          <Skeleton level="h3" />
          <Skeleton level="body-sm" />
        </>
      ) : error ? (
        <Sheet variant="soft" color="danger" sx={{ p: 2, borderRadius: "md" }}>
          <Typography>{error}</Typography>
        </Sheet>
      ) : (
        <>
          <Typography level="h3">{tut?.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            {tut?.category && (
              <Chip size="sm" variant="soft">
                {tut.category}
              </Chip>
            )}
            {tut?.duration_seconds && (
              <Chip size="sm" variant="soft" color="neutral">
                {Math.round(tut.duration_seconds / 60)} min
              </Chip>
            )}
          </Stack>

          {tut?.videoUrl && (
            <Box sx={{ mt: 1.5 }}>
              <JoyLink href={tut.videoUrl} target="_blank" rel="noreferrer">
                Abrir video
              </JoyLink>
            </Box>
          )}

          {tut?.description && (
            <Typography
              level="body-lg"
              sx={{ mt: 1.25, whiteSpace: "pre-wrap" }}>
              {tut.description}
            </Typography>
          )}

          {/* Pasos (si el API los envía) */}
          {Array.isArray(tut?.steps) && tut.steps.length > 0 && (
            <Stack spacing={1.25} sx={{ mt: 2 }}>
              {tut.steps.map((s) => (
                <Card key={s.id} variant="outlined">
                  <CardContent>
                    <Typography level="title-sm">
                      Paso {s.step_no}: {s.title || ""}
                    </Typography>
                    {s.body && (
                      <Typography
                        level="body-sm"
                        sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                        {s.body}
                      </Typography>
                    )}
                    {s.imageUrl && (
                      <Box
                        component="img"
                        src={s.imageUrl}
                        alt={s.title || ""}
                        sx={{ mt: 1, maxWidth: "100%", borderRadius: "md" }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          {/* Adjuntos (si llegan) */}
          {Array.isArray(tut?.attachments) && tut.attachments.length > 0 && (
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Typography level="title-sm">Archivos</Typography>
              {tut.attachments.map((a) => (
                <JoyLink
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer">
                  {a.name}
                </JoyLink>
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
