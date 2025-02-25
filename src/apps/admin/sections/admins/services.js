export const disabled = () => {
  if (
    username !== undefined &&
    area !== undefined &&
    firstname !== undefined &&
    lastname !== undefined &&
    phone !== undefined &&
    email !== undefined &&
    password !== undefined
  ) {
    return false;
  } else {
    return true;
  }
};
