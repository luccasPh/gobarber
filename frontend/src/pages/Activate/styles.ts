import styled from 'styled-components';
import { shade } from 'polished';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

export const Text = styled.div`
  width: 800px;
  h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
`;

export const Platform = styled.div`
  display: flex;
  flex-direction: row;
  margin: 20px;
  a + a {
    margin-left: 50px;
  }
  a {
    text-decoration: none;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: #ff9000;
    height: 56px;
    border-radius: 10px;
    border: 0;
    color: #312e38;
    width: 100%;
    font-weight: 500;
    margin-top: 16px;
    transition: background-color 0.2s;
    &:hover {
      background: ${shade(0.2, '#ff9000')};
    }

    p {
      margin-left: 10px;
    }
  }
`;

export const Button = styled.button``;
