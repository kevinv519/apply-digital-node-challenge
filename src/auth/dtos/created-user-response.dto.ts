import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreatedUserResponseDto {
  @Expose()
  email: string;

  @Expose()
  id: string;
}
