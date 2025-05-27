import styled from "styled-components";

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledInput = styled.input`
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
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #2cc295;
`;
