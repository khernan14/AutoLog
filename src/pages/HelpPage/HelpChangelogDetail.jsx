// src/pages/HelpPage/HelpChangelogDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Sheet, Skeleton, Chip, Stack } from "@mui/joy";
import { getChangelogBySlug } from "../../services/help.api";

export default function HelpChangelogDetail() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const c = await getChangelogBySlug(slug);
        setItem(c);
      } catch (e) {
        setError(e?.message || "No se pudo cargar la novedad.");
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
          <Skeleton level="body-lg" />
        </>
      ) : error ? (
        <Sheet variant="soft" color="danger" sx={{ p: 2, borderRadius: "md" }}>
          <Typography>{error}</Typography>
        </Sheet>
      ) : (
        <>
          <Typography level="h3">{item?.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
            <Chip size="sm" variant="soft">
              {item?.type}
            </Chip>
            {item?.date && (
              <Chip size="sm" variant="plain" color="neutral">
                {new Date(item.date).toLocaleDateString()}
              </Chip>
            )}
          </Stack>
          {item?.description && (
            <Typography
              level="body-lg"
              sx={{ mt: 1.25, whiteSpace: "pre-wrap" }}>
              {item.description}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
