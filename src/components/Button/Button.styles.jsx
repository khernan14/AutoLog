import styled, { css } from "styled-components";

const baseStyles = css`
  border-radius: 8px;
  padding: 10px 20px;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  transition: background-color 0.3s ease;
  cursor: pointer;
  outline: none;
  border: none;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent};
  }
`;

export const ButtonStyled = styled.button`
  ${baseStyles}

  ${({ $variant, theme }) =>
    $variant === "primary" &&
    css`
      background-color: ${theme.colors.primary};
      color: white;

      &:hover {
        background-color: ${theme.colors.accent};
      }
    `}

  ${({ $variant, theme }) =>
    $variant === "danger" &&
    css`
      background-color: #e53935;
      color: white;

      &:hover {
        background-color: #c62828;
      }
    `}

  ${({ $variant, theme }) =>
    $variant === "outline" &&
    css`
      background-color: transparent;
      color: ${theme.colors.primary};
      border: 2px solid ${theme.colors.primary};

      &:hover {
        background-color: ${theme.colors.secondary};
      }
    `}
`;
