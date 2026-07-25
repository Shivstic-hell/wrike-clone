import { Controller, Get, Post, Patch, Param, Body, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { createTenantSchema, updateTenantSchema } from '@wrike-clone/shared';

@Controller('tenants')
export class TenantController {
  private readonly setupKey: string;

  constructor(private readonly tenantService: TenantService) {
    this.setupKey = process.env['SETUP_KEY'] || '';
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('tenant:read')
  async findOne(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Post()
  async create(
    @Body() body: unknown,
    @Headers('x-setup-key') setupKey?: string,
  ) {
    // In production, tenant creation requires SETUP_KEY env var
    if (this.setupKey && setupKey !== this.setupKey) {
      throw new UnauthorizedException('Valid setup key required to create tenant');
    }
    const input = createTenantSchema.parse(body);
    return this.tenantService.create(input);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Permissions('tenant:write')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const input = updateTenantSchema.parse(body);
    return this.tenantService.update(id, input);
  }
}
