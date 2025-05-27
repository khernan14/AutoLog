import styled from "styled-components";

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h2`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const Value = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 0.5rem;
`;
