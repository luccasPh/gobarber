import * as Yup from 'yup';

interface ErrorProps {
  [key: string]: string;
}

export function setUserValidation(): Yup.ObjectSchema {
  const schema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    surname: Yup.string().required('Sobrenome é obrigatório'),
    email: Yup.string()
      .required('E-email é obrigatório')
      .email('Digite um email valido'),
    password: Yup.string()
      .required('Digite uma senha')
      .min(8, 'Senha deve conter no mínimo 8 caracteres'),
    confirm_password: Yup.string()
      .required('Confirme sua senha')
      .nullable()
      .oneOf([Yup.ref('password'), null], 'Confirmação incorreta'),
  });

  return schema;
}

export function setProviderValidation(): Yup.ObjectSchema {
  const schema = Yup.object().shape({
    name: Yup.string().required('Nome é obrigatório'),
    surname: Yup.string().required('Sobrenome é obrigatório'),
    address: Yup.string().required('Endereço é obrigatório'),
    email: Yup.string()
      .required('E-email é obrigatório')
      .email('Digite um email valido'),
    password: Yup.string()
      .required('Digite uma senha')
      .min(8, 'Senha deve conter no mínimo 8 caracteres'),
    confirm_password: Yup.string()
      .required('Confirme sua senha')
      .nullable()
      .oneOf([Yup.ref('password'), null], 'Confirmação incorreta'),
  });

  return schema;
}

export function getValidationErrors(err: Yup.ValidationError): ErrorProps {
  const errors: ErrorProps = {};

  err.inner.forEach((error) => {
    if (!errors[error.path]) {
      errors[error.path] = error.message;
    }
  });

  return errors;
}
