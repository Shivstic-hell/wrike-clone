/**
 * Authentication controller.
 * Endpoints for login, registration, token refresh, password change, and logout.
 * G7: Refresh token is set as httpOnly cookie (Secure; SameSite=None for cross-domain).
 * Access token is returned in the response body (kept in memory by the frontend).
 */

import {
  Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Res, UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { loginSchema, refreshTokenSchema, changePasswordSchema } from '@wrike-clone/shared';
import type { LoginResponse } from '@wrike-clone/shared';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse & { mustChangePassword?: boolean }> {
    const input = loginSchema.parse(body);
    const result = await this.authService.login(input) as LoginResponse & { mustChangePassword?: boolean };

    // G7: Set refresh token as httpOnly cookie
    this.setRefreshCookie(res, (result as any).refreshToken);

    // Strip refresh token from response body — it's in the cookie now
    const { refreshToken: _, ...safeResult } = result as any;

    return safeResult;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body() body: unknown,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    // G7: Try to get refresh token from cookie first, then fall back to body
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || (body as any)?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return this.authService.refreshToken({ refreshToken });
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const input = changePasswordSchema.parse(body);
    await this.authService.changePassword(userId, input.currentPassword, input.newPassword);
    // Clear refresh cookie since all sessions were revoked
    res.clearCookie(REFRESH_COOKIE_NAME, this.cookieOptions());
    return { message: 'Password changed successfully' };
  }

  @Post('admin-reset-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async adminResetPassword(
    @Body() body: { userId: string; tempPassword: string },
  ): Promise<{ message: string }> {
    await this.authService.adminResetPassword(body.userId, body.tempPassword);
    return { message: 'Password reset successful. User must change on next login.' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    res.clearCookie(REFRESH_COOKIE_NAME, this.cookieOptions());
    return { message: 'Logged out' };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { email: string; password: string; displayName: string; tenantSlug: string },
  ): Promise<{ message: string }> {
    // Guard: public registration disabled by default
    if (process.env['ALLOW_PUBLIC_REGISTRATION'] !== 'true') {
      throw new UnauthorizedException('Public registration is disabled');
    }
    await this.authService.register(body);
    return { message: 'Registration successful' };
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      ...this.cookieOptions(),
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: process.env['NODE_ENV'] === 'production' ? 'none' as const : 'lax' as const,
      path: '/api/v1/auth',
    };
  }
}
