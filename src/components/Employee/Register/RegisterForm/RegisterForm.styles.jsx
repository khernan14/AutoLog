import styled from "styled-components";

export const RegisterMain = styled.main`
  max-width: 56rem;
  // margin: 3rem;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: 2rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    h2 {
      font-size: 1.5rem;
    }
  }
`;
