import { useEffect, useState } from "react";

export default function FlashMessage({ mensaje, tiempo = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setVisible(false), tiempo);
      return () => clearTimeout(timer);
    }
  }, [mensaje, tiempo]);

  if (!visible || !mensaje) return null;

  return (
    <div className="bg-green-100 text-green-800 p-4 rounded mb-4 text-center animate-fade-in">
      {mensaje}
    </div>
  );
}
