// src/pages/Search/SearchResultsPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Sheet,
  Typography,
  Stack,
  Input,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  Divider,
  Skeleton,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DirectionsCarRounded from "@mui/icons-material/DirectionsCarRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";

import { globalSearch } from "../../services/search.api";
import { useAuth } from "../../context/AuthContext";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function KindIcon({ kind }) {
  const k = String(kind || "").toLowerCase();
  if (k.includes("veh")) return <DirectionsCarRounded fontSize="small" />;
  if (k.includes("asset")) return <Inventory2RoundedIcon fontSize="small" />;
  if (k.includes("company")) return <BusinessRoundedIcon fontSize="small" />;
  if (k.includes("site")) return <PlaceRoundedIcon fontSize="small" />;
  if (k.includes("city")) return <LocationCityIcon fontSize="small" />;
  if (k.includes("country")) return <FlagRoundedIcon fontSize="small" />;
  if (k.includes("parking")) return <LocalParkingIcon fontSize="small" />;
  if (k.includes("reporte") || k.includes("so"))
    return <SummarizeRoundedIcon fontSize="small" />;
  if (k.includes("record")) return <ArticleRoundedIcon fontSize="small" />;
  if (k.includes("faq")) return <HelpCenterIcon fontSize="small" />;
  if (k.includes("tutorial"))
    return <VideoLibraryRoundedIcon fontSize="small" />;
  return <Inventory2RoundedIcon fontSize="small" />;
}

// Convierte prefijos como "asset-12", "veh-5", "faq-7" → { kind, id }
function parsePreviewParams(result) {
  // intenta a partir del id
  const m = String(result?.id || "").match(/^([a-z]+)-(\d+)$/i);
  if (m) {
    const prefix = m[1].toLowerCase();
    const idNum = Number(m[2]);
    return { kind: mapPrefixToKind(prefix), id: idNum };
  }

  // fallback: usar kind + último número en id
  const kind = mapPrefixToKind(String(result?.kind || "").toLowerCase());
  const m2 = String(result?.id || "").match(/(\d+)$/);
  const idNum = m2 ? Number(m2[1]) : null;
  return { kind, id: idNum };
}

// Mapea prefijos/alias del search → kinds que tu /api/preview entiende
function mapPrefixToKind(prefixOrKind) {
  const t = String(prefixOrKind || "").toLowerCase();
  const map = {
    asset: "asset",
    activo: "asset",

    cliente: "company",
    company: "company",

    site: "site",

    bodega: "warehouse",
    warehouse: "warehouse",

    veh: "vehicle",
    vehicle: "vehicle",

    city: "city",
    country: "country",

    park: "parking",
    parking: "parking",

    reg: "record",
    record: "record",

    // sales order
    so: "so",
    reporte: "so",

    faq: "faq",
    tutorial: "tutorial",

    // “soporte” es genérico; no sirve para preview → no lo devolvemos
  };
  return map[t] || t;
}

const KIND_LABEL = {
  asset: "Activos",
  company: "Compañías",
  vehicle: "Vehículos",
  site: "Sites",
  warehouse: "Bodegas",
  city: "Ciudades",
  country: "Países",
  parking: "Estacionamientos",
  record: "Registros",
  reporte: "Reportes / SO",
  soporte: "Soporte",
};

export default function SearchResultsPage() {
  const qParams = useQuery();
  const navigate = useNavigate();
  const { hasPermiso, userData } = useAuth();
  const userRole = userData?.rol;

  const [q, setQ] = useState(qParams.get("q") || "");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [activeKind, setActiveKind] = useState("all");

  const abortRef = useRef();

  const load = async (term) => {
    if (!term || term.trim().length < 2) {
      setItems([]);
      setError(null);
      return;
    }

    // aborta anterior
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await globalSearch(term, {
        limit: 30,
        signal: controller.signal,
      });

      const shaped = (Array.isArray(res) ? res : []).map((r) => ({
        ...r,
        allowed: userRole === "Admin" || !r.perm || hasPermiso(r.perm),
      }));
      setItems(shaped);

      // auto-redirect sólo si hay exacta y única permitida
      const exacts = shaped.filter((r) => r.exact && r.allowed);
      if (exacts.length === 1) {
        const { kind, id } = parsePreviewParams(exacts[0]);
        if (kind && id)
          navigate(`/admin/preview/${encodeURIComponent(kind)}/${id}`);
      }
    } catch (e) {
      // IGNORAR abortos (no mostrar error por abortar)
      if (e?.name === "AbortError" || e?.code === 20) {
        return; // no toques loading/error
      }
      setError(e?.message || "No se pudo cargar búsqueda");
    } finally {
      setLoading(false);
    }
  };

  // inicial + cuando cambia ?q=...
  useEffect(() => {
    const initial = qParams.get("q") || "";
    setQ(initial);
    load(initial);

    // cleanup: aborta si desmonta/cambia antes de terminar
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParams]);

  // agrupación por tipo
  const groups = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const k = it.kind || "otros";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(it);
    }
    const order = [
      "asset",
      "company",
      "vehicle",
      "site",
      "warehouse",
      "city",
      "country",
      "parking",
      "record",
      "reporte",
      "soporte",
    ];
    return Array.from(map.entries()).sort(
      (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
    );
  }, [items]);

  const total = items.length;

  const visibleItems = useMemo(() => {
    if (activeKind === "all") return items;
    return items.filter((i) => i.kind === activeKind);
  }, [activeKind, items]);

  const onSubmit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (term.length >= 2) {
      // cambia la URL, lo que dispara el useEffect y load(term)
      navigate(`/admin/search?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: "1fr",
        }}>
        {/* Header + buscador */}
        <Sheet
          variant="plain"
          sx={{
            p: 2,
            borderRadius: "xl",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            boxShadow: "md",
          }}>
          <Typography level="h3">Búsqueda</Typography>
          <Typography level="body-sm" color="neutral" sx={{ mt: 0.25 }}>
            Escribe un código, serial, placa, nombre, etc. — Enter para buscar.
          </Typography>

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1.5 }}>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              startDecorator={<SearchRoundedIcon />}
              size="lg"
              placeholder="Ej: IMP-001-…  |  LJ452dn  |  ABC1234"
              sx={{
                "--Input-radius": "999px",
                "--Input-minHeight": "54px",
                bgcolor: "background.body",
              }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1.25, flexWrap: "wrap" }}>
            <Chip
              variant={activeKind === "all" ? "solid" : "soft"}
              onClick={() => setActiveKind("all")}>
              Todos ({total})
            </Chip>
            {groups.map(([k, arr]) => (
              <Chip
                key={k}
                variant={activeKind === k ? "solid" : "soft"}
                onClick={() => setActiveKind(k)}
                startDecorator={<KindIcon kind={k} />}>
                {KIND_LABEL[k] || k} ({arr.length})
              </Chip>
            ))}
          </Stack>
        </Sheet>

        {/* Resultados */}
        <Card
          variant="plain"
          sx={{
            borderRadius: "xl",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            boxShadow: "md",
          }}>
          <CardContent sx={{ p: 2 }}>
            {loading ? (
              <Stack spacing={1}>
                {[...Array(6)].map((_, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={1.25}
                    alignItems="center">
                    <Skeleton variant="circular" width={28} height={28} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton level="title-sm" width="50%" />
                      <Skeleton level="body-sm" width="30%" />
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
            ) : visibleItems.length === 0 ? (
              <Typography color="neutral">
                Sin resultados para “{q}”.
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {visibleItems.map((r, idx) => {
                  const disabled = !r.allowed;
                  return (
                    <ListItem key={r.id || idx} sx={{ p: 0 }}>
                      <ListItemButton
                        onClick={() => {
                          if (disabled) return;
                          const { kind, id } = parsePreviewParams(r);
                          if (kind && id) {
                            navigate(
                              `/admin/preview/${encodeURIComponent(kind)}/${id}`
                            );
                          }
                        }}
                        disabled={disabled}
                        sx={{
                          borderRadius: "md",
                          my: 0.25,
                          "&[aria-disabled='true']": {
                            opacity: 0.5,
                            cursor: "not-allowed",
                          },
                        }}>
                        <ListItemDecorator>
                          {disabled ? (
                            <LockRoundedIcon fontSize="small" />
                          ) : (
                            <KindIcon kind={r.kind} />
                          )}
                        </ListItemDecorator>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center">
                            <Typography level="title-sm" noWrap>
                              {r.title}
                            </Typography>
                            {r.exact && (
                              <Chip size="sm" color="success" variant="soft">
                                exacto
                              </Chip>
                            )}
                          </Stack>
                          {r.subtitle && (
                            <Typography level="body-xs" color="neutral" noWrap>
                              {r.subtitle}
                            </Typography>
                          )}
                        </Box>
                        <Chip size="sm" variant="soft">
                          {KIND_LABEL[r.kind] || r.kind}
                        </Chip>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
