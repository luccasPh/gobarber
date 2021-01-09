import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Dashboard from '../pages/Dashboard';
import SelectProvider from '../pages/CreateAppointment/SelectProvider';
import SelectDate from '../pages/CreateAppointment/SelectDate';
import AppointmentCreated from '../pages/AppointmentCreated';
import Profile from '../pages/Profile';

const User = createStackNavigator();

const UserRoutes: React.FC = () => (
  <User.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#312e38' },
    }}
  >
    <User.Screen name="Dashboard" component={Dashboard} />
    <User.Screen name="SelectProvider" component={SelectProvider} />
    <User.Screen name="SelectDate" component={SelectDate} />
    <User.Screen name="AppointmentCreated" component={AppointmentCreated} />

    <User.Screen name="Profile" component={Profile} />
  </User.Navigator>
);

export default UserRoutes;
