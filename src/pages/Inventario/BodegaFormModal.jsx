import { useState, useEffect } from "react";
import { createBodega, updateBodega } from "../../services/BodegasServices";
import { getCities } from "../../services/LocationServices"; // 👈 asegúrate de tener este
import {
    Modal, ModalDialog, Typography, Divider,
    Stack, FormControl, FormLabel, Input, Select, Option, Button
} from "@mui/joy";
import { useToast } from "../../context/ToastContext";

export default function BodegaFormModal({ open, onClose, editing, onSaved }) {
    const { showToast } = useToast();

    const [form, setForm] = useState({ nombre: "", descripcion: "", id_ciudad: "" });
    const [cities, setCities] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editing) {
            setForm({
                nombre: editing.nombre,
                descripcion: editing.descripcion || "",
                id_ciudad: editing.id_ciudad || "",
            });
        } else {
            setForm({ nombre: "", descripcion: "", id_ciudad: "" });
        }
    }, [editing]);

    useEffect(() => {
        loadCities();
    }, []);

    async function loadCities() {
        try {
            const data = await getCities();
            setCities(data);
        } catch (err) {
            showToast("Error al cargar ciudades", "danger");
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!form.nombre.trim()) {
            showToast("El nombre es requerido", "warning");
            return;
        }
        if (!form.id_ciudad) {
            showToast("Debe seleccionar una ciudad", "warning");
            return;
        }

        setSaving(true);
        try {
            if (editing) {
                await updateBodega(editing.id, form);
                showToast("Bodega actualizada", "success");
            } else {
                await createBodega(form);
                showToast("Bodega creada", "success");
            }
            onClose();
            onSaved();
        } catch (err) {
            showToast(err.message || "Error al guardar bodega", "danger");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog component="form" onSubmit={onSubmit} sx={{ width: { xs: "100%", sm: 520 } }}>
                <Typography level="title-lg">{editing ? "Editar Bodega" : "Nueva Bodega"}</Typography>
                <Divider />
                <Stack spacing={1.5} mt={1}>
                    <FormControl required>
                        <FormLabel>Nombre</FormLabel>
                        <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} disabled={saving} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Descripción</FormLabel>
                        <Input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} disabled={saving} />
                    </FormControl>
                    <FormControl required>
                        <FormLabel>Ciudad</FormLabel>
                        <Select
                            value={form.id_ciudad || ""}
                            onChange={(_, v) => setForm({ ...form, id_ciudad: v })}
                            disabled={saving}
                        >
                            {cities.map(c => (
                                <Option key={c.id} value={c.id}>{c.ciudad}</Option>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
                    <Button variant="plain" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button type="submit" loading={saving} disabled={saving}>Guardar</Button>
                </Stack>
            </ModalDialog>
        </Modal>
    );
}
