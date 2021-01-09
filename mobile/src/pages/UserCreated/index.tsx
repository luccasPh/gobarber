/* eslint-disable import/no-duplicates */
import React, { useCallback } from 'react';
import Icon from '@expo/vector-icons/build/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  Container,
  Title,
  Description,
  BackButton,
  BackButtonText,
} from './styles';

interface RouteParams {
  message: string;
}

const UserCreated: React.FC = () => {
  const { reset } = useNavigation();
  const { params } = useRoute();

  const { message } = params as RouteParams;

  const handleBackPressed = useCallback(() => {
    reset({
      routes: [{ name: 'SignIn' }],
      index: 0,
    });
  }, [reset]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Cadastro realizador</Title>
      <Description>{message}</Description>

      <BackButton onPress={handleBackPressed}>
        <BackButtonText>Voltar</BackButtonText>
      </BackButton>
    </Container>
  );
};

export default UserCreated;
