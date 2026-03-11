type AuthResponse = {
  errorMessage: string;
  status: boolean;
};

export type SignupResponse = {
  errorMessage: string;
  status: boolean;
};

export type LoginResponse = AuthResponse & {
  token: string;
};
