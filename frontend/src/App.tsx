import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AppProvider from './hooks';
import Routes from './routes';
import api from './services/api';

import GlobalStyle from './styles/global';

const App: React.FC = () => {
  useEffect(() => {
    api.get('/api');
  }, []);
  return (
    <Router>
      <AppProvider>
        <Routes />
      </AppProvider>
      <GlobalStyle />
    </Router>
  );
};

export default App;
