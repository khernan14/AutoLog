// src/pages/HelpPage/HelpFaqsList.jsx
import { useEffect, useMemo, useState } from "react";
import {
  useSearchParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";
import {
  Box,
  Sheet,
  Stack,
  Typography,
  Input,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Link as JoyLink,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { listFaqs } from "@/services/help.api";
import PaginationLite from "@/components/common/PaginationLite.jsx";

/* utils */
function stripHtml(s = "") {
  const el = document.createElement("div");
  el.innerHTML = s;
  return (el.textContent || el.innerText || "").trim();
}

export default function HelpFaqsList() {
  const [sp, setSp] = useSearchParams();

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.min(48, Math.max(6, Number(sp.get("limit") || 12)));
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

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

  const go = (to) => (e) => {
    e?.preventDefault?.();
    navigate(to);
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const categories = useMemo(() => {
    const set = new Set();
    (items || []).forEach((f) => f.category && set.add(f.category));
    return Array.from(set).slice(0, 10);
  }, [items]);

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
      {/* HERO */}
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
              Preguntas frecuentes
            </Typography>

            <form
              onSubmit={onSearch}
              style={{ display: "flex", gap: 8, maxWidth: 720 }}>
              <Input
                name="q"
                defaultValue={q}
                placeholder="Busca artículos…"
                startDecorator={<SearchRoundedIcon />}
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

            {/* Chips de categorías (puedes quitar este bloque si no quieres filtros) */}
            {/* <Stack
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
            </Stack> */}
          </Stack>
        </Box>
      </Sheet>

      {/* GRID de tarjetas sin icono ni subtítulo de categoría */}
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, mt: 3 }}>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: limit }).map((_, i) => (
              <Grid key={i} xs={12} sm={6} md={4} lg={3}>
                <Card
                  variant="plain"
                  sx={{
                    border: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    borderRadius: "xl",
                    boxShadow: "xs",
                    height: "100%",
                  }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Skeleton level="title-sm" width="90%" />
                    <Skeleton level="body-sm" width="100%" sx={{ mt: 0.75 }} />
                    <Skeleton level="body-sm" width="75%" sx={{ mt: 0.5 }} />
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
              {items.map((f) => (
                <Grid key={f.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    variant="plain"
                    sx={{
                      border: "1px solid",
                      borderColor: "neutral.outlinedBorder",
                      borderRadius: "xl",
                      boxShadow: "xs",
                      height: "100%",
                      transition:
                        "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "md",
                        borderColor: "neutral.outlinedHoverBorder",
                      },
                    }}>
                    <CardContent
                      sx={{
                        p: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}>
                      <Typography
                        level="title-sm"
                        component={JoyLink}
                        onClick={go(
                          `/admin/help/faqs/${encodeURIComponent(
                            f.slug || f.id
                          )}`
                        )}
                        sx={{
                          textDecoration: "none",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          "&:hover": { textDecoration: "underline" },
                        }}>
                        {f.question}
                      </Typography>

                      {f.answer && (
                        <Typography
                          level="body-sm"
                          color="neutral"
                          sx={{
                            mt: 0.75,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 60,
                          }}>
                          {stripHtml(f.answer)}
                        </Typography>
                      )}

                      <Box sx={{ mt: "auto" }}>
                        <JoyLink
                          component="button"
                          onClick={go(
                            `/admin/help/faqs/${encodeURIComponent(
                              f.slug || f.id
                            )}`
                          )}
                          sx={{
                            mt: 0.75,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}>
                          Ver detalle
                        </JoyLink>
                      </Box>
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
      </Box>
    </Box>
  );
}
