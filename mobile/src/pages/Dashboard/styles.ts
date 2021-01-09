import styled from 'styled-components/native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { FlatList } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import { AppointmentItem } from './index';

export const Container = styled.View`
  flex: 1;
  justify-content: space-between;
`;

export const Header = styled.View`
  padding: 24px;
  padding-top: ${getStatusBarHeight(true) + 24}px;
  background: #28262e;

  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderTitle = styled.Text`
  color: #f4ede8;
  font-size: 20px;
  font-family: 'RobotoSlabRegular';
  line-height: 28px;
`;

export const UserName = styled.Text`
  color: #ff9000;
  font-family: 'RobotoSlabMedium';
`;

export const ProfileButton = styled.TouchableOpacity``;

export const UserAvatar = styled.Image`
  width: 56px;
  height: 56px;
  border-radius: 28px;
`;

export const AppointmentsList = styled(
  FlatList as new () => FlatList<AppointmentItem>,
)`
  padding: 32px 24px 16px;
`;

export const AppointmentListTitle = styled.Text`
  font-size: 24px;
  margin-bottom: 24px;
  color: #f4ede8;
  font-family: 'RobotoSlabMedium';
`;

export const AppointmentsListFooterTitle = styled.Text`
  margin-bottom: 24px;
`;

export const AppointmentContainer = styled(RectButton)`
  background: #3e3b47;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  flex-direction: column;
`;

export const ProviderInfo = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

export const ProviderAvatar = styled.Image`
  width: 72px;
  height: 72px;
  border-radius: 36px;
`;

export const ProviderName = styled.Text`
  font-family: 'RobotoSlabMedium';
  font-size: 25px;
  color: #f4ede8;
  margin-left: 16px;
`;

export const AppointmentInfo = styled.View`
  flex: 1;
  flex-direction: column;
  margin: 0 20px;
`;

export const AppointmentMeta = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 20px;
`;

export const AppointmentMetaText = styled.Text`
  margin-left: 8px;
  color: #999591;
  font-family: 'RobotoSlabRegular';
`;

export const CreateAppointmentButton = styled(RectButton)`
  height: 50px;
  background: #ff9000;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  margin: 0 24px 14px;
`;

export const CreateAppointmentButtonText = styled.Text`
  font-family: 'RobotoSlabMedium';
  font-size: 18px;
  color: #232129;
`;

export const NoAppointment = styled.View`
  margin-top: 40%;
`;

export const NoAppointmentText = styled.Text`
  font-size: 28px;
  color: #999591;
  font-family: 'RobotoSlabMedium';
  text-align: center;
`;
