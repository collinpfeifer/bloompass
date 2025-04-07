export class CreateOrganizationDto {
  image?: string | undefined;
  name: string;
  email: string;
  password: string;
  refreshToken: string;
}
