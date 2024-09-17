import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccessTokenDto {
  @Expose()
  accessToken: string;
}
