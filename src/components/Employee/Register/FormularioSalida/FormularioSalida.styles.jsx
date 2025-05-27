import styled from "styled-components";

export const SalidaWrapper = styled.div`
  padding: 1rem;
`;

export const SalidaForm = styled.form`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  padding: 2rem;
  border-radius: 1rem;
  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const ContainerButtons = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
`;
