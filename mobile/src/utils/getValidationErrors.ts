import { ValidationError } from 'yup';

interface ErrorProps {
  [key: string]: string;
}

export default function getValidationErrors(err: ValidationError): ErrorProps {
  const errors: ErrorProps = {};

  err.inner.forEach((error) => {
    if (!errors[error.path]) {
      errors[error.path] = error.message;
    }
  });

  return errors;
}
