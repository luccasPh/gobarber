import styled, { keyframes } from 'styled-components';
import { shade } from 'polished';
import backgroundImage from '../../assets/sign-up-background.png';

interface OptionProps {
  selected: boolean;
}

export const Container = styled.div`
  height: 100vh;
  display: flex;
  align-items: stretch;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 700px;
  overflow-y: scroll;
`;

const appearFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(+50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const AnimationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${appearFromRight} 1s;
  padding: 200px 0 40px 0;

  form {
    width: 380px;
    text-align: center;

    h1 {
      margin-top: 24px;
    }

    a {
      color: #f4ede8;
      display: block;
      margin-top: 24px;
      text-decoration: none;
      transition: color 0.2s;
      &:hover {
        color: ${shade(0.2, '#f4ede8')};
      }
    }
  }

  > a {
    color: #f4ede8;
    display: block;
    margin-top: 44px;
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    &:hover {
      color: ${shade(0.2, '#f4ede8')};
    }
    svg {
      margin-right: 16px;
    }
  }
`;

export const Background = styled.div`
  flex: 1;
  background: url(${backgroundImage}) no-repeat center;
  background-size: cover;
`;

export const SelectOptions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 70px;
  margin: 30px 0;
`;

export const Option = styled.div<OptionProps>`
  color: ${(props) => (props.selected ? '#F4EDE8' : '#999591')};
  cursor: pointer;

  p:after {
    content: '';
    height: 2px;
    background: ${(props) => (props.selected ? '#ff9000' : '')};
    display: block;
    margin-top: 8px;
  }
`;
