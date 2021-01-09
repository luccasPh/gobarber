import React, { useCallback, useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';

import Routes from './src/routes';
import AppProvider from './src/hooks';
import api from './src/services/api';

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    RobotoSlabMedium: require('./assets/fonts/RobotoSlab-Medium.ttf'),
    RobotoSlabRegular: require('./assets/fonts/RobotoSlab-Regular.ttf'),
  });
  const [apiIsReady, setApiIsReady] = useState(false);

  const callApi = useCallback(async () => {
    try {
      await api.get('/api');
    } finally {
      setApiIsReady(true);
      await SplashScreen.hideAsync();
    }
  }, []);

  const splashScreen = useCallback(async () => {
    await SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    splashScreen();
    callApi();
  }, [callApi, splashScreen]);

  if (!fontsLoaded && !apiIsReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#312e38"
        translucent
      />
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: '#312e38' }}>
          <Routes />
        </View>
      </AppProvider>
    </NavigationContainer>
  );
};

export default App;
