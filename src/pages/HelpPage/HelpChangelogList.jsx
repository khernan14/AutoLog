// src/pages/HelpPage/HelpChangelogList.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Select,
  Option,
  Chip,
  Sheet,
  Skeleton,
  Divider,
  Button,
} from "@mui/joy";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import { listChangelogs } from "@/services/help.api";
import PaginationLite from "@/components/common/PaginationLite.jsx";

/* Mapa de colores por tipo */
const TYPE_COLOR = {
  Added: "success",
  Changed: "warning",
  Fixed: "primary",
  Removed: "neutral",
  Deprecated: "neutral",
  Security: "danger",
  Performance: "success",
};

const dotBg = (type) =>
  TYPE_COLOR[type] ? `${TYPE_COLOR[type]}.solidBg` : "neutral.solidBg";

/* Fecha corta */
function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d || "");
  }
}

export default function HelpChangelogList() {
  const [sp, setSp] = useSearchParams();

  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.min(30, Math.max(6, Number(sp.get("limit") || 12)));
  const type = sp.get("type") || "";
  const audience = sp.get("audience") || "";
  const pinnedOnly = sp.get("pinned") === "1";

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listChangelogs({
          page,
          limit,
          type: type || undefined,
          audience: audience || undefined,
          pinned: pinnedOnly ? 1 : undefined,
          _ts: Date.now(),
        });
        setItems(res?.items || []);
        setTotal(res?.total || 0);
      } catch (e) {
        setError(e?.message || "No se pudieron cargar las novedades.");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, type, audience, pinnedOnly]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (v === "" || v === undefined || v === null) next.delete(k);
    else next.set(k, String(v));
    if (k !== "page") next.delete("page");
    setSp(next, { replace: true });
  };

  const handleTogglePinned = () => {
    setParam("pinned", pinnedOnly ? "" : "1");
  };

  const filtersActive = useMemo(
    () => Boolean(type || audience || pinnedOnly),
    [type, audience, pinnedOnly]
  );

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
            py: { xs: 4, md: 5 },
          }}>
          <Stack spacing={2}>
            <Typography
              level="h1"
              sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 800 }}>
              Novedades y anuncios
            </Typography>

            {/* Filtros */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ flexWrap: "wrap" }}>
              <Select
                placeholder="Tipo"
                value={type || null}
                onChange={(_, v) => setParam("type", v || "")}
                sx={{ minWidth: 180 }}>
                <Option value="">Todos</Option>
                <Option value="Added">Added</Option>
                <Option value="Changed">Changed</Option>
                <Option value="Fixed">Fixed</Option>
                <Option value="Removed">Removed</Option>
                <Option value="Deprecated">Deprecated</Option>
                <Option value="Security">Security</Option>
                <Option value="Performance">Performance</Option>
              </Select>

              <Select
                placeholder="Audiencia"
                value={audience || null}
                onChange={(_, v) => setParam("audience", v || "")}
                sx={{ minWidth: 180 }}>
                <Option value="">Todos</Option>
                <Option value="all">Todos</Option>
                <Option value="admins">Admins</Option>
                <Option value="customers">Clientes</Option>
                <Option value="internal">Interno</Option>
              </Select>

              <Chip
                variant={pinnedOnly ? "solid" : "soft"}
                color={pinnedOnly ? "success" : "neutral"}
                onClick={handleTogglePinned}
                startDecorator={<PushPinRoundedIcon fontSize="sm" />}
                sx={{ borderRadius: "999px", cursor: "pointer" }}>
                {pinnedOnly ? "Solo fijados" : "Incluir fijados"}
              </Chip>

              {filtersActive && (
                <Button
                  size="sm"
                  variant="plain"
                  onClick={() => {
                    const next = new URLSearchParams();
                    next.set("page", "1");
                    setSp(next, { replace: true });
                  }}>
                  Limpiar filtros
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Sheet>

      {/* Lista estilo timeline */}
      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, mt: 3 }}>
        {loading ? (
          <Stack spacing={2}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1.25}
                alignItems="flex-start">
                <Skeleton
                  variant="circular"
                  width={10}
                  height={10}
                  sx={{ mt: "7px" }}
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton level="title-sm" width="60%" />
                  <Skeleton level="body-xs" width="30%" />
                  <Skeleton level="body-sm" width="90%" />
                </Box>
              </Stack>
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
          <Typography color="neutral">No hay novedades.</Typography>
        ) : (
          <>
            <Stack spacing={1.5}>
              {items.map((c, idx) => (
                <Box key={c.id}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "99px",
                        mt: "7px",
                        bgcolor: dotBg(c.type),
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          component={Link}
                          to={`/admin/help/changelog/${encodeURIComponent(
                            c.slug || c.id
                          )}`}
                          level="title-sm"
                          sx={{
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}>
                          {c.title}
                        </Typography>
                        {c.pinned ? (
                          <Chip
                            size="sm"
                            variant="soft"
                            color="success"
                            startDecorator={
                              <PushPinRoundedIcon fontSize="sm" />
                            }>
                            Fijado
                          </Chip>
                        ) : null}
                      </Stack>

                      <Typography
                        level="body-xs"
                        color="neutral"
                        sx={{ mt: 0.25 }}>
                        {c.date ? fmtDate(c.date) : ""} • {c.type}
                        {c.audience ? ` • ${c.audience}` : ""}
                      </Typography>

                      {c.description ? (
                        <Typography level="body-sm" sx={{ mt: 0.5 }}>
                          {c.description}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>

                  {idx < items.length - 1 && <Divider sx={{ mt: 1.25 }} />}
                </Box>
              ))}
            </Stack>

            {/* Paginación */}
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
