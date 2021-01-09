import React, { useRef, useCallback, useState } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';

import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import { useAuth } from '../../hooks/auth';

import loadingGif from '../../assets/loading.gif';

import {
  Container,
  Contate,
  BackButton,
  Title,
  UserAvatarButton,
  UserAvatar,
  ModalContainer,
  ModalContent,
} from './styles';

interface ProfileFormProps {
  name: string;
  surname: string;
  email: string;
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const SignUp: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();
  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);

  const surnameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);
  const [inputEditable, setInputEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = useCallback(
    async (data: ProfileFormProps) => {
      try {
        formRef.current?.setErrors({});
        setModalVisible(true);

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório!'),
          surname: Yup.string().required('Sobrenome é obrigatório!'),
          email: Yup.string()
            .required('E-email é obrigatório')
            .email('Digite um email valido!'),
          old_password: Yup.string(),
          new_password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string()
              .required()
              .min(8, 'Nova senha deve conter no mínimo 8 caracteres'),
            otherwise: Yup.string(),
          }),

          confirm_password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string()
              .nullable()
              .oneOf(
                [Yup.ref('new_password'), null],
                'Confirmação de senha incorreta',
              ),
            otherwise: Yup.string(),
          }),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        if (data.old_password) {
          const { old_password, new_password, confirm_password } = data;
          const passwordData = {
            old_password,
            new_password,
            confirm_password,
          };
          await api.put('/users/password', passwordData);

          Alert.alert('Sucesso!', 'Sua senha foi alterada com sucesso');
          setInputEditable(false);
          formRef.current?.reset();
          formRef.current?.setData(user);
        } else {
          const { name, surname, email } = data;
          const profileData = {
            name,
            surname,
            email,
          };

          await api.put('/users', profileData).then((response) => {
            updateUser(response.data);
          });

          Alert.alert('Sucesso!', 'Perfil atualizado com sucesso');
        }
        setModalVisible(false);
      } catch (err) {
        setModalVisible(false);
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { data } = err.response;

          Alert.alert('Erro ao atualizar suas informações', data.detail);
        }
      }
    },
    [updateUser, user],
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleInputChange = useCallback(() => {
    const value = formRef.current?.getFieldValue('old_password').length;
    if (value === 0 || value > 1) {
      setInputEditable(true);
    } else {
      setInputEditable(false);
      formRef.current?.clearField('new_password');
      formRef.current?.clearField('confirm_password');
    }
  }, []);

  const handleSelectAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Alerta',
        'Você precisa da permissão de acesso as suas fotos!',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.cancelled) {
      return;
    }

    const { uri } = result;
    const data = new FormData();
    data.append('file', {
      name: 'image.jpg',
      type: 'image/jpg',
      uri,
    } as any);

    setLoading(true);
    api
      .put('/users/file', data)
      .then((response) => {
        updateUser(response.data);
        setLoading(false);
        Alert.alert(
          'Sucesso!',
          'Sua foto de perfil foi atualizada com sucesso',
        );
      })
      .catch((error) => {
        setLoading(false);
        if (error.response.status === 401) {
          signOut();
        } else {
          Alert.alert(
            'Error',
            'Ocorreu um error ao tentar altera sua foto de avatar tente novamente',
          );
        }
      });
  }, [signOut, updateUser]);

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Contate>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton
              onPress={handleSelectAvatar}
              style={
                loading ? { backgroundColor: 'white', borderRadius: 100 } : {}
              }
            >
              <UserAvatar
                source={loading ? loadingGif : { uri: user.avatar }}
              />
            </UserAvatarButton>

            <View>
              <Title>Meu perfil</Title>
            </View>

            <Form initialData={user} ref={formRef} onSubmit={handleSubmit}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                type="text"
                placeholder="Nome"
                returnKeyType="next"
                filled
                onSubmitEditing={() => {
                  surnameInputRef.current?.focus();
                }}
              />

              <Input
                ref={surnameInputRef}
                autoCapitalize="words"
                name="surname"
                icon="user"
                type="text"
                placeholder="Sobrenome"
                returnKeyType="next"
                filled
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
                returnKeyType="send"
                filled
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Input
                containerStyle={{ marginTop: 16 }}
                autoCapitalize="none"
                name="old_password"
                icon="lock"
                type="password"
                security
                placeholder="Senha atual"
                textContentType="newPassword"
                returnKeyType="next"
                onChange={handleInputChange}
                onSubmitEditing={() => {
                  newPasswordInputRef.current?.focus();
                }}
              />
              <Input
                ref={newPasswordInputRef}
                autoCapitalize="none"
                name="new_password"
                icon="lock"
                type="password"
                security
                placeholder="Nova senha"
                textContentType="newPassword"
                returnKeyType="next"
                editable={inputEditable}
                isEditable={inputEditable}
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
                placeholder="Confirma nova senha"
                textContentType="newPassword"
                returnKeyType="send"
                editable={inputEditable}
                isEditable={inputEditable}
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />
            </Form>

            <Button onPress={() => formRef.current?.submitForm()}>
              Confirma mudanças
            </Button>

            <Button
              style={{ marginTop: 20, backgroundColor: '#f50505' }}
              onPress={signOut}
            >
              Sair
            </Button>
          </Contate>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <ModalContainer>
          <ModalContent>
            <Image source={loadingGif} />
          </ModalContent>
        </ModalContainer>
      </Modal>
    </Container>
  );
};

export default SignUp;
