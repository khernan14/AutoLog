import { useState, useEffect } from "react";
import {
    Modal, ModalDialog, Typography, Divider,
    Stack, FormControl, FormLabel, Select, Option, Input, Button
} from "@mui/joy";
import { moverActivo } from "../../services/UbicacionesServices";
import { getBodegas } from "../../services/BodegasServices";
import { getClientes } from "../../services/ClientesServices";
import { getSitesByCliente } from "../../services/SitesServices";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function MoverActivoModal({ open, onClose, activo, onSaved }) {
    const { showToast } = useToast();
    const { userData } = useAuth();

    const [tipoDestino, setTipoDestino] = useState("Bodega");
    const [clientes, setClientes] = useState([]);
    const [sites, setSites] = useState([]);
    const [bodegas, setBodegas] = useState([]);

    const [clienteDestino, setClienteDestino] = useState("");
    const [siteDestino, setSiteDestino] = useState("");
    const [bodegaDestino, setBodegaDestino] = useState("");
    const [motivo, setMotivo] = useState("");

    const [saving, setSaving] = useState(false);

    // Cargar listas iniciales
    useEffect(() => {
        if (open) {
            loadData();
            resetForm();
        }
    }, [open]);

    async function loadData() {
        try {
            const [cli, bod] = await Promise.all([getClientes(), getBodegas()]);
            setClientes(cli);
            setBodegas(bod);
        } catch (err) {
            showToast("Error al cargar datos", "danger");
        }
    }

    function resetForm() {
        setTipoDestino("Bodega");
        setClienteDestino("");
        setSiteDestino("");
        setBodegaDestino("");
        setMotivo("");
    }

    // Cargar sites según cliente elegido
    useEffect(() => {
        if (tipoDestino === "Cliente" && clienteDestino) {
            getSitesByCliente(clienteDestino).then(setSites).catch(() => setSites([]));
        } else {
            setSites([]);
        }
    }, [tipoDestino, clienteDestino]);

    async function onSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await moverActivo({
                id_activo: activo.id,
                tipo_destino: tipoDestino,
                id_cliente_site: tipoDestino === "Cliente" ? siteDestino : null,
                id_bodega: tipoDestino === "Bodega" ? bodegaDestino : null,
                motivo,
                usuario_responsable: userData?.id_usuario || null,
            });
            showToast("Activo movido correctamente", "success");
            onClose();
            onSaved();
        } catch (err) {
            showToast(err.message || "Error al mover activo", "danger");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog component="form" onSubmit={onSubmit} sx={{ width: { xs: "100%", sm: 520 } }}>
                <Typography level="title-lg">Mover Activo</Typography>
                <Divider />
                <Stack spacing={1.5} mt={1}>
                    <FormControl required>
                        <FormLabel>Tipo destino</FormLabel>
                        <Select
                            value={tipoDestino}
                            onChange={(_, v) => setTipoDestino(v)}
                            disabled={saving}
                        >
                            <Option value="Bodega">Bodega</Option>
                            <Option value="Cliente">Cliente</Option>
                        </Select>
                    </FormControl>

                    {tipoDestino === "Bodega" && (
                        <FormControl required>
                            <FormLabel>Bodega destino</FormLabel>
                            <Select
                                value={bodegaDestino}
                                onChange={(_, v) => setBodegaDestino(v)}
                                disabled={saving}
                            >
                                <Option value="">—</Option>
                                {bodegas.map(b => (
                                    <Option key={b.id} value={b.id}>{b.nombre}</Option>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {tipoDestino === "Cliente" && (
                        <>
                            <FormControl required>
                                <FormLabel>Cliente destino</FormLabel>
                                <Select
                                    value={clienteDestino}
                                    onChange={(_, v) => setClienteDestino(v)}
                                    disabled={saving}
                                >
                                    <Option value="">—</Option>
                                    {clientes.map(c => (
                                        <Option key={c.id} value={c.id}>{c.nombre}</Option>
                                    ))}
                                </Select>
                            </FormControl>
                            {clienteDestino && (
                                <FormControl required>
                                    <FormLabel>Site destino</FormLabel>
                                    <Select
                                        value={siteDestino}
                                        onChange={(_, v) => setSiteDestino(v)}
                                        disabled={saving}
                                    >
                                        <Option value="">—</Option>
                                        {sites.map(s => (
                                            <Option key={s.id} value={s.id}>{s.nombre}</Option>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </>
                    )}

                    <FormControl>
                        <FormLabel>Motivo</FormLabel>
                        <Input value={motivo} onChange={e => setMotivo(e.target.value)} disabled={saving} />
                    </FormControl>
                </Stack>

                <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
                    <Button variant="plain" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button type="submit" loading={saving} disabled={saving}>Mover</Button>
                </Stack>
            </ModalDialog>
        </Modal>
    );
}
