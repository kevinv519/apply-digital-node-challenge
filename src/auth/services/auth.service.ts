import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../../users/services/users.service';
import { AccessTokenDto } from '../dtos/access-token.dto';
import { CreatedUserResponseDto } from '../dtos/created-user-response.dto';
import { RequestUser } from '../types/request-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<RequestUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async signToken(user: RequestUser): Promise<AccessTokenDto> {
    const payload = { sub: user.id, email: user.email };
    return plainToInstance(AccessTokenDto, {
      accessToken: await this.jwtService.signAsync(payload),
    });
  }

  async signUp(email: string, password: string): Promise<CreatedUserResponseDto> {
    const user = await this.usersService.createUser(email, password);

    return plainToInstance(CreatedUserResponseDto, user);
  }
}
