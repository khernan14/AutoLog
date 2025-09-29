import React from "react";
import {
  Card,
  Divider,
  Stack,
  Typography,
  RadioGroup,
  Radio,
  Select,
  Option,
} from "@mui/joy";
import { Sun, Moon, Monitor } from "lucide-react";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";
import { useColorScheme } from "@mui/joy/styles";
import { useAppTheme } from "../../../context/AppThemeContext.jsx";

const FONT_LABELS = {
  "Poppins, sans-serif": "Poppins",
  "Inter, ui-sans-serif, system-ui, sans-serif": "Inter",
  "Roboto, system-ui, -apple-system, Segoe UI, sans-serif": "Roboto",
  "system-ui, -apple-system, Segoe UI, Roboto, sans-serif": "System UI",
};

export default function Apariencia() {
  const { mode, setMode } = useColorScheme(); // 'light' | 'dark' | 'system'
  const { brand, setBrand, font, setFont } = useAppTheme();

  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader title="Apariencia" subtitle="Tema, acento y tipografía.">
        <ActionBar
          onSave={() => {}}
          onReset={() => {
            setMode("light");
            setBrand("default");
            setFont("Poppins, sans-serif");
          }}
        />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {/* MODO */}
        <Typography level="title-sm">Modo</Typography>
        <RadioGroup
          orientation="horizontal"
          value={mode || "light"}
          onChange={(e) => setMode(e.target.value)}
          sx={{ gap: 1.25 }}>
          <Radio
            value="light"
            label={
              <Stack direction="row" gap={0.5} alignItems="center">
                <Sun size={14} /> Claro
              </Stack>
            }
          />
          <Radio
            value="dark"
            label={
              <Stack direction="row" gap={0.5} alignItems="center">
                <Moon size={14} /> Oscuro
              </Stack>
            }
          />
          <Radio
            value="system"
            label={
              <Stack direction="row" gap={0.5} alignItems="center">
                <Monitor size={14} /> Sistema
              </Stack>
            }
          />
        </RadioGroup>
        <Typography level="body-xs" color="neutral">
          * Con esto arreglamos el caso móvil: por defecto usamos <b>Claro</b>.
          Si eliges <b>Sistema</b>, se aplicará el “prefers-color-scheme” del
          dispositivo.
        </Typography>

        {/* TEMA / MARCA */}
        <Typography level="title-sm" sx={{ mt: 1 }}>
          Estilo de tema
        </Typography>
        <Select
          value={brand}
          onChange={(_, v) => v && setBrand(v)}
          sx={{ maxWidth: 260 }}>
          <Option value="default">Predeterminado</Option>
          <Option value="indigo">Indigo · #4f46e5</Option>
          <Option value="teams">Teams-like (blanco)</Option>
          <Option value="forest">Forest (verde profundo)</Option>
        </Select>

        {/* FUENTE */}
        <Typography level="title-sm" sx={{ mt: 1 }}>
          Tipografía
        </Typography>
        <Select
          value={font}
          onChange={(_, v) => v && setFont(v)}
          sx={{ maxWidth: 320 }}>
          <Option value="Poppins, sans-serif">Poppins</Option>
          <Option value="Inter, ui-sans-serif, system-ui, sans-serif">
            Inter
          </Option>
          <Option value="Roboto, system-ui, -apple-system, Segoe UI, sans-serif">
            Roboto
          </Option>
          <Option value="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
            System UI
          </Option>
        </Select>
        <Typography level="body-xs" color="neutral">
          Actual: <b>{FONT_LABELS[font] || font}</b>. Asegúrate de cargar la
          fuente que elijas (Google Fonts o assets locales).
        </Typography>
      </Stack>
    </Card>
  );
}
