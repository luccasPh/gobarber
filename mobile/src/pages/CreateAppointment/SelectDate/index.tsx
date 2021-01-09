/* eslint-disable import/no-duplicates */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@expo/vector-icons/build/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Alert, Platform, Modal, Image } from 'react-native';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import SkeletonContent from 'react-native-skeleton-content';

import { useAuth } from '../../../hooks/auth';
import api from '../../../services/api';
import swapArrayOfProviders from '../../../utils/swapArrayOfProviders';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Contate,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Title,
  Calendar,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
  ModalContainer,
  ModalContent,
} from './styles';

import loadingGif from '../../../assets/loading.gif';

interface RouteParams {
  providerId: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  surname: string;
  avatar: string;
}

interface AvalabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { signOut, user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();

  const { providerId } = route.params as RouteParams;
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(providerId);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [avalability, setAvalability] = useState<AvalabilityItem[]>([]);
  const [selectedHour, setSelectedHour] = useState(0);
  const [block, setBlock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    navigation.addListener('focus', () => {
      setBlock(false);
      api
        .get('/providers/day-availability', {
          params: {
            provider_id: selectedProvider,
            day: selectedDate.getDate(),
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
          },
        })
        .then((response) => {
          setAvalability(response.data);
          setLoading(false);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            signOut();
          }
        });
    });
  }, [navigation, selectedDate, selectedProvider, signOut]);

  useEffect(() => {
    api
      .get('/providers')
      .then((response) => {
        const providersSwapped = swapArrayOfProviders(
          response.data,
          providerId,
        );
        setProviders(providersSwapped);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          signOut();
        }
      });
  }, [providerId, signOut]);

  useEffect(() => {
    api
      .get('/providers/day-availability', {
        params: {
          provider_id: selectedProvider,
          day: selectedDate.getDate(),
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear(),
        },
      })
      .then((response) => {
        setAvalability(response.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          signOut();
        }
      });
  }, [selectedDate, selectedProvider, signOut]);

  const handleSelectProvider = useCallback((id: string) => {
    setSelectedProvider(id);
    setSelectedHour(0);
  }, []);

  const handleOpenDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  }, []);

  const handleDateChange = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      setSelectedHour(0);
    }
  }, []);

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      setModalVisible(true);
      const provider = providers.find(
        (provider) => provider.id === selectedProvider,
      );
      if (selectedHour === 0) {
        Alert.alert('Alerta!', 'Por favor selecione um horário valido');
        setModalVisible(false);
        return;
      }

      if (provider && !block) {
        const date = new Date(selectedDate);
        date.setHours(selectedHour);
        date.setMinutes(0);
        await api.post('/appointments', {
          provider_id: selectedProvider,
          date,
        });

        const { name, surname } = provider;
        setSelectedHour(0);
        setBlock(true);
        setModalVisible(false);
        navigation.navigate('AppointmentCreated', {
          date: date.getTime(),
          name,
          surname,
        });
      }
    } catch (error) {
      setModalVisible(false);
      if (error.response.status === 401) {
        signOut();
      } else {
        Alert.alert(
          'Error!',
          'Ocorreu um erro ao tenta criar seu agendamento, tente novamente',
        );
      }
    }
  }, [
    block,
    navigation,
    providers,
    selectedDate,
    selectedHour,
    selectedProvider,
    signOut,
  ]);

  const selectedDateAsText = useMemo(() => {
    const value = format(selectedDate, "'Dia' dd 'de' MMMM", {
      locale: ptBR,
    });
    return (
      value.substring(0, 10) +
      value.substring(10, 11).toUpperCase() +
      value.substring(11)
    );
  }, [selectedDate]);

  const morningAvalability = useMemo(() => {
    return avalability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [avalability]);

  const afternoonAvalability = useMemo(() => {
    return avalability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [avalability]);

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Data e Horário</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar }} />
      </Header>

      <Contate>
        <ProvidersListContainer>
          <SkeletonContent
            containerStyle={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            boneColor="#3E3B47"
            highlightColor="#524F5A"
            isLoading={loading}
            layout={[
              { key: '1', width: 200, height: 50, marginLeft: 10 },
              { key: '2', width: 200, height: 50, marginLeft: 10 },
            ]}
          >
            <ProvidersList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={providers}
              keyExtractor={(provider) => provider.id}
              renderItem={({ item: provider }) => (
                <ProviderContainer
                  onPress={() => handleSelectProvider(provider.id)}
                  selected={provider.id === selectedProvider}
                >
                  <ProviderAvatar source={{ uri: provider.avatar }} />
                  <ProviderName
                    selected={provider.id === selectedProvider}
                    numberOfLines={1}
                  >
                    {provider.name} {provider.surname}
                  </ProviderName>
                </ProviderContainer>
              )}
            />
          </SkeletonContent>
        </ProvidersListContainer>

        <SkeletonContent
          containerStyle={{ flex: 1 }}
          boneColor="#3E3B47"
          highlightColor="#524F5A"
          isLoading={loading}
          layout={[
            {
              key: '1',
              width: 320,
              height: 190,
              marginBottom: 10,
              marginLeft: 20,
            },
            {
              key: '2',
              width: 320,
              height: 190,
              marginLeft: 20,
            },
          ]}
        >
          <Calendar>
            <Title>Escolha a data</Title>

            <OpenDatePickerButton onPress={handleOpenDatePicker}>
              <OpenDatePickerButtonText>
                {selectedDateAsText}
              </OpenDatePickerButtonText>
            </OpenDatePickerButton>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="calendar"
                onChange={handleDateChange}
              />
            )}
          </Calendar>

          <Schedule>
            <Title>Escolha o horário</Title>

            <Section>
              <SectionTitle>Manhã</SectionTitle>

              <SectionContent>
                {morningAvalability.map(
                  ({ hourFormatted, available, hour }) => (
                    <Hour
                      enabled={available}
                      selected={selectedHour === hour}
                      onPress={() => handleSelectHour(hour)}
                      available={available}
                      key={hourFormatted}
                    >
                      <HourText selected={selectedHour === hour}>
                        {hourFormatted}
                      </HourText>
                    </Hour>
                  ),
                )}
              </SectionContent>
            </Section>

            <Section>
              <SectionTitle>Tarde</SectionTitle>

              <SectionContent>
                {afternoonAvalability.map(
                  ({ hourFormatted, available, hour }) => (
                    <Hour
                      enabled={available}
                      selected={selectedHour === hour}
                      onPress={() => handleSelectHour(hour)}
                      available={available}
                      key={hourFormatted}
                    >
                      <HourText selected={selectedHour === hour}>
                        {hourFormatted}
                      </HourText>
                    </Hour>
                  ),
                )}
              </SectionContent>
            </Section>
          </Schedule>
        </SkeletonContent>
        {!loading && (
          <CreateAppointmentButton onPress={handleCreateAppointment}>
            <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
          </CreateAppointmentButton>
        )}
      </Contate>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <ModalContainer>
          <ModalContent>
            <Image source={loadingGif} />
          </ModalContent>
        </ModalContainer>
      </Modal>
    </Container>
  );
};

export default CreateAppointment;
