import styled from "styled-components";

export const Container = styled.div`
  padding: 2rem;
`;

export const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
`;

export const GridSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;
