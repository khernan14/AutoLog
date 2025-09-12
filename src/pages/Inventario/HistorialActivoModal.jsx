import { useState, useEffect } from "react";
import {
    Modal, ModalDialog, Typography, Divider,
    Table, Sheet
} from "@mui/joy";
import { getHistorialUbicaciones } from "../../services/ActivosServices";
import { useToast } from "../../context/ToastContext";

export default function HistorialActivoModal({ open, onClose, activo }) {
    const { showToast } = useToast();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && activo) {
            load();
        }
    }, [open, activo]);

    async function load() {
        setLoading(true);
        try {
            const data = await getHistorialUbicaciones(activo.id);
            setRows(data || []);
        } catch (err) {
            showToast(err.message || "Error al obtener historial", "danger");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ width: { xs: "100%", sm: 700 } }}>
                <Typography level="title-lg">Historial de Movimientos</Typography>
                <Divider />
                {loading ? (
                    <Sheet p={2}>Cargando…</Sheet>
                ) : rows.length === 0 ? (
                    <Sheet p={2}>Sin movimientos registrados</Sheet>
                ) : (
                    <Table size="sm" stickyHeader>
                        <thead>
                            <tr>
                                <th>Destino</th>
                                <th>Cliente / Site</th>
                                <th>Bodega</th>
                                <th>Inicio</th>
                                <th>Fin</th>
                                <th>Motivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((m, idx) => (
                                <tr key={idx}>
                                    <td>{m.tipo_destino}</td>
                                    <td>{m.cliente_nombre ? `${m.cliente_nombre} / ${m.site_nombre}` : "—"}</td>
                                    <td>{m.bodega_nombre || "—"}</td>
                                    <td>{new Date(m.fecha_inicio).toLocaleString()}</td>
                                    <td>{m.fecha_fin ? new Date(m.fecha_fin).toLocaleString() : "—"}</td>
                                    <td>{m.motivo || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </ModalDialog>
        </Modal>
    );
}
