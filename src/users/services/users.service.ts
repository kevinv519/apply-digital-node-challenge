import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  private readonly saltRounds: number;
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    configService: ConfigService,
  ) {
    this.saltRounds = parseInt(configService.get('PASSWORD_ROUNDS') || '') || 10;
  }

  async createUser(email: string, password: string): Promise<UserEntity> {
    const user = this.userRepository.create({ email, password: await hash(password, this.saltRounds) });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
