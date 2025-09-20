// src/pages/Search/EntityPreviewPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Sheet,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  Skeleton,
  Card,
  CardContent,
} from "@mui/joy";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import { getPreview } from "@/services/search.api";
import { useAuth } from "@/context/AuthContext";

const KIND_LABEL = {
  asset: "Activo",
  company: "Compañía",
  site: "Site",
  warehouse: "Bodega",
  vehicle: "Vehículo",
  city: "Ciudad",
  country: "País",
  parking: "Estacionamiento",
  record: "Registro",
  reporte: "Reporte",
  soporte: "Soporte",
};

export default function EntityPreviewPage() {
  const { kind, id } = useParams(); // /admin/preview/:kind/:id
  const navigate = useNavigate();
  const { hasPermiso, userData } = useAuth();
  const userRole = userData?.rol;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef();

  useEffect(() => {
    (async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await getPreview(kind, id, { signal: controller.signal });
        setData(res);
      } catch (e) {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [kind, id]);

  const canOpenModule =
    !!data?.moduleUrl &&
    (userRole === "Admin" ||
      !data?.perm ||
      hasPermiso?.(data.perm) ||
      data?.canEdit);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Button
            size="sm"
            variant="plain"
            startDecorator={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}>
            Volver
          </Button>
          {data?.kind && (
            <Chip variant="soft">{KIND_LABEL[data.kind] || data.kind}</Chip>
          )}
        </Stack>

        <Card
          variant="plain"
          sx={{
            borderRadius: "xl",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            boxShadow: "md",
          }}>
          <CardContent sx={{ p: 2.25 }}>
            {loading ? (
              <Stack spacing={1}>
                <Skeleton level="h3" width="60%" />
                <Skeleton level="body-sm" width="40%" />
                <Divider sx={{ my: 1.25 }} />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} level="body-sm" />
                ))}
              </Stack>
            ) : !data ? (
              <Typography color="danger">No encontrado.</Typography>
            ) : (
              <>
                <Typography level="h3">{data.title}</Typography>
                {data.subtitle && (
                  <Typography level="body-sm" color="neutral" sx={{ mt: 0.25 }}>
                    {data.subtitle}
                  </Typography>
                )}

                <Divider sx={{ my: 1.25 }} />

                <Stack spacing={0.75}>
                  {(data.fields || []).map((f, i) => (
                    <Stack key={i} direction="row" spacing={1}>
                      <Typography level="title-sm" sx={{ minWidth: 160 }}>
                        {f.label}:
                      </Typography>
                      <Typography level="body-sm">{f.value}</Typography>
                    </Stack>
                  ))}
                  {!data.fields?.length && (
                    <Typography color="neutral">
                      Sin campos para mostrar.
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ my: 1.25 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    component={RouterLink}
                    to={`/admin/search?q=${encodeURIComponent(
                      `${KIND_LABEL[data.kind] || data.kind}: ${data.title}`
                    )}`}
                    variant="soft">
                    Ver más resultados
                  </Button>
                  {data.moduleUrl && (
                    <Button
                      endDecorator={<OpenInNewRoundedIcon />}
                      component={RouterLink}
                      to={data.moduleUrl}
                      disabled={!canOpenModule}>
                      Abrir en su módulo
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
