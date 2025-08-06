import { Expose } from 'class-transformer';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';

export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  user: UserResponseDto;
}