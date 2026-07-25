/**
 * Tenant service — multi-tenant organization management.
 */

import { Injectable, NotFoundException, ConflictException, Inject, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { DATABASE_PROVIDER } from '../database/database.module';
import { requireTenantContext } from '../common/tenant-context';
import type { CreateTenantInput, UpdateTenantInput } from '@wrike-clone/shared';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Knex) {}

  async findAll() {
    const ctx = requireTenantContext();
    return this.db('tenants').where({ id: ctx.tenantId, deleted_at: null }).first();
  }

  async findById(id: string) {
    const tenant = await this.db('tenants').where({ id, deleted_at: null }).first();
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findBySlug(slug: string) {
    return this.db('tenants').where({ slug, deleted_at: null }).first();
  }

  async create(input: CreateTenantInput) {
    const existing = await this.db('tenants').where({ slug: input.slug }).first();
    if (existing) throw new ConflictException('Tenant slug already exists');

    const id = uuidv4();
    const [tenant] = await this.db('tenants')
      .insert({
        id,
        name: input.name,
        slug: input.slug,
        domain: input.domain || null,
        settings: JSON.stringify({
          defaultTimezone: 'UTC',
          defaultLocale: 'en',
          maxUsers: 100,
          maxStorageGb: 10,
          allowedAuthProviders: ['local'],
          enforceSso: false,
          sessionTimeoutMinutes: 480,
        }),
      })
      .returning('*');

    this.logger.log(`Tenant created: ${input.slug}`);
    return tenant;
  }

  async update(id: string, input: UpdateTenantInput) {
    const ctx = requireTenantContext();
    const tenant = await this.db('tenants').where({ id, deleted_at: null }).first();
    if (!tenant) throw new NotFoundException('Tenant not found');

    const updates: Record<string, unknown> = {};
    if (input.name) updates['name'] = input.name;
    if (input.settings) {
      const currentSettings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : tenant.settings;
      updates['settings'] = JSON.stringify({ ...currentSettings, ...input.settings });
    }

    const [updated] = await this.db('tenants').where({ id }).update(updates).returning('*');
    return updated;
  }
}
