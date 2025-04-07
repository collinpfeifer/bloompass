export class RegisterSubscriberDto {
  name: string;
  image?: string | undefined;
  email: string;
  password: string;
  confirmPassword: string;
  refreshToken: string;
}
