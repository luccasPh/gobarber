import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { TextInputProps } from 'react-native';
import { useField } from '@unform/core';
import FeIcon from '@expo/vector-icons/build/Feather';

import { Container, TextInput, Icon, TextError, HiddenButton } from './styles';

interface InputProps extends TextInputProps {
  name: string;
  icon: string;
  type: string;
  security?: boolean;
  containerStyle?: {};
  isEditable?: boolean;
  filled?: boolean;
}

interface InputValueProps {
  value: string;
}

interface InputRefProps {
  focus(): void;
}

const Input: React.ForwardRefRenderFunction<InputRefProps, InputProps> = (
  {
    name,
    icon,
    type,
    security,
    containerStyle = {},
    isEditable = true,
    filled = false,
    ...rest
  },
  ref,
) => {
  const inputElementRef = useRef<any>(null);
  const { registerField, defaultValue = '', fieldName, error } = useField(name);
  const inputValueRef = useRef<InputValueProps>({ value: defaultValue });

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(filled);
  const [securityText, setSecurityText] = useState(security);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputValueRef.current.value);
  }, []);

  const handleShowPassword = useCallback(() => {
    setSecurityText(!securityText);
  }, [securityText]);

  useImperativeHandle(ref, () => ({
    focus() {
      inputElementRef.current.focus();
    },
  }));

  useEffect(() => {
    registerField<string>({
      name: fieldName,
      ref: inputValueRef.current,
      path: 'value',
      setValue(ref: any, value) {
        inputValueRef.current.value = value;
        inputElementRef.current.setNativeProps({ text: value });
      },
      clearValue() {
        inputValueRef.current.value = '';
        inputElementRef.current.clear();
      },
    });
  }, [fieldName, registerField]);
  return (
    <>
      <Container
        style={containerStyle}
        isFocused={isFocused}
        isErrored={!!error}
      >
        <Icon
          name={icon}
          size={20}
          color={isFocused || (isFilled && isEditable) ? '#ff9000' : '#666360'}
        />

        <TextInput
          ref={inputElementRef}
          placeholderTextColor="#666360"
          secureTextEntry={securityText}
          defaultValue={defaultValue}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChangeText={(value) => {
            inputValueRef.current.value = value;
          }}
          {...rest}
        />
        {type === 'password' && (
          <HiddenButton onPress={handleShowPassword}>
            {securityText ? (
              <Icon name="eye" size={20} color="#ff9000" />
            ) : (
              <Icon
                name="eye-off"
                size={20}
                style={{ opacity: 0.7 }}
                color="#ff9000"
              />
            )}
          </HiddenButton>
        )}
      </Container>

      {!!error && <TextError>{error}</TextError>}
    </>
  );
};

export default forwardRef(Input);
