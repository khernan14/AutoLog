// src/pages/HelpPage/HelpChangelogList.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Select,
  Option,
  Grid,
  Card,
  CardContent,
  Sheet,
  Skeleton,
} from "@mui/joy";
import { listChangelogs } from "../../services/help.api";
import PaginationLite from "../../components/common/PaginationLite";

export default function HelpChangelogList() {
  const [sp, setSp] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const page = Number(sp.get("page") || 1);
  const limit = Number(sp.get("limit") || 10);
  const type = sp.get("type") || "";
  const audience = sp.get("audience") || "";
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listChangelogs({ page, limit, type, audience });
        setItems(res?.items || []);
        setTotal(res?.total || 0);
      } catch (e) {
        setError(e?.message || "No se pudieron cargar las novedades.");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, type, audience]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    setSp(next, { replace: true });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography level="h3">Novedades y anuncios</Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
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
          <Typography color="neutral">No hay novedades.</Typography>
        ) : (
          <>
            <Stack spacing={1.25}>
              {items.map((c) => (
                <Card
                  key={c.id}
                  variant="outlined"
                  component={Link}
                  to={`/admin/help/changelog/${encodeURIComponent(
                    c.slug || c.id
                  )}`}>
                  <CardContent>
                    <Typography level="title-sm">{c.title}</Typography>
                    <Typography
                      level="body-xs"
                      color="neutral"
                      sx={{ mt: 0.25 }}>
                      {c.date ? new Date(c.date).toLocaleDateString() : ""} •{" "}
                      {c.type}
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
