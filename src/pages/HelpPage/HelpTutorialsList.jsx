// src/pages/HelpPage/HelpTutorialsList.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Input,
  Grid,
  Card,
  CardContent,
  Chip,
  Sheet,
  Skeleton,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { listTutorials } from "../../services/help.api";
import PaginationLite from "@/components/common/PaginationLite.jsx";

export default function HelpTutorialsList() {
  const [sp, setSp] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 12);
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listTutorials({
          q,
          category,
          page,
          limit,
          visibility: "public",
        });
        setItems(res?.items || []);
        setTotal(res?.total || 0);
      } catch (e) {
        setError(e?.message || "No se pudieron cargar los tutoriales.");
      } finally {
        setLoading(false);
      }
    })();
  }, [q, category, page, limit]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    setSp(next, { replace: true });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h3">Tutoriales y guías</Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", e.target.q.value);
          }}>
          <Input
            name="q"
            placeholder="Buscar tutoriales…"
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
          <Grid container spacing={1.25}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Skeleton level="title-sm" />
                    <Skeleton variant="rectangular" height={100} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            <Grid container spacing={1.25}>
              {items.map((t) => (
                <Grid key={t.id} xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    component={Link}
                    to={`/admin/help/tutorials/${encodeURIComponent(
                      t.slug || t.id
                    )}`}>
                    <CardContent>
                      <Typography level="title-sm">{t.title}</Typography>
                      <Typography
                        level="body-sm"
                        color="neutral"
                        sx={{ mt: 0.5 }}>
                        {t.category || "General"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

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
