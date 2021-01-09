import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import api from '../../services/api';

import { useToast } from '../../hooks/toast';
import logoImg from '../../assets/logo.svg';
import desktopImg from '../../assets/desktop.svg';
import smartphoneImg from '../../assets/smartphone.svg';

import { Container, Platform, Text } from './styles';

const Activate: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { addToast } = useToast();

  const [type, setType] = useState('');

  const userActivation = useCallback(async () => {
    try {
      const token = location.search.replace('?token=', '');
      if (!token) {
        history.push('/');
        addToast({
          type: 'error',
          title: 'Error de confirmação',
          description: 'Token inválido ',
        });
      } else {
        const response = await api.put('/users/activate', {
          token,
        });
        setType(response.data.type);
      }
    } catch (error) {
      const { response } = error;
      history.push('/');
      addToast({
        type: 'error',
        title: 'Error de confirmação',
        description: response.data.detail,
      });
    }
  }, [addToast, history, location.search]);

  useEffect(() => {
    userActivation();
  }, [userActivation]);

  if (!type) {
    return <div />;
  }

  return (
    <Container>
      <img src={logoImg} style={{ height: 350, width: 350 }} alt="logo" />
      <Text>
        <h1>
          Parabéns sua conta foi ativada, agora você já pode fazer login em uma
          da nossa plataforma.
        </h1>
      </Text>
      <Platform>
        {type === 'provider' && (
          <Link to="/">
            <img
              src={desktopImg}
              style={{ height: 30, width: 30 }}
              alt="desktop"
            />
            <p>Computador</p>
          </Link>
        )}
        <a
          href="https://expo.io/@luccasph/projects/gobarber"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={smartphoneImg}
            style={{ height: 30, width: 30 }}
            alt="smartphone"
          />
          <p>Android</p>
        </a>
      </Platform>
    </Container>
  );
};

export default Activate;
