import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import utils from '../../utils/utils';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SimpleDialog(props) {

  const handleClose = () => {
    props.setTabValue(0);
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
        <DialogTitle id="alert-dialog-slide-title">{"Esperamos saber de ti muy pronto."}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Te apoyaremos a través de nuestro proceso de asesorías:
                <ol>
                    <li>Escríbenos al whatsapp haciendo click <a href={utils.generateWaMessage()} target="blank">aquí</a>.</li>
                    <li>Puedes ver tus artes favoritos <a href="/galeria" target="blank">aquí</a>.</li>
                    <li>Te ayudaremos a elegir el tamaño y el arte ideal para tu cuadro Prix.</li>
                    <li>Si lo deseas puedes enviarnos una foto de tu espacio y realizaremos una simulación.</li>
                </ol>
                <strong>La asesoría es 100% gratuita.</strong>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
