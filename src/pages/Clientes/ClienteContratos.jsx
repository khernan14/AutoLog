import { Box, Typography } from "@mui/joy";

export default function ClienteContratos() {
    return (
        <Box>
            <Typography level="h5">Contratos del Cliente</Typography>
            <Typography level="body-sm" mt={1}>
                Aquí estarán los contratos, adendas y SO de este cliente.
            </Typography>
        </Box>
    );
}
