import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiArrowLeft,
  FiHome,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { getValidationErrors } from '../../utils/validation';
import { useToast } from '../../hooks/toast';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import Button from '../../components/Button';
import Input from '../../components/Input';

import loadingImg from '../../assets/loading.svg';

import { Container, Content, AvatarInput } from './styles';

interface ProfileFormProps {
  name: string;
  surname: string;
  address: string;
  email: string;
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const { user, updateUser, signOut } = useAuth();

  const [cursorPoint, setCursorPoint] = useState('not-allowed');
  const [inputDisabled, setInputDisabled] = useState(true);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingUpdateProfile, setUpdatingProfile] = useState(false);

  const handleSubmit = useCallback(
    async (data: ProfileFormProps) => {
      try {
        formRef.current?.setErrors({});
        setUpdatingProfile(true);

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório!'),
          surname: Yup.string().required('Sobrenome é obrigatório!'),
          address: Yup.string().required('Endereço é obrigatório'),
          email: Yup.string()
            .required('E-email é obrigatório')
            .email('Digite um email valido!'),
          old_password: Yup.string(),
          new_password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string()
              .required('Se deseja altera sua senha preencha este campo')
              .min(8, 'Senha deve conter no mínimo 8 caracteres'),
            otherwise: Yup.string(),
          }),

          confirm_password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string()
              .nullable()
              .oneOf([Yup.ref('new_password'), null], 'Confirmação incorreta'),
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

          setInputDisabled(true);
          setUpdatingProfile(false);
          formRef.current?.reset();
          formRef.current?.setData(user);
          addToast({
            type: 'success',
            title: 'Senha atualizada',
            description: 'Sua senha foi atualizada com sucesso',
          });
        } else {
          const { name, surname, address, email } = data;
          const profileData = {
            name,
            surname,
            address,
            email,
          };

          await api.put('/users', profileData).then((response) => {
            updateUser(response.data);
          });

          setUpdatingProfile(false);
          addToast({
            type: 'success',
            title: 'Perfil atualizado',
            description:
              'Suas informações de perfil foram atualizada com sucesso',
          });
        }
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
        } else {
          const { response } = err;
          if (response.status === 401) {
            signOut();
          } else {
            addToast({
              type: 'error',
              title: 'Erro ao atualizar informações',
              description: response.data.detail,
            });
          }
        }
        setUpdatingProfile(false);
      }
    },
    [addToast, signOut, updateUser, user],
  );

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();
        setLoadingAvatar(true);
        data.append('file', e.target.files[0]);
        api
          .put('/users/file', data)
          .then((response) => {
            updateUser(response.data);
            setLoadingAvatar(false);
            addToast({
              type: 'success',
              title: 'Avatar atualizado',
              description: 'Sua foto de avatar foi atualizada com sucesso',
            });
          })
          .catch((error) => {
            if (error.response.status === 401) {
              signOut();
            } else {
              addToast({
                type: 'error',
                title: 'Error ao tenta altera avatar',
                description:
                  'Ocorreu um error ao tentar altera sua foto de avatar tente novamente',
              });
            }
          });
      }
    },
    [addToast, signOut, updateUser],
  );

  const handleInputChange = useCallback(() => {
    if (formRef.current?.getFieldValue('old_password').length > 0) {
      setInputDisabled(false);
      setCursorPoint('text');
    } else {
      setInputDisabled(true);
      setCursorPoint('not-allowed');
      formRef.current?.clearField('new_password');
      formRef.current?.clearField('confirm_password');
    }
  }, []);

  return (
    <Container>
      <header>
        <div>
          <Link to="/dashboard">
            <FiArrowLeft />
          </Link>
        </div>
      </header>

      <Content>
        <Form ref={formRef} initialData={user} onSubmit={handleSubmit}>
          <AvatarInput>
            {!loadingAvatar ? (
              <>
                <img src={user.avatar} alt={user.name} />
                <label htmlFor="avatar">
                  <FiCamera />
                  <input
                    type="file"
                    id="avatar"
                    onChange={handleAvatarChange}
                  />
                </label>
              </>
            ) : (
              <div style={{ background: '#1F1E22', borderRadius: 100 }}>
                <img src={loadingImg} alt="Loading" />
              </div>
            )}
          </AvatarInput>

          <h1>Meu Perfil</h1>

          <Input
            name="name"
            icon={FiUser}
            type="text"
            placeholder="Nome"
            filled
          />

          <Input
            name="surname"
            icon={FiUser}
            type="text"
            placeholder="Sobrenome"
            filled
          />

          <Input
            name="address"
            icon={FiHome}
            type="text"
            placeholder="Endereço"
            filled
          />

          <Input
            name="email"
            icon={FiMail}
            type="text"
            placeholder="E-mail"
            filled
          />

          <Input
            onChange={handleInputChange}
            containerStyle={{ marginTop: 24 }}
            name="old_password"
            icon={FiLock}
            type="password"
            placeholder="Senha atual"
          />

          <Input
            name="new_password"
            icon={FiLock}
            type="password"
            placeholder="Nova senha"
            style={{ cursor: cursorPoint }}
            disabled={inputDisabled}
            isDisabled={inputDisabled}
          />

          <Input
            name="confirm_password"
            icon={FiLock}
            type="password"
            placeholder="Confirma nova senha"
            style={{ cursor: cursorPoint }}
            disabled={inputDisabled}
            isDisabled={inputDisabled}
          />

          <Button type="submit">
            {loadingUpdateProfile ? (
              <img
                src={loadingImg}
                width="40px"
                height="40px"
                alt="loading"
                style={{ marginTop: 5 }}
              />
            ) : (
              'Confirma mudanças'
            )}
          </Button>
        </Form>
      </Content>
    </Container>
  );
};

export default Profile;
