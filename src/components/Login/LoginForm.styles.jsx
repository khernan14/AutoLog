import styled from "styled-components";

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  // background-color: ${({ theme }) => theme.colors.background};
`;

export const LoginCard = styled.div`
  display: flex;
  width: 800px;
  // background-color: ${({ theme }) => theme.colors.text};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 90%;
  }
`;

export const InfoPanel = styled.div`
  flex: 1;
  // background-color: ${({ theme }) => theme.colors.primary};
  // color: ${({ theme }) => theme.colors.text};
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    width: 80px;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 28px;
    margin-bottom: 10px;
  }

  p {
    text-align: center;
    margin-bottom: 20px;
  }

  a {
    // color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
    font-weight: 500;
  }
`;

export const LoginFormStyled = styled.form`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  // background-color: ${({ theme }) => theme.colors.secondary};
  // color: ${({ theme }) => theme.colors.background};

  .login-title {
    font-size: 26px;
    font-weight: 700;
    // color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 30px;
    text-align: center;
  }

  .forgot-password {
    margin-top: 10px;
    font-size: 14px;
    // color: ${({ theme }) => theme.colors.primary};
    text-align: right;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      // color: ${({ theme }) => theme.colors.accent};
    }
  }

  .login-button {
    margin-top: 20px;
  }

  > * + * {
    margin-top: 20px;
  }
`;
