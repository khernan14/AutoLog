import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";

// 🔹 Configurador del QR
const createQrInstance = ({ text, size, logoUrl }) =>
    new QRCodeStyling({
        width: size,
        height: size,
        data: text,
        image: logoUrl || undefined,
        dotsOptions: {
            color: "#000000",
            type: "rounded", // "dots" | "rounded" | "classy" | "square" | etc
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 8,
        },
        cornersSquareOptions: {
            type: "extra-rounded", // "square" | "dot" | "extra-rounded"
        },
        cornersDotOptions: {
            type: "dot",
        },
    });

/**
 * Componente QR estilizado con exportación
 * Uso:
 * const qrRef = useRef();
 * <StyledQR ref={qrRef} text="https://ejemplo.com" />
 * qrRef.current.download("png", "MiQR");
 */
const StyledQR = forwardRef(({ text, size = 200, logoUrl }, ref) => {
    const containerRef = useRef(null);
    const qrRef = useRef(null);

    // Inicializar / actualizar QR
    useEffect(() => {
        if (!qrRef.current) {
            qrRef.current = createQrInstance({ text, size, logoUrl });
            qrRef.current.append(containerRef.current);
        } else {
            qrRef.current.update({
                data: text,
                width: size,
                height: size,
                image: logoUrl || undefined,
            });
        }
    }, [text, size, logoUrl]);

    // Exponer función download() al padre
    useImperativeHandle(ref, () => ({
        download: (extension = "png", name = "qr_code") => {
            if (qrRef.current) {
                qrRef.current.download({ extension, name });
            }
        },
    }));

    return <div ref={containerRef} />;
});

export default StyledQR;
