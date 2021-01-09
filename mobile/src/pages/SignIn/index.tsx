import React, { useCallback, useRef, useState } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';
import {
  View,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';

import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../utils/getValidationErrors';
import { useAuth } from '../../hooks/auth';

import {
  Container,
  Title,
  ForgotPassword,
  ForgotPasswordText,
  CreateAccountButton,
  CreateAccountText,
  ModalContainer,
  ModalContent,
} from './styles';

import logoImg from '../../assets/logo.png';
import loadingGif from '../../assets/loading.gif';

interface SignInFormProps {
  email: string;
  password: string;
  host: string;
}

const SignIn: React.FC = () => {
  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const { signIn } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignIn = useCallback(
    async (data: SignInFormProps) => {
      try {
        formRef.current?.setErrors({});
        setModalVisible(true);

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
          host: 'mobile',
        });
      } catch (err) {
        setModalVisible(false);
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { data } = err.response;
          Alert.alert('Erro na autenticação!', data.detail);
        }
      }
    },
    [signIn],
  );

  console.log('ok');
  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Container>
            <Image source={logoImg} />

            <View>
              <Title>Faça seu logon</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignIn}>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                type="text"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />
              <Input
                ref={passwordInputRef}
                autoCapitalize="none"
                name="password"
                icon="lock"
                type="password"
                security
                placeholder="Senha"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />
            </Form>
            <Button
              onPress={() => {
                formRef.current?.submitForm();
              }}
            >
              Entrar
            </Button>

            <ForgotPassword onPress={() => navigation.navigate('Forgot')}>
              <ForgotPasswordText>Esqueci minha senha</ForgotPasswordText>
            </ForgotPassword>
          </Container>

          <CreateAccountButton onPress={() => navigation.navigate('SignUp')}>
            <Icon name="log-in" size={20} color="#ff9000" />
            <CreateAccountText>Criar uma conta</CreateAccountText>
          </CreateAccountButton>
        </ScrollView>

        <Modal animationType="slide" transparent visible={modalVisible}>
          <ModalContainer>
            <ModalContent>
              <Image source={loadingGif} />
            </ModalContent>
          </ModalContainer>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignIn;
