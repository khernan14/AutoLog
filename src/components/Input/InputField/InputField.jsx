import { InputWrapper, StyledInput, Icon } from "./InputField.styles";

export default function InputField({
  type,
  placeholder,
  value,
  onChange,
  icon,
  name,
  readOnly,
}) {
  return (
    <InputWrapper>
      <StyledInput
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        readOnly={readOnly}
      />
      <Icon className={`bx ${icon}`} />
    </InputWrapper>
  );
}
