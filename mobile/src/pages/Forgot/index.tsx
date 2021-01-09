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
import api from '../../services/api';

interface ForgotInFormProps {
  email: string;
}

const Forgot: React.FC = () => {
  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const handleSignIn = useCallback(async (data: ForgotInFormProps) => {
    try {
      formRef.current?.setErrors({});
      setModalVisible(true);

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
      setModalVisible(false);
      Alert.alert('Recuperação de senha', response.data.detail);
    } catch (err) {
      setModalVisible(false);
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);
      } else {
        const { data } = err.response;
        Alert.alert('Error!', data.detail);
      }
    }
  }, []);

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
          <Image source={logoImg} />

          <View>
            <Title>Recuperar senha</Title>
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
            />
          </Form>
          <Button
            onPress={() => {
              formRef.current?.submitForm();
            }}
          >
            Recupera
          </Button>
        </Container>
      </ScrollView>
      <BackToSignInButton onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="#fff" />
        <BackToSignInText>Voltar para logon</BackToSignInText>
      </BackToSignInButton>

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

export default Forgot;
