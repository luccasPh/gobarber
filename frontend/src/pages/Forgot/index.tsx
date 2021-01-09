import React, { useCallback, useRef, useState } from 'react';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { Link } from 'react-router-dom';

import { getValidationErrors } from '../../utils/validation';
import { useToast } from '../../hooks/toast';

import logoImg from '../../assets/logo.svg';
import loadingImg from '../../assets/loading.svg';

import Button from '../../components/Button';
import Input from '../../components/Input';

import { Container, Content, AnimationContainer, Background } from './styles';
import api from '../../services/api';

interface ForgotFormProps {
  email: string;
}

const Forgot: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: ForgotFormProps, { reset }) => {
      try {
        formRef.current?.setErrors({});
        setLoading(true);
        reset();

        const schema = Yup.object().shape({
          email: Yup.string()
            .required('Digite seu e-mail')
            .email('Digite um email valido!'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const response = await api.post('/sessions/forgot-password', {
          email: data.email,
        });
        addToast({
          type: 'info',
          title: 'Recuperação de senha',
          description: response.data.detail,
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { data } = err.response;

          addToast({
            type: 'error',
            title: 'Erro ao tenta recupera senha',
            description: data.detail,
          });
        }
      }
    },
    [addToast],
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Recuperar senha</h1>

            <Input
              name="email"
              icon={FiMail}
              type="text"
              placeholder="E-mail"
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
                'Recupera'
              )}
            </Button>
          </Form>

          <Link to="/">
            <FiArrowLeft />
            Voltar ao logon
          </Link>
        </AnimationContainer>
      </Content>

      <Background />
    </Container>
  );
};

export default Forgot;
