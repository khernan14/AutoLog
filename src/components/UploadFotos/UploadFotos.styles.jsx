import styled from "styled-components";

export const UploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

export const FileInput = styled.input`
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
`;

export const PreviewGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const PreviewItem = styled.div`
  position: relative;
  width: 7rem;
  height: 7rem;
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: red;
  color: white;
  font-size: 0.8rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
`;
