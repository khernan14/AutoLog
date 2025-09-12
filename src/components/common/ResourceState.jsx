import * as React from "react";
import { Stack, CircularProgress, Sheet, Typography, Button } from "@mui/joy";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";

import StatusCard from "./StatusCard";

/**
 * Componente que rinde el "estado de recurso" con StatusCard.
 * Props:
 * - state: "checking" | "no-permission" | "error" | "empty" | "loading" | "data"
 * - error: string (para estado 'error')
 * - onRetry: function (para botón "Reintentar" si es error de red)
 * - emptyTitle / emptyDescription: opcional para personalizar el vacío
 */
export default function ResourceState({
    state,
    error,
    onRetry,
    emptyTitle = "Sin resultados",
    emptyDescription = "Aún no hay registros disponibles.",
}) {
    if (state === "checking") {
        return (
            <StatusCard
                icon={<HourglassEmptyRoundedIcon />}
                title="Verificando sesión…"
                description={
                    <Stack alignItems="center" spacing={1}>
                        <CircularProgress size="sm" />
                        <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                            Por favor, espera un momento.
                        </Typography>
                    </Stack>
                }
            />
        );
    }

    if (state === "no-permission") {
        return (
            <StatusCard
                color="danger"
                icon={<LockPersonRoundedIcon />}
                title="Sin permisos"
                description="Consulta con un administrador para obtener acceso."
            />
        );
    }

    if (state === "error") {
        const low = (error || "").toLowerCase();
        const isNetwork =
            low.includes("no hay conexión") ||
            low.includes("failed to fetch") ||
            low.includes("networkerror");

        return (
            <StatusCard
                color={isNetwork ? "warning" : "neutral"}
                icon={isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />}
                title={isNetwork ? "Problema de conexión" : "Ocurrió un problema"}
                description={error}
                actions={
                    isNetwork ? (
                        <Button startDecorator={<RestartAltRoundedIcon />} onClick={onRetry} variant="soft">
                            Reintentar
                        </Button>
                    ) : null
                }
            />
        );
    }

    if (state === "empty") {
        return (
            <StatusCard
                color="neutral"
                icon={<InfoOutlinedIcon />}
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    if (state === "loading") {
        return (
            <Sheet p={3} sx={{ textAlign: "center" }}>
                <Stack spacing={1} alignItems="center">
                    <CircularProgress />
                    <Typography level="body-sm">Cargando…</Typography>
                </Stack>
            </Sheet>
        );
    }

    return null; // "data" → el contenedor padre renderiza el contenido real
}
