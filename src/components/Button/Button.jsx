import { ButtonStyled } from "./Button.styles";

export default function Button({
  children,
  onClick,
  type = "button",
  color = "primary",
  className = "",
  disabled = false,
}) {
  return (
    <ButtonStyled
      type={type}
      onClick={onClick}
      $variant={color}
      className={className}
      disabled={disabled}>
      {children}
    </ButtonStyled>
  );
}
