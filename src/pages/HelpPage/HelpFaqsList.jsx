// src/pages/HelpPage/HelpFaqsList.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Input,
  Button,
  Chip,
  Card,
  CardContent,
  Sheet,
  Skeleton,
} from "@mui/joy";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { listFaqs } from "../../services/help.api";
import PaginationLite from "@/components/common/PaginationLite.jsx";

export default function HelpFaqsList() {
  const [sp, setSp] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 24);
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listFaqs({
          q,
          category,
          page,
          limit,
          isActive: 1,
          visibility: "public",
        });
        setItems(res?.items || []);
        setTotal(res?.total || 0);
      } catch (e) {
        setError(e?.message || "No se pudieron cargar las FAQs.");
      } finally {
        setLoading(false);
      }
    })();
  }, [q, category, page, limit]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page"); // reset page
    setSp(next, { replace: true });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h3">Preguntas frecuentes</Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", e.target.q.value);
          }}>
          <Input
            name="q"
            placeholder="Buscar artículos…"
            defaultValue={q}
            startDecorator={<SearchRoundedIcon />}
            sx={{ minWidth: 280 }}
          />
        </form>
        {category && (
          <Chip variant="soft" onDelete={() => setParam("category", "")}>
            Categoría: {category}
          </Chip>
        )}
      </Stack>

      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Stack spacing={1}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Skeleton level="title-sm" />
                  <Skeleton level="body-sm" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : error ? (
          <Sheet
            variant="soft"
            color="danger"
            sx={{ p: 2, borderRadius: "md" }}>
            <Typography>{error}</Typography>
          </Sheet>
        ) : items.length === 0 ? (
          <Typography color="neutral">No hay resultados.</Typography>
        ) : (
          <>
            <Stack spacing={1.25}>
              {items.map((f) => (
                <Card key={f.id} variant="outlined">
                  <CardContent>
                    <Typography
                      component={Link}
                      to={`/admin/help/faqs/${encodeURIComponent(
                        f.slug || f.id
                      )}`}
                      level="title-sm">
                      {f.question}
                    </Typography>
                    <Typography
                      level="body-sm"
                      color="neutral"
                      sx={{ mt: 0.5 }}>
                      {f.category || "General"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
              <PaginationLite
                page={page}
                count={totalPages}
                onChange={(p) => setParam("page", String(p))} // o setPage(p)
                siblingCount={1}
                boundaryCount={1}
                showFirstLast={false} // en móvil queda más limpio
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
