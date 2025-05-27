import React from "react";
import { Card, Title, Value } from "./SummaryCard.styles";

const SummaryCard = ({ title, value }) => (
  <Card>
    <Title>{title}</Title>
    <Value>{value}</Value>
  </Card>
);

export default SummaryCard;
