import React, { useRef, useCallback, useState } from 'react';
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
  Alert,
  Modal,
} from 'react-native';

import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';

import {
  Container,
  Title,
  BackToSignInButton,
  BackToSignInText,
  ModalContainer,
  ModalContent,
} from './styles';

import logoImg from '../../assets/logo.png';
import loadingGif from '../../assets/loading.gif';

interface SignUpFormProps {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirm_password: string;
}

const SignUp: React.FC = () => {
  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);

  const surnameRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignUp = useCallback(
    async (data: SignUpFormProps) => {
      try {
        formRef.current?.setErrors({});
        setModalVisible(true);

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório!'),
          surname: Yup.string().required('Nome é obrigatório!'),
          email: Yup.string()
            .required('E-email é obrigatório')
            .email('Digite um email valido!'),
          password: Yup.string()
            .required('Digite uma senha!')
            .min(8, 'Senha deve conter no mínimo 8 caracteres!'),
          confirm_password: Yup.string()
            .required('Confirme sua senha!')
            .min(8, 'Senha deve conter no mínimo 8 caracteres!'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const response = await api.post('/users', data);
        setModalVisible(false);
        const message: string = response.data.detail;
        navigation.navigate('UserCreated', { message });
      } catch (err) {
        setModalVisible(false);
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { data } = err.response;

          Alert.alert('Erro no cadastro', data.detail);
        }
      }
    },
    [navigation],
  );

  return (
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
          <Image source={logoImg} style={{ marginTop: 40 }} />

          <View>
            <Title>Crie sua conta</Title>
          </View>

          <Form ref={formRef} onSubmit={handleSignUp}>
            <Input
              autoCapitalize="words"
              name="name"
              icon="user"
              type="text"
              placeholder="Nome"
              returnKeyType="next"
              onSubmitEditing={() => {
                surnameRef.current?.focus();
              }}
            />
            <Input
              ref={surnameRef}
              autoCapitalize="words"
              name="surname"
              icon="user"
              type="text"
              placeholder="Sobrenome"
              returnKeyType="next"
              onSubmitEditing={() => {
                emailInputRef.current?.focus();
              }}
            />
            <Input
              ref={emailInputRef}
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
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmInputRef.current?.focus();
              }}
            />
            <Input
              ref={confirmInputRef}
              autoCapitalize="none"
              name="confirm_password"
              icon="lock"
              type="password"
              security
              placeholder="Confirma senha"
              textContentType="newPassword"
              returnKeyType="send"
              onSubmitEditing={() => {
                formRef.current?.submitForm();
              }}
            />
          </Form>
          <Button onPress={() => formRef.current?.submitForm()}>Criar</Button>
        </Container>

        <BackToSignInButton onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#fff" />
          <BackToSignInText>Voltar para logon</BackToSignInText>
        </BackToSignInButton>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <ModalContainer>
          <ModalContent>
            <Image source={loadingGif} />
          </ModalContent>
        </ModalContainer>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
