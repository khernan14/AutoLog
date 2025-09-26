// src/pages/Reports/ReportsRouter.jsx
import { useLocation } from "react-router-dom";
import ReportsPage from "../Reports/ReportsPage";
import ContainerReport from "../../components/ComponentsReport/GeneralComponents/ContainerReport";

export default function ReportsRouter() {
  const { search } = useLocation();
  const hasView = new URLSearchParams(search).has("view");
  return hasView ? <ContainerReport /> : <ReportsPage />;
}
