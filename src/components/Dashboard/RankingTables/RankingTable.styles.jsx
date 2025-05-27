import styled from "styled-components";

export const TableContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
  min-height: auto;
  padding: 2rem;
  font-family: "Poppins", sans-serif;
  color: ${({ theme }) => theme.colors.text};
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  //   gap: 1rem;

  h2 {
    font-size: 1.8rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const TableTitle = styled.h1`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 1.5rem;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);

  thead {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }

  th,
  td {
    padding: 1rem;
    text-align: left;
    // border-bottom: 1px solid ${({ theme }) =>
      theme.colors.border || "#e5e7eb"};
  }

  tr:hover {
    background-color: ${({ theme }) => theme.colors.primary || "#f9fafb"};
  }

  th {
    font-weight: 600;
    font-size: 0.95rem;
  }

  td {
    font-size: 0.9rem;
  }
`;
