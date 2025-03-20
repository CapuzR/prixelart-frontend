import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide, { SlideProps } from '@mui/material/Slide';
import utils from '../../utils/utils';

interface SimpleDialogProps {
  open: boolean;
  setTabValue: (value: string) => void;
  setArts: (value: boolean) => void;
  setOpen: (value: boolean) => void;
}

const Transition = React.forwardRef(function Transition(
  props: SlideProps,
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SimpleDialog: React.FC<SimpleDialogProps> = (props) => {
  const handleClose = () => {
    props.setTabValue("0");
    props.setArts(true);
    props.setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={props.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          {'Esperamos saber de ti muy pronto.'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Te apoyaremos a través de nuestro proceso de asesorías:
            <ol>
              <li>
                Escríbenos al whatsapp haciendo click{' '}
                <a href={utils.generateWaMessage()} target="blank" rel="noreferrer">
                  aquí
                </a>
                .
              </li>
              <li>
                Puedes ver tus artes favoritos{' '}
                <a href="/galeria" target="blank" rel="noreferrer">
                  aquí
                </a>
                .
              </li>
              <li>Te ayudaremos a elegir el tamaño y el arte ideal para tu cuadro Prix.</li>
              <li>
                Si lo deseas puedes enviarnos una foto de tu espacio y realizaremos una simulación.
              </li>
            </ol>
            <strong>La asesoría es 100% gratuita.</strong>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleDialog;
