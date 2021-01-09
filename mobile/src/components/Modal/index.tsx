import React, { useState } from 'react';
import { Modal as ReactModal } from 'react-native';

import {
  Container,
  Contate,
  ModalContent,
  ModalText,
  ModalButton,
  ButtonText,
} from './styles';

interface ModalProps {
  visible: boolean;
}

const Modal: React.FC<ModalProps> = ({ visible }) => {
  const [modalVisible, setModalVisible] = useState(visible);

  return (
    <Container>
      <ReactModal animationType="slide" transparent visible={modalVisible}>
        <Contate>
          <ModalContent>
            <ModalText>Hello World!</ModalText>

            <ModalButton
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <ButtonText>Hide Modal</ButtonText>
            </ModalButton>
          </ModalContent>
        </Contate>
      </ReactModal>
    </Container>
  );
};

export default Modal;
