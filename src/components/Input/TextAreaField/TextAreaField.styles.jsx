import styled from "styled-components";

export const TextAreaWrapper = styled.div`
  width: 100%;
`;

export const StyledTextArea = styled.textarea`
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
