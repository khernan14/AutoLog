import { useEffect, useState } from "react";
import { Sheet, CircularProgress, Typography } from "@mui/joy";
import ReportHeader from "../components/ReportsForm/Reports/ReportHeader.jsx";
import ReportCard from "../components/ReportsForm/Reports/ReportCard.jsx";
import ReportDetailModal from "../components/ReportsForm/Reports/ReportDetailModal.jsx";
import { getRegisterReport } from "../services/ReportServices";

export default function RegisterReport() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      const data = await getRegisterReport();
      setRegistros(data);
      setLoading(false);
    };

    fetchRegistros();
  }, []);

  const handleCardClick = (registro) => {
    setSelectedRegistro(registro);
    setModalOpen(true);
  };

  return (
    <Sheet variant="soft" sx={{ p: 3 }}>
      <ReportHeader title="Reporte de Registro de Uso de Vehículos" />

      {loading ? (
        <CircularProgress size="lg" />
      ) : registros.length === 0 ? (
        <Typography>No hay registros disponibles.</Typography>
      ) : (
        registros.map((registro) => (
          <ReportCard
            key={registro.id}
            registro={registro}
            onClick={handleCardClick}
          />
        ))
      )}

      <ReportDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        registro={selectedRegistro}
      />
    </Sheet>
  );
}
