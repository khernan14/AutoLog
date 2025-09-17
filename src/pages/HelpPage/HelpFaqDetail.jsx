// src/pages/HelpPage/HelpFaqDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Sheet,
  Skeleton,
} from "@mui/joy";
import { getFaqBySlug, voteFaqHelpful } from "../../services/help.api";

export default function HelpFaqDetail() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [faq, setFaq] = useState(null);
  const [error, setError] = useState(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const f = await getFaqBySlug(slug);
        setFaq(f);
      } catch (e) {
        setError(e?.message || "No se pudo cargar la FAQ.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const vote = async (up) => {
    if (!faq || voted) return;
    try {
      await voteFaqHelpful(faq.id, { up });
      setVoted(true);
    } catch {}
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      {loading ? (
        <>
          <Skeleton level="h3" />
          <Skeleton level="body-lg" />
        </>
      ) : error ? (
        <Sheet variant="soft" color="danger" sx={{ p: 2, borderRadius: "md" }}>
          <Typography>{error}</Typography>
        </Sheet>
      ) : (
        <>
          <Typography level="h3">{faq?.question}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            <Chip size="sm" variant="soft">
              {faq?.category || "General"}
            </Chip>
          </Stack>
          <Typography level="body-lg" sx={{ mt: 1.25, whiteSpace: "pre-wrap" }}>
            {faq?.answer}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              size="sm"
              variant="soft"
              disabled={voted}
              onClick={() => vote(true)}>
              ¿Te resultó útil? Sí
            </Button>
            <Button
              size="sm"
              variant="plain"
              disabled={voted}
              onClick={() => vote(false)}>
              No
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
