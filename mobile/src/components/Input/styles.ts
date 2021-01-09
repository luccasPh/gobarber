import styled, { css } from 'styled-components/native';
import { Feather } from '@expo/vector-icons';

interface ContainerProps {
  isFocused: boolean;
  isErrored: boolean;
}

export const Container = styled.View<ContainerProps>`
  width: 100%;
  height: 60px;
  padding: 0 0 0 16px;
  background-color: #232129;
  border-radius: 10px;
  margin-bottom: 8px;
  border-width: 2px;
  border-color: #232129;
  flex-direction: row;
  align-items: center;
  ${(props) =>
    props.isErrored &&
    css`
      border-color: #c53030;
    `}
  align-items: center;
  ${(props) =>
    props.isFocused &&
    css`
      border-color: #ff9000;
    `}
`;

export const TextInput = styled.TextInput`
  flex: 1;
  color: #fff;
  font-size: 16px;
  font-family: 'RobotoSlabRegular';
`;

export const Icon = styled(Feather)`
  margin-right: 16px;
`;

export const TextError = styled.Text`
  bottom: 10px;
  margin-left: 5px;
  color: #c53030;
  font-size: 16px;
  font-family: 'RobotoSlabRegular';
`;

export const HiddenButton = styled.TouchableOpacity`
  color: #ff9000;
`;
