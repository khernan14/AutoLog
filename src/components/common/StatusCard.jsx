import * as React from "react";
import { Card, Stack, Typography, Box } from "@mui/joy";

/**
 * Tarjeta de estado genérica y reusable
 * Props:
 * - color: Joy color (neutral | primary | success | warning | danger ...)
 * - icon: ReactNode (icono grande)
 * - title: string
 * - description: string | ReactNode
 * - actions: ReactNode (botones, links, etc.)
 */
export default function StatusCard({ color = "neutral", icon, title, description, actions }) {
    return (
        <Card
            variant="soft"
            color={color}
            sx={{ p: 3, textAlign: "center", maxWidth: 560, mx: "auto", borderRadius: "lg" }}
        >
            <Stack spacing={1.25} alignItems="center">
                {icon && (
                    <Box
                        sx={{
                            width: 56, height: 56, borderRadius: "50%",
                            display: "grid", placeItems: "center", bgcolor: "background.level1"
                        }}
                    >
                        {icon}
                    </Box>
                )}
                {title && <Typography level="title-lg">{title}</Typography>}
                {description && (
                    <Typography level="body-sm" sx={{ opacity: 0.9 }}>
                        {description}
                    </Typography>
                )}
                {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
            </Stack>
        </Card>
    );
}
