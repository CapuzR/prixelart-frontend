// src/components/TermsModal.tsx

import React from 'react';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import MDEditor from '@uiw/react-md-editor';
import styles from './styles.module.scss';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  termsText: string;
}

const TermsModal: React.FC<TermsModalProps> = ({ open, onClose, onAccept, termsText }) => (
  <Modal open={open} onClose={onClose}>
    <div className={styles['modal-content']}>
      <h2 className={styles['modal-title']}>
        Hemos actualizado nuestros términos y condiciones y queremos que estés al tanto.
      </h2>
      <div>
        <div data-color-mode="light">
          <div className={styles['modal-subtitle']}>
            CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
          </div>
          <div data-color-mode="light" className={styles['modal-text']}>
            <MDEditor.Markdown source={termsText} />
          </div>
        </div>
      </div>
      <div className={styles['modal-footer']}>
        <Button
          onClick={onAccept}
          variant="contained"
          color="primary"
          className={styles['accept-button']}
        >
          Acepto los nuevos términos y condiciones
        </Button>
      </div>
    </div>
  </Modal>
);

export default TermsModal;
