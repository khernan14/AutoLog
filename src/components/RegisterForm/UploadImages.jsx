import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Button, IconButton, Stack, Typography, Sheet } from "@mui/joy";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";

/**
 * UploadImages
 * Props:
 *  - value?: File[]                  (lista controlada opcional)
 *  - onChange?: (files: File[]) => void
 *  - maxCount?: number               (por defecto 6)
 *  - maxSizeMB?: number              (por defecto 6MB por archivo)
 *  - accept?: string                 (por defecto imágenes comunes incl. png/svg/webp)
 *  - capture?: string                ("environment" p/ móvil, opcional)
 *  - targetDpi?: number              (opcional: ej. 300 para pre-escalar canvas y mejorar nitidez)
 *  - dnd?: boolean                   (arrastrar/soltar; default true)
 *  - disabled?: boolean
 */
export default function UploadImages({
  value,
  onChange,
  maxCount = 6,
  maxSizeMB = 6,
  accept = "image/*,.png,.jpg,.jpeg,.webp,.svg",
  capture,
  targetDpi,
  dnd = true,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState(value || []);
  const [previews, setPreviews] = useState([]); // { url, name, size }

  // sin pérdidas de memoria
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  // sincroniza controlado
  useEffect(() => {
    if (Array.isArray(value)) setFiles(value);
  }, [value]);

  const notify = useCallback(
    (next) => {
      setFiles(next);
      onChange?.(next);
      // regenerar previews
      setPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return next.map((f) => ({
          url: URL.createObjectURL(f),
          name: f.name,
          size: f.size,
        }));
      });
    },
    [onChange]
  );

  const validateFile = useCallback(
    (f) => {
      if (!f) return false;
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (f.size > maxBytes) {
        // puedes cambiar por tu toast
        console.warn(`Archivo demasiado grande: ${f.name}`);
        return false;
      }
      return true;
    },
    [maxSizeMB]
  );

  // (opcional) re-render con DPI alto: crea un nuevo blob con mayor resolución
  const resampleForDpi = useCallback(
    async (file) => {
      if (!targetDpi) return file;
      // solo raster: deja SVG tal cual
      if (file.type === "image/svg+xml") return file;

      const img = document.createElement("img");
      const src = URL.createObjectURL(file);
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = src;
      });

      // heurística simple: escala por factor 2x para “fingir” ~300dpi en QR pequeño
      const scale = targetDpi >= 240 ? 2 : 1.5;

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(256, Math.floor(img.naturalWidth * scale));
      canvas.height = Math.max(256, Math.floor(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false; // evita suavizado (mejor bordes QR/texto)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((res) =>
        canvas.toBlob(res, "image/png", 1.0)
      );
      URL.revokeObjectURL(src);

      return new File([blob], file.name.replace(/\.\w+$/, ".png"), {
        type: "image/png",
      });
    },
    [targetDpi]
  );

  const pickFiles = useCallback(
    async (list) => {
      const incoming = Array.from(list || []);
      const room = Math.max(0, maxCount - files.length);
      const selected = incoming.slice(0, room);

      const filtered = [];
      for (const f of selected) {
        if (validateFile(f)) {
          const maybeResampled = await resampleForDpi(f);
          filtered.push(maybeResampled);
        }
      }
      if (filtered.length) notify([...files, ...filtered]);
    },
    [files, maxCount, notify, resampleForDpi, validateFile]
  );

  const onInputChange = async (e) => {
    await pickFiles(e.target.files);
    // limpia el input para permitir re-subir mismo archivo
    e.target.value = "";
  };

  const removeAt = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    notify(next);
  };

  // drag & drop
  const [isOver, setIsOver] = useState(false);
  const onDrag = (e) => {
    if (!dnd || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };
  const onDragLeave = (e) => {
    if (!dnd || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };
  const onDrop = async (e) => {
    if (!dnd || disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    await pickFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      <Sheet
        variant={isOver ? "outlined" : "soft"}
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        sx={{
          p: 1.5,
          borderRadius: "md",
          borderStyle: "dashed",
          borderColor: isOver
            ? "primary.outlinedColor"
            : "neutral.outlinedColor",
          bgcolor: isOver ? "background.level1" : "background.body",
          transition: "background-color .15s ease",
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="sm"
            variant="soft"
            startDecorator={<UploadRoundedIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={disabled || files.length >= maxCount}>
            Agregar imágenes
          </Button>
          <Typography level="body-sm" color="neutral">
            {files.length}/{maxCount} archivos • máx {maxSizeMB}MB c/u
          </Typography>
        </Stack>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          capture={capture}
          onChange={onInputChange}
          style={{ display: "none" }}
          disabled={disabled || files.length >= maxCount}
        />

        {previews.length > 0 && (
          <Stack direction="row" spacing={1} mt={1} sx={{ flexWrap: "wrap" }}>
            {previews.map((p, i) => (
              <Sheet
                key={p.url}
                variant="outlined"
                sx={{
                  p: 0.75,
                  borderRadius: "sm",
                  position: "relative",
                  width: 104,
                }}>
                <img
                  src={p.url}
                  alt={p.name}
                  style={{
                    display: "block",
                    width: "100%",
                    height: 88,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
                <IconButton
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={() => removeAt(i)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "white",
                  }}
                  aria-label={`Eliminar ${p.name}`}>
                  <ClearRoundedIcon />
                </IconButton>
              </Sheet>
            ))}
          </Stack>
        )}
      </Sheet>
    </Box>
  );
}
