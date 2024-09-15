import { IsUUID } from 'class-validator';

export class IdUuidParamDto {
  @IsUUID('4')
  id: string;
}
