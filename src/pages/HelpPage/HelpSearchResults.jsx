import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Sheet,
  Skeleton,
  Button,
} from "@mui/joy";
import HelpSearchBox from "@/components/Help/HelpSearchBox";
import { listFaqs, listTutorials, listChangelogs } from "@/services/help.api";

function stripHtml(s = "") {
  const el = document.createElement("div");
  el.innerHTML = s;
  return (el.textContent || el.innerText || "").trim();
}

export default function HelpSearchResults() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.min(50, Math.max(5, Number(sp.get("limit") || 10)));

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // mezcla de tipos
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      if (!q || q.trim().length < 2) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // pedimos “bastante” y paginamos en front
        const [faqs, tuts, changelogs] = await Promise.all([
          listFaqs({ q, limit: 100, isActive: 1, visibility: "public" }),
          listTutorials({ q, limit: 100, visibility: "public" }),
          listChangelogs({ q, limit: 50, _ts: Date.now() }),
        ]);

        const A = (faqs?.items || []).map((f) => ({
          id: `faq-${f.id}`,
          kind: "FAQ",
          title: f.question,
          meta: [f.category || "General"].filter(Boolean).join(" • "),
          href: `/admin/help/faqs/${encodeURIComponent(f.slug || f.id)}`,
          snippet: stripHtml(f.answer || ""),
          score: (f.question || "").toLowerCase().startsWith(q.toLowerCase())
            ? 1000
            : (f.question || "").toLowerCase().includes(q.toLowerCase())
            ? 800
            : 500,
        }));

        const B = (tuts?.items || []).map((t) => ({
          id: `tut-${t.id}`,
          kind: "Tutorial",
          title: t.title,
          meta: t.category || "Tutorial",
          href: `/admin/help/tutorials/${encodeURIComponent(t.slug || t.id)}`,
          snippet: stripHtml(t.description || ""),
          score: (t.title || "").toLowerCase().startsWith(q.toLowerCase())
            ? 900
            : (t.title || "").toLowerCase().includes(q.toLowerCase())
            ? 700
            : 450,
        }));

        const C = (changelogs?.items || []).map((c) => ({
          id: `cl-${c.id}`,
          kind: "Novedad",
          title: c.title,
          meta: `${c.type} • ${new Date(c.date).toLocaleDateString()}`,
          href: `/admin/help/changelog/${encodeURIComponent(c.slug || c.id)}`,
          snippet: stripHtml(c.description || ""),
          score: (c.title || "").toLowerCase().includes(q.toLowerCase())
            ? 600
            : 300,
        }));

        const merged = [...A, ...B, ...C].sort(
          (a, b) => b.score - a.score || a.title.localeCompare(b.title)
        );

        setItems(merged);
      } catch (e) {
        setError(e?.message || "No se pudo realizar la búsqueda.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [q]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageItems = useMemo(
    () => items.slice(start, start + limit),
    [items, start, limit]
  );

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (!v) next.delete(k);
    else next.set(k, String(v));
    if (k !== "page") next.delete("page");
    setSp(next, { replace: true });
  };

  return (
    <Box
      sx={{
        maxWidth: 980,
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
      }}>
      {/* barra superior con buscador */}
      <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <HelpSearchBox defaultValue={q} />
      </Stack>

      <Typography level="h2" sx={{ fontWeight: 800, mb: 0.25 }}>
        Resultados de búsqueda
      </Typography>
      <Typography level="body-md" color="neutral" sx={{ mb: 2 }}>
        {loading
          ? "Buscando…"
          : `${total} coincidencia${total === 1 ? "" : "s"}`}
      </Typography>

      {loading ? (
        <Stack spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Sheet key={i} variant="plain">
              <Skeleton level="title-sm" width="60%" />
              <Skeleton level="body-sm" width="90%" />
            </Sheet>
          ))}
        </Stack>
      ) : error ? (
        <Sheet variant="soft" color="danger" sx={{ p: 2, borderRadius: "md" }}>
          <Typography>{error}</Typography>
        </Sheet>
      ) : !pageItems.length ? (
        <Typography color="neutral">No hay resultados para “{q}”.</Typography>
      ) : (
        <>
          <Stack spacing={2}>
            {pageItems.map((it, idx) => (
              <Box key={it.id}>
                <Typography
                  component={Link}
                  to={it.href}
                  level="title-sm"
                  sx={{
                    display: "inline-block",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}>
                  {it.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.25, mb: 0.25 }}>
                  <Chip size="sm" variant="soft">
                    {it.kind}
                  </Chip>
                  {it.meta && (
                    <Typography level="body-xs" color="neutral">
                      {it.meta}
                    </Typography>
                  )}
                </Stack>
                {it.snippet && (
                  <Typography level="body-sm" color="neutral">
                    {it.snippet.slice(0, 180)}
                    {it.snippet.length > 180 ? "…" : ""}
                  </Typography>
                )}
                {idx < pageItems.length - 1 && <Divider sx={{ mt: 1.25 }} />}
              </Box>
            ))}
          </Stack>

          {/* paginación estilo simple */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mt: 3 }}>
            <Button
              size="sm"
              variant="plain"
              disabled={page <= 1}
              onClick={() => setParam("page", page - 1)}>
              ‹
            </Button>
            {Array.from({ length: totalPages })
              .slice(0, 8)
              .map((_, i) => {
                const p = i + 1;
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? "solid" : "plain"}
                    onClick={() => setParam("page", p)}>
                    {p}
                  </Button>
                );
              })}
            <Button
              size="sm"
              variant="plain"
              disabled={page >= totalPages}
              onClick={() => setParam("page", page + 1)}>
              ›
            </Button>
          </Stack>

          <Typography
            level="body-xs"
            color="neutral"
            textAlign="center"
            sx={{ mt: 1 }}>
            {start + 1}-{Math.min(start + limit, total)} de {total} resultados
          </Typography>
        </>
      )}
    </Box>
  );
}
