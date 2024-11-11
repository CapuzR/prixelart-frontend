export function isAValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function isAValidPassword(password) {
  const re = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^.&*])[\w!@.#$%^&*]{8,}$/;
  return re.test(String(password));
}

export function isAValidUsername(username) {
  const re = /^[a-z0-9]*$/;
  return re.test(String(username));
}
