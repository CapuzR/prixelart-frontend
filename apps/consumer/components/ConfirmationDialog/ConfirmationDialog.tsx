import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CircularProgress } from "@mui/material";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode; // Allow JSX for message
  confirmText?: string;
  cancelText?: string;
  isPerformingAction?: boolean; // To show loading state on confirm button
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isPerformingAction = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose} // Allow closing by clicking outside or pressing Esc
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {" "}
        {/* Add some padding */}
        <Button
          onClick={onClose}
          color="secondary"
          disabled={isPerformingAction}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color="primary" // Or "error" for destructive actions like delete
          variant="contained" // Make confirm more prominent
          disabled={isPerformingAction}
          startIcon={
            isPerformingAction ? (
              <CircularProgress size={20} color="inherit" />
            ) : null
          }
          autoFocus // Focus confirm button by default
        >
          {isPerformingAction ? "Cargando..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
