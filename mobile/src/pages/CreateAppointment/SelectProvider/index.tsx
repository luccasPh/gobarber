import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/build/Feather';
import SkeletonContent from 'react-native-skeleton-content';

import { useAuth } from '../../../hooks/auth';
import api from '../../../services/api';

import {
  Container,
  Header,
  HeaderTitle,
  BackButton,
  UserAvatar,
  ProvidersList,
  ProviderListTitle,
  ProviderListFooterTitle,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMeta,
  ProviderMetaText,
} from './styles';

export interface ProviderItem {
  id: string;
  name: string;
  surname: string;
  avatar: string;
}

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();

  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [block, setBlock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.addListener('focus', () => {
      setBlock(false);
      api
        .get('/providers')
        .then((response) => {
          setProviders(response.data);
          setLoading(false);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            signOut();
          }
        });
    });
  }, [navigation, signOut]);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      if (!block) {
        setBlock(true);
        navigation.navigate('SelectDate', { providerId });
      }
    },
    [block, navigation],
  );

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar }} />
      </Header>

      <SkeletonContent
        containerStyle={{ flex: 1 }}
        boneColor="#3E3B47"
        highlightColor="#524F5A"
        isLoading={loading}
        layout={[
          {
            key: '1',
            width: 320,
            height: 50,
            marginBottom: 24,
            marginLeft: 24,
            marginTop: 24,
          },
          {
            key: '2',
            width: 320,
            height: 120,
            marginBottom: 16,
            marginLeft: 24,
          },
          {
            key: '3',
            width: 320,
            height: 120,
            marginBottom: 16,
            marginLeft: 24,
          },
          { key: '4', width: 320, height: 120, marginLeft: 24 },
        ]}
      >
        <ProvidersList
          data={providers}
          keyExtractor={(provider) => provider.id}
          ListHeaderComponent={<ProviderListTitle>Selecione</ProviderListTitle>}
          ListFooterComponent={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ProviderListFooterTitle>
              Estes são todos os resultados
            </ProviderListFooterTitle>
          }
          renderItem={({ item: provider }) => (
            <ProviderContainer
              onPress={() => navigateToCreateAppointment(provider.id)}
            >
              <ProviderAvatar source={{ uri: provider.avatar }} />

              <ProviderInfo>
                <ProviderName>
                  {provider.name} {provider.surname}
                </ProviderName>

                <ProviderMeta>
                  <Icon name="calendar" size={24} color="#ff9000" />
                  <ProviderMetaText>Segunda à sexta</ProviderMetaText>
                </ProviderMeta>

                <ProviderMeta>
                  <Icon name="clock" size={24} color="#ff9000" />
                  <ProviderMetaText>8h às 18h</ProviderMetaText>
                </ProviderMeta>
              </ProviderInfo>
            </ProviderContainer>
          )}
        />
      </SkeletonContent>
    </Container>
  );
};

export default Dashboard;
