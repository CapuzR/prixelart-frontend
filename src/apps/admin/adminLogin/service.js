import {
  isAValidEmail,
  isAValidPassword,
  isAValidUsername,
} from "utils/validations";
// import {  snackbarMessage } from "@components/Utility";
// import { useLoading, useSnackBar, useBackdrop } from 'context/GlobalContext';
    // const { snackbarOpen, snackbarMessage } = useSnackBar();

export const handleEmailChange = (
  e,
  setEmail,
  setEmailError,
  setErrorMessage,
  setSnackBarError
) => {
  if (isAValidEmail(e.target.value)) {
    setEmail(e.target.value);
    setEmailError(false);
    setSnackBarError(false);
  } else {
    // setEmail(e.target.value);
    // snackbarMessage("Por favor introduce un correo electrónico válido.");
    // snackbarOpen(true)
    // setSnackBarError(true);
    // setEmailError(true);
  }
};

//Password
export const handlePasswordChange = (
  e,
  setPassword,
  setPasswordError,
  setErrorMessage,
  setSnackBarError
) => {
  if (isAValidPassword(e.target.value)) {
    setPassword(e.target.value);
    setPasswordError(false);
    setSnackBarError(false);
  } else {
    setPassword(e.target.value);
    // setPasswordError(true);
    // snackbarMessage(
    //   "Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial."
    // );
    // snackbarOpen(true)
    // setSnackBarError(true);
  }
};

export const handleClickShowPassword = (setShowPassword, showPassword) => {
  setShowPassword(!showPassword);
};
