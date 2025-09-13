import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";

// Crea la instancia con buenas prácticas para impresión
const createQrInstance = ({ text, size, logoUrl, renderAsSvg }) =>
  new QRCodeStyling({
    width: size,
    height: size,
    type: renderAsSvg ? "svg" : "canvas", // svg = vector
    data: text,
    qrOptions: {
      errorCorrectionLevel: "H", // más robusto (logo/tinta)
    },
    image: logoUrl || undefined,
    imageOptions: {
      crossOrigin: "anonymous",
      hideBackgroundDots: true,
      imageSize: 0.2, // ~20% del QR (ajusta a gusto)
      margin: 8,
    },
    dotsOptions: {
      color: "#000000",
      type: "rounded", // puedes usar "square" para máxima nitidez
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    cornersSquareOptions: { type: "extra-rounded" },
    cornersDotOptions: { type: "dot" },
  });

/**
 * Uso:
 * const qrRef = useRef();
 * <StyledQR ref={qrRef} text="https://..." size={220} exportScale={6} format="svg" />
 * qrRef.current.download("svg", "QR_equipo");  // vector
 * qrRef.current.download("png", "QR_equipo");  // raster @ alta resolución (size*exportScale)
 */
const StyledQR = forwardRef(
  (
    {
      text,
      size = 220, // tamaño visible en pantalla
      logoUrl,
      format = "svg", // "svg" | "png" | "jpeg"
      exportScale = 6, // multiplicador para raster al descargar (p.ej. 6 -> 1320px)
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const qrRef = useRef(null);

    // Inicializar / actualizar QR visible (ligero)
    useEffect(() => {
      const wantsSvg = format === "svg";
      if (!qrRef.current) {
        qrRef.current = createQrInstance({
          text,
          size,
          logoUrl,
          renderAsSvg: wantsSvg,
        });
        qrRef.current.append(containerRef.current);
      } else {
        qrRef.current.update({
          data: text,
          image: logoUrl || undefined,
          width: size,
          height: size,
          type: wantsSvg ? "svg" : "canvas",
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, size, logoUrl, format]);

    // Exponer download() con upscale temporal para raster
    useImperativeHandle(ref, () => ({
      download: async (extension = format, name = "qr_code") => {
        if (!qrRef.current) return;

        const isRaster = extension === "png" || extension === "jpeg";
        const orig = { width: size, height: size };

        try {
          if (extension === "svg") {
            // Cambiar a SVG para bajar vector
            await qrRef.current.update({ type: "svg" });
            await qrRef.current.download({ extension: "svg", name });
          } else if (isRaster) {
            // Re-render temporal a alta resolución
            await qrRef.current.update({
              type: "canvas",
              width: size * exportScale,
              height: size * exportScale,
            });
            await qrRef.current.download({ extension, name });
          }
        } finally {
          // Volver al tamaño visible original
          await qrRef.current.update({
            width: orig.width,
            height: orig.height,
            type: format === "svg" ? "svg" : "canvas",
          });
        }
      },
    }));

    return <div ref={containerRef} />;
  }
);

export default StyledQR;
