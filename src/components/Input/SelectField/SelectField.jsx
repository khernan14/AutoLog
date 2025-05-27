import { SelectWrapper, StyledSelect, Icon } from "./SelectField.styles";

export default function SelectField({ value, onChange, children, icon }) {
  return (
    <SelectWrapper>
      <StyledSelect value={value} onChange={onChange}>
        {children}
      </StyledSelect>
      <Icon className={`bx ${icon}`} />
    </SelectWrapper>
  );
}
