export const comparePasswords = ({
  password,
  passwordConfirmation,
}: {
  password: string;
  passwordConfirmation: string;
}) => {
  return password === passwordConfirmation;
};
