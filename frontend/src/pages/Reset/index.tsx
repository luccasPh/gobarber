import React, { useCallback, useRef, useState } from 'react';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { FiLock } from 'react-icons/fi';
import { useHistory, useLocation } from 'react-router-dom';

import { getValidationErrors } from '../../utils/validation';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';

import logoImg from '../../assets/logo.svg';
import loadingImg from '../../assets/loading.svg';

import Button from '../../components/Button';
import Input from '../../components/Input';

import { Container, Content, AnimationContainer, Background } from './styles';

interface ResetFormProps {
  new_password: string;
  confirm_password: string;
}

const Reset: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const history = useHistory();
  const location = useLocation();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: ResetFormProps) => {
      try {
        formRef.current?.setErrors({});
        setLoading(true);

        const schema = Yup.object().shape({
          new_password: Yup.string()
            .required('Digite uma senha!')
            .min(8, 'Senha deve conter no mínimo 8 caracteres!'),
          confirm_password: Yup.string()
            .nullable()
            .oneOf([Yup.ref('new_password'), null], 'Confirmação incorreta'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const token = location.search.replace('?token=', '');
        if (!token) {
          throw new Error();
        }

        const { new_password, confirm_password } = data;
        await api.post('/sessions/reset-password', {
          new_password,
          confirm_password,
          token,
        });

        history.push('/');

        addToast({
          type: 'success',
          title: 'Senha alterada com sucesso!',
          description:
            'Sua senha foi alterada, você ja pode fazer login novamente',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { data } = err.response;

          addToast({
            type: 'error',
            title: 'Erro ao resetar senha',
            description: data.detail,
          });
        }
        setLoading(false);
      }
    },
    [addToast, history, location.search],
  );

  return (
    <Container>
      <Background />

      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Resetar senha</h1>
            <Input
              name="new_password"
              icon={FiLock}
              type="password"
              placeholder="Nova senha"
            />

            <Input
              name="confirm_password"
              icon={FiLock}
              type="password"
              placeholder="Confirma senha"
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
                'Confirma'
              )}
            </Button>
          </Form>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default Reset;
