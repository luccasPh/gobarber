/* eslint-disable import/no-duplicates */
import React, { useCallback, useMemo } from 'react';
import Icon from '@expo/vector-icons/build/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import {
  Container,
  Title,
  Description,
  BackButton,
  BackButtonText,
} from './styles';

interface RouteParams {
  date: number;
  name: string;
  surname: string;
}

const AppointmentCreated: React.FC = () => {
  const { reset } = useNavigation();
  const { params } = useRoute();

  const { date, name, surname } = params as RouteParams;

  const handleBackPressed = useCallback(() => {
    reset({
      routes: [{ name: 'Dashboard' }],
      index: 0,
    });
  }, [reset]);

  const formattedDate = useMemo(() => {
    const value = format(
      date,
      "EEEE', dia' dd 'de' MMMM 'de' yyyy 'às' HH:mm'h'",
      { locale: ptBR },
    );

    return value.substring(0, 1).toUpperCase() + value.substring(1);
  }, [date]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Agendamento concluído</Title>
      <Description>
        {formattedDate} com {name} {surname}
      </Description>

      <BackButton onPress={handleBackPressed}>
        <BackButtonText>Voltar</BackButtonText>
      </BackButton>
    </Container>
  );
};

export default AppointmentCreated;
