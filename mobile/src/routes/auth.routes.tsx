import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SignIn from '../pages/SignIn';
import Forgot from '../pages/Forgot';
import SignUp from '../pages/SignUp';
import UserCreated from '../pages/UserCreated';

const Auth = createStackNavigator();

const AuthRoutes: React.FC = () => (
  <Auth.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#312e38' },
    }}
  >
    <Auth.Screen name="SignIn" component={SignIn} />
    <Auth.Screen name="Forgot" component={Forgot} />
    <Auth.Screen name="SignUp" component={SignUp} />
    <Auth.Screen name="UserCreated" component={UserCreated} />
  </Auth.Navigator>
);

export default AuthRoutes;
