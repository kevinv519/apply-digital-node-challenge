import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from '../decorators/user.decorator';
import { AccessTokenDto } from '../dtos/access-token.dto';
import { CreatedUserResponseDto } from '../dtos/created-user-response.dto';
import { CredentialsDto } from '../dtos/credentials.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { RequestUser } from '../types/request-user';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: CredentialsDto })
  @UseGuards(LocalAuthGuard)
  login(@User() user: RequestUser): Promise<AccessTokenDto> {
    return this.authService.signToken(user);
  }

  @Post('signup')
  signup(@Body() credentialsDto: CredentialsDto): Promise<CreatedUserResponseDto> {
    return this.authService.signUp(credentialsDto.email, credentialsDto.password);
  }
}
