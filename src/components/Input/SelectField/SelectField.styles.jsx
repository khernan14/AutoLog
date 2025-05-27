import styled from "styled-components";

export const SelectWrapper = styled.div`
  position: relative;
`;

export const StyledSelect = styled.select`
  width: 100%;
  border: 1px solid #2cc295;
  border-radius: 8px;
  padding: 12px 16px 12px 25px;
  font-family: "Poppins", sans-serif;
  background-color: #042222;
  color: #f8fbff;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #00df82;
    box-shadow: 0 0 0 2px #00df8255;
  }

  &::placeholder {
    color: #f8fbffaa;
  }
`;

export const Icon = styled.i`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.primary};
`;
