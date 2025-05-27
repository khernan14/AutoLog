import { TextAreaWrapper, StyledTextArea } from "./TextAreaField.styles";

export default function TextAreaField({ value, onChange, rows = 3 }) {
  return (
    <TextAreaWrapper>
      <StyledTextArea value={value} onChange={onChange} rows={rows} />
    </TextAreaWrapper>
  );
}
