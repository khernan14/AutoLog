import styled from "styled-components";

export const NavBarContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  h1 {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
`;
