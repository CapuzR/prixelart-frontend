
export function isAValidEmail(email: string | undefined): boolean {
  if (email === undefined) {
    return true;
  } else {
    // Corrected regex
    const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}$/i;
    return re.test(email);
  }
}

export function isAValidPassword(password: string): boolean {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
  return re.test(String(password));
}

export const validatePasswordDetailed = (password: string) => {
  if (password.length < 8) {
    return "Debe tener al menos 8 caracteres.";
  }

  if (password.length > 15) {
    return "No puede tener más de 15 caracteres.";
  }

  if (!/[a-z]/.test(password)) {
    return "Debe incluir al menos una letra minúscula.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Debe incluir al menos una letra mayúscula.";
  }

  if (!/\d/.test(password)) {
    return "Debe incluir al menos un número.";
  }

  if (!/[@$!%*?&]/.test(password)) {
    return "Debe incluir un símbolo (ej: @, $, !, %, *, ?, &).";
  }

  return ""; 
};

export function isAValidPhoneNum(phoneNumber: string): boolean {
  const re = /^[+\s\.]?[0-9]{10,14}$/im;
  return re.test(String(phoneNumber));
}

export function isAValidName(name: string): boolean {
  const re = /^[A-zÀ-ú\s]{2,15}$/;
  return re.test(String(name));
}

export function isAValidCi(ci: string): boolean {
  const re = /^[a-zA-Z-]?[0-9]{6,10}$/;
  return re.test(String(ci));
}

export function isAValidUsername(username: string): boolean {
  const re = /^[a-z-0-9]{3,15}$/;
  return re.test(String(username));
}
