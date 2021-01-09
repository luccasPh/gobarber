import React, { useCallback, useRef, useEffect, useState } from 'react';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { getValidationErrors } from '../../utils/validation';
import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

import logoImg from '../../assets/logo.svg';
import loadingImg from '../../assets/loading.svg';

import Button from '../../components/Button';
import Input from '../../components/Input';

import { Container, Content, AnimationContainer, Background } from './styles';

interface SignInFormProps {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { signIn } = useAuth();
  const { addToast } = useToast();
  const history = useHistory();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: SignInFormProps) => {
      try {
        formRef.current?.setErrors({});
        setLoading(true);
        const schema = Yup.object().shape({
          email: Yup.string()
            .required('Digite seu e-mail')
            .email('Digite um email valido!'),
          password: Yup.string().required('Digite sua senha!'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await signIn({
          email: data.email,
          password: data.password,
          host: 'web',
        });

        history.push('/dashboard');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { data } = err.response;

          addToast({
            type: 'error',
            title: 'Erro na autenticação',
            description: data.detail,
          });
        }
      }
      setLoading(false);
    },
    [signIn, addToast, history],
  );

  useEffect(() => {
    const redirect = location.search.replace('?redirect=', '');
    if (redirect) {
      addToast({
        type: 'info',
        title: 'Ateção',
        description: 'Faça login para continuar',
      });
    }
  }, [addToast, location.search]);

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Faça seu login</h1>

            <Input
              name="email"
              icon={FiMail}
              type="text"
              placeholder="E-mail"
            />

            <Input
              name="password"
              icon={FiLock}
              type="password"
              placeholder="Senha"
            />

            <Button
              type="submit"
              disabled={loading}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <img
                  src={loadingImg}
                  width="40px"
                  height="40px"
                  alt="loading"
                  style={{ marginTop: 5 }}
                />
              ) : (
                'Entrar'
              )}
            </Button>

            <Link to="/forgot">Esqueci minha senha</Link>
          </Form>

          <Link to="signup">
            <FiLogIn />
            Criar conta
          </Link>
        </AnimationContainer>
      </Content>

      <Background />
    </Container>
  );
};

export default SignIn;
