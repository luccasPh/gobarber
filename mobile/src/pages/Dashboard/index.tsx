/* eslint-disable import/no-duplicates */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/build/Feather';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import SkeletonContent from 'react-native-skeleton-content';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UserAvatar,
  AppointmentsList,
  AppointmentListTitle,
  AppointmentsListFooterTitle,
  AppointmentContainer,
  ProviderInfo,
  ProviderAvatar,
  ProviderName,
  AppointmentInfo,
  AppointmentMeta,
  AppointmentMetaText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
  NoAppointment,
  NoAppointmentText,
} from './styles';

export interface AppointmentItem {
  id: string;
  date: string;
  provider: {
    name: string;
    surname: string;
    address: string;
    avatar: string;
  };
}

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [block, setBlock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.addListener('focus', () => {
      setBlock(false);
      api
        .get('/users/me')
        .then((response) => {
          setAppointments(response.data);
          setLoading(false);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            signOut();
          }
        });
    });
  }, [navigation, signOut]);

  const appointmentsFormatted = useMemo(() => {
    return appointments.map(({ id, date, provider }) => {
      const value = format(new Date(date), "dd 'de' MMMM", { locale: ptBR });
      return {
        id,
        provider,
        day:
          value.substring(0, 6) +
          value.substring(6, 7).toUpperCase() +
          value.substring(7),
        hour: format(new Date(date), 'HH:00'),
      };
    });
  }, [appointments]);

  const navigateToProfile = useCallback(() => {
    setBlock(true);
    navigation.navigate('Profile');
  }, [navigation]);

  const navigateToCreateAppointment = useCallback(() => {
    if (!block) {
      setBlock(true);
      navigation.navigate('SelectProvider');
    }
  }, [block, navigation]);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Bem vindo, {'\n'}
          <UserName>
            {user.name} {user.surname}
          </UserName>
        </HeaderTitle>

        <ProfileButton onPress={navigateToProfile}>
          <UserAvatar source={{ uri: user.avatar }} />
        </ProfileButton>
      </Header>

      <SkeletonContent
        containerStyle={{ flex: 1 }}
        boneColor="#3E3B47"
        highlightColor="#524F5A"
        isLoading={loading}
        layout={[
          {
            key: '1',
            width: 300,
            height: 50,
            marginBottom: 24,
            marginLeft: 24,
            marginTop: 24,
          },
          {
            key: '2',
            width: 300,
            height: 190,
            marginBottom: 16,
            marginLeft: 24,
          },
          { key: '3', width: 300, height: 190, marginLeft: 24 },
        ]}
      >
        {appointments.length > 0 ? (
          <AppointmentsList
            data={appointmentsFormatted}
            keyExtractor={(appointment) => appointment.id}
            ListHeaderComponent={
              <AppointmentListTitle>Compromissos marcado</AppointmentListTitle>
            }
            ListFooterComponent={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <AppointmentsListFooterTitle />
            }
            renderItem={({ item: appointment }) => (
              <AppointmentContainer>
                <ProviderInfo>
                  <ProviderAvatar
                    source={{ uri: appointment.provider.avatar }}
                  />

                  <ProviderName>
                    {appointment.provider.name} {appointment.provider.surname}
                  </ProviderName>
                </ProviderInfo>

                <AppointmentInfo>
                  <AppointmentMeta>
                    <Icon name="home" size={24} color="#ff9000" />
                    <AppointmentMetaText>
                      {appointment.provider.address}
                    </AppointmentMetaText>
                  </AppointmentMeta>

                  <AppointmentMeta>
                    <Icon name="calendar" size={24} color="#ff9000" />
                    <AppointmentMetaText>{appointment.day}</AppointmentMetaText>
                  </AppointmentMeta>

                  <AppointmentMeta>
                    <Icon name="clock" size={24} color="#ff9000" />
                    <AppointmentMetaText>
                      {appointment.hour}h
                    </AppointmentMetaText>
                  </AppointmentMeta>
                </AppointmentInfo>
              </AppointmentContainer>
            )}
          />
        ) : (
          <NoAppointment>
            <NoAppointmentText>Sem compromisso mercado</NoAppointmentText>
          </NoAppointment>
        )}
      </SkeletonContent>
      {!loading && (
        <CreateAppointmentButton onPress={navigateToCreateAppointment}>
          <CreateAppointmentButtonText>
            Novo agendamento
          </CreateAppointmentButtonText>
        </CreateAppointmentButton>
      )}
    </Container>
  );
};

export default Dashboard;
