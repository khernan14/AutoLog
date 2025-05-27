import styled from "styled-components";

export const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
`;

export const LoginCard = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
  max-width: 1000px;
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const InfoPanel = styled.div`
  background: #007bff;
  color: white;
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img {
    width: 150px;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  a {
    color: #ffffff;
    font-weight: bold;
    text-decoration: underline;
  }
`;

export const LoginFormStyled = styled.form`
  flex: 1;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .login-title {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333333;
    text-align: center;
  }

  .forgot-password {
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    text-align: right;
    font-size: 0.9rem;
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }
  }
`;
