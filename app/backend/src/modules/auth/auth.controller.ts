import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AUTH_COOKIE_NAME, RequestWithUser } from './jwt.types';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.registerPlayer(dto);
    res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions);

    return {
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions);

    return {
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });
  }

  @Get('me')
  async me(@Req() req: RequestWithUser) {
    const user = await this.authService.getCurrentUser(req.cookies?.[AUTH_COOKIE_NAME]);

    return {
      user,
    };
  }
}
