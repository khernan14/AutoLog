import styled from "styled-components";

export const DropdownContainer = styled.div`
  position: relative;
  padding: 0 1rem;
`;

export const DropdownButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  // box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

export const UserName = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  bottom: 3.5rem;
  left: 0;
  width: 15rem;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

export const DropdownTitle = styled.div`
  font-size: 0.875rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const DropdownItem = styled.button`
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.1rem;
  text-align: left;
  background: none;
  border: none;
  border-radius: 0.375rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

export const DangerItem = styled(DropdownItem)`
  color: ${({ theme }) => theme.colors.danger};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;
