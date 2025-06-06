function isAValidEmail(email) {
  if (email === undefined) {
    return true;
  } else {
    const re = /^[a-z0-9]+(.[_a-z0-9]+)@[a-z0-9]+(.[a-z0-9-]+)[.][a-z]{2,15}$/;
    return re.test(String(email));
  }
}

function isAValidPassword(password) {
  const re = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^.&*])[\w!@.#$%^&*]{8,}$/;
  return re.test(String(password));
}

function isAValidPhoneNum(phoneNumber) {
  const re = /^[+\s\.]?[0-9]{10,14}$/im;
  return re.test(String(phoneNumber));
}

function isAValidName(name) {
  const re = /^[A-zÀ-ú\s]{2,15}$/;
  return re.test(String(name));
}

function isAValidCi(ci) {
  const re = /^[a-zA-Z-]?[0-9]{7,10}$/;
  return re.test(String(ci));
}

function isAValidUsername(username) {
  const re = /^[a-z-0-9]{3,15}$/;
  return re.test(String(username));
}

function isAValidPrice(number) {
  const re = /^[0-9]+(([.]+[0-9]{1,2})?){1,6}$/;
  return re.test(String(number));
}

export default {
  isAValidUsername,
  isAValidEmail,
  isAValidPassword,
  isAValidName,
  isAValidPhoneNum,
  isAValidCi,
  isAValidPrice,
};
