// src/pages/HelpPage/HelpTutorialsList.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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
  AspectRatio,
  Divider,
  Button,
  Link as JoyLink,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { listTutorials } from "@/services/help.api";
import PaginationLite from "@/components/common/PaginationLite.jsx";

function stripHtml(s = "") {
  const el = document.createElement("div");
  el.innerHTML = s;
  return (el.textContent || el.innerText || "").trim();
}

export default function HelpTutorialsList() {
  const [sp, setSp] = useSearchParams();

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.min(24, Math.max(6, Number(sp.get("limit") || 12)));

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // cargar
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

  // categorías (a partir de lo que trae el backend en esta página)
  const categories = useMemo(() => {
    const s = new Set();
    (items || []).forEach((t) => t.category && s.add(t.category));
    return Array.from(s).slice(0, 12);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (!v) next.delete(k);
    else next.set(k, String(v));
    if (k !== "page") next.delete("page");
    setSp(next, { replace: true });
  };

  const onSearch = (e) => {
    e.preventDefault();
    const v = e.target.q.value.trim();
    setParam("q", v);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* HERO / barra superior */}
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
            py: { xs: 4, md: 5 },
          }}>
          <Stack spacing={2}>
            <Typography
              level="h1"
              sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800 }}>
              Tutoriales y guías
            </Typography>

            <form
              onSubmit={onSearch}
              style={{ display: "flex", gap: 8, maxWidth: 720 }}>
              <Input
                name="q"
                defaultValue={q}
                startDecorator={<SearchRoundedIcon />}
                placeholder="Busca tutoriales…"
                size="lg"
                sx={{
                  "--Input-radius": "999px",
                  "--Input-minHeight": "52px",
                  flex: 1,
                  bgcolor: "background.body",
                }}
              />
              <Button
                type="submit"
                size="lg"
                sx={{ borderRadius: "999px", minWidth: 56 }}>
                <SearchRoundedIcon />
              </Button>
            </form>

            {/* filtros rápidos */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", mt: 0.5 }}>
              {category && (
                <Chip
                  variant="soft"
                  onDelete={() => setParam("category", "")}
                  sx={{ borderRadius: "999px" }}>
                  Categoría: {category}
                </Chip>
              )}
              {categories.map((c) => (
                <Chip
                  key={c}
                  variant="soft"
                  onClick={() => setParam("category", c)}
                  sx={{ borderRadius: "999px" }}>
                  {c}
                </Chip>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Sheet>

      {/* LISTA */}
      <Box
        sx={{
          maxWidth: 1120,
          mx: "auto",
          px: { xs: 2, md: 3 },
          mt: 3,
        }}>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: limit }).map((_, i) => (
              <Grid key={i} xs={12} sm={6} md={4}>
                <Card
                  variant="plain"
                  sx={{
                    border: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    borderRadius: "xl",
                    boxShadow: "sm",
                    height: "100%",
                  }}>
                  <CardContent>
                    <AspectRatio ratio={16 / 9} sx={{ borderRadius: "md" }}>
                      <Skeleton variant="overlay" />
                    </AspectRatio>
                    <Skeleton level="title-sm" sx={{ mt: 1 }} />
                    <Skeleton level="body-sm" width="80%" />
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
            <Grid container spacing={2}>
              {items.map((t) => (
                <Grid key={t.id} xs={12} sm={6} md={4}>
                  <Card
                    component={Link}
                    to={`/admin/help/tutorials/${encodeURIComponent(
                      t.slug || t.id
                    )}`}
                    variant="plain"
                    sx={{
                      border: "1px solid",
                      borderColor: "neutral.outlinedBorder",
                      borderRadius: "xl",
                      boxShadow: "sm",
                      height: "100%",
                      textDecoration: "none",
                      transition:
                        "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "md",
                        borderColor: "neutral.outlinedHoverBorder",
                      },
                    }}>
                    <CardContent>
                      <AspectRatio
                        ratio={16 / 9}
                        sx={{
                          borderRadius: "md",
                          overflow: "hidden",
                          mb: 1,
                        }}>
                        <img
                          src={
                            t.imageUrl ||
                            "https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop"
                          }
                          alt={t.title}
                          loading="lazy"
                        />
                      </AspectRatio>

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

                      {t.description && (
                        <Typography
                          level="body-sm"
                          color="neutral"
                          sx={{
                            mt: 0.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}>
                          {stripHtml(t.description)}
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                        {t.category && <Chip size="sm">{t.category}</Chip>}
                        {t.duration_seconds ? (
                          <Chip size="sm" variant="soft" color="neutral">
                            {Math.round(t.duration_seconds / 60)} min
                          </Chip>
                        ) : null}
                      </Stack>

                      <JoyLink
                        level="body-sm"
                        sx={{ mt: 0.75, display: "inline-flex", gap: 0.5 }}>
                        <PlayCircleOutlineRoundedIcon fontSize="sm" />
                        Ver tutorial
                      </JoyLink>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* paginación */}
            <Stack alignItems="center" sx={{ mt: 2 }}>
              <PaginationLite
                page={page}
                count={totalPages}
                onChange={(p) => setParam("page", String(p))}
                siblingCount={1}
                boundaryCount={1}
                showFirstLast={false}
              />
              <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                Página {page} de {totalPages}
              </Typography>
            </Stack>
          </>
        )}

        <Divider sx={{ mt: 3 }} />
      </Box>
    </Box>
  );
}
