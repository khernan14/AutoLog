import styled from "styled-components";

export const ChartContainer = styled.div`
  width: 100%;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
`;

export const ChartTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;
