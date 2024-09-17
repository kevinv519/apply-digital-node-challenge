import { UserEntity } from '../../users/entities/user.entity';

export type RequestUser = Omit<UserEntity, 'password'>;
