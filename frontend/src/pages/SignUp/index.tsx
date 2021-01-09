import React, { useCallback, useRef, useState } from 'react';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { FiArrowLeft, FiUser, FiMail, FiLock, FiHome } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';

import {
  getValidationErrors,
  setProviderValidation,
  setUserValidation,
} from '../../utils/validation';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';

import logoImg from '../../assets/logo.svg';
import loadingImg from '../../assets/loading.svg';

import Button from '../../components/Button';
import Input from '../../components/Input';

import {
  Container,
  Content,
  AnimationContainer,
  Background,
  SelectOptions,
  Option,
} from './styles';

interface SignUpFormProps {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirm_password: string;
}

const SignIn: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const history = useHistory();
  const { addToast } = useToast();

  const [selectedProvider, setSelectedProvider] = useState(true);
  const [selectedClient, setSelectedClient] = useState(false);
  const [clearError, setClearError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: SignUpFormProps) => {
      try {
        formRef.current?.setErrors({});
        setLoading(true);

        let schema;
        if (selectedProvider) {
          schema = setProviderValidation();
        } else {
          schema = setUserValidation();
        }

        await schema.validate(data, {
          abortEarly: false,
        });

        const response = await api.post('/users', data);

        history.push('/');

        addToast({
          type: 'success',
          title: 'Cadastro realizado sucesso!',
          description: response.data.detail,
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { data } = err.response;

          addToast({
            type: 'error',
            title: 'Erro no cadastro',
            description: data.detail,
          });
        }
        setLoading(false);
      }
    },
    [addToast, history, selectedProvider],
  );

  const handleSelectOption = useCallback((swap: number) => {
    if (swap === 0) {
      setSelectedProvider(true);
      setSelectedClient(false);
      setClearError((value) => !value);
      formRef.current?.reset();
    } else {
      setSelectedClient(true);
      setSelectedProvider(false);
      setClearError((value) => !value);
      formRef.current?.reset();
    }
  }, []);

  return (
    <Container>
      <Background />

      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Faça seu cadastro</h1>

            <SelectOptions>
              <Option
                selected={selectedProvider}
                onClick={() => handleSelectOption(0)}
              >
                <p>Sou cabeleireiro</p>
              </Option>

              <Option
                selected={selectedClient}
                onClick={() => handleSelectOption(1)}
              >
                <p>Sou cliente</p>
              </Option>
            </SelectOptions>

            <Input
              name="name"
              icon={FiUser}
              type="text"
              placeholder="Nome"
              clear={clearError}
            />

            <Input
              name="surname"
              icon={FiUser}
              type="text"
              placeholder="Sobrenome"
              clear={clearError}
            />

            {selectedProvider && (
              <Input
                name="address"
                icon={FiHome}
                type="text"
                placeholder="Endereço"
                clear={clearError}
              />
            )}

            <Input
              name="email"
              icon={FiMail}
              type="text"
              placeholder="E-mail"
              clear={clearError}
            />

            <Input
              name="password"
              icon={FiLock}
              type="password"
              placeholder="Senha"
              clear={clearError}
            />

            <Input
              name="confirm_password"
              icon={FiLock}
              type="password"
              placeholder="Confirma Senha"
              clear={clearError}
            />

            <Button type="submit">
              {loading ? (
                <img
                  src={loadingImg}
                  width="40px"
                  height="40px"
                  alt="loading"
                  style={{ marginTop: 5 }}
                />
              ) : (
                'Cadastrar'
              )}
            </Button>
          </Form>

          <Link to="/">
            <FiArrowLeft />
            Voltar para logon
          </Link>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default SignIn;
