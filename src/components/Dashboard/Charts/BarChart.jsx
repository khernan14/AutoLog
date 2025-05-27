import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTitle } from "./BarChart.styles";
import { theme } from "../../../constants/theme";

export default function BarChartComponent({ data }) {
  const formattedData = data.map((item) => ({
    hora: `${item.hora}:00`,
    total: item.total,
  }));

  return (
    <ChartContainer>
      <ChartTitle>Registros por hora (hoy)</ChartTitle>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="total"
            fill={theme.colors.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
