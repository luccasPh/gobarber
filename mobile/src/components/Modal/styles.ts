import styled from 'styled-components/native';

export const Container = styled.View``;

export const Contate = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.View`
  margin: 20px;
  background: white;
  border-radius: 20px;
  padding: 35px;
  shadow-color: #000;
  shadow-offset: {
    width: 0;
    height: 2;
  }
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 500;
`;

export const ModalText = styled.Text`
  margin-bottom: 15px;
  text-align: center;
`;

export const ModalButton = styled.TouchableHighlight`
  background: #f194ff;
  border-radius: 20px;
  padding: 10px;
  elevation: 2;
`;

export const ButtonText = styled.Text`
  color: white;
  font-family: 'RobotoSlabMedium';
  text-align: center;
`;
