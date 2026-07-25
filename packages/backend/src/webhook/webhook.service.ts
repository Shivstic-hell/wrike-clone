/**
 * Webhook service — outbound event delivery to external systems.
 * Uses BullMQ for reliable delivery with retry/backoff.
 */

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { DATABASE_PROVIDER } from '../database/database.module';
import { requireTenantContext } from '../common/tenant-context';
import type { CreateWebhookInput } from '@wrike-clone/shared';

@Injectable()
export class WebhookService {
  constructor(@Inject(DATABASE_PROVIDER) private readonly db: Knex) {}

  async findAll() {
    const ctx = requireTenantContext();
    return this.db('webhooks').where({ tenant_id: ctx.tenantId }).orderBy('created_at', 'desc');
  }

  async create(input: CreateWebhookInput) {
    const ctx = requireTenantContext();
    const id = uuidv4();
    const [webhook] = await this.db('webhooks')
      .insert({
        id,
        tenant_id: ctx.tenantId,
        url: input.url,
        secret: input.secret || id,
        events: `{${input.events.join(',')}}`,
      })
      .returning('*');
    return webhook;
  }

  async toggle(id: string, isActive: boolean) {
    const ctx = requireTenantContext();
    const wh = await this.db('webhooks').where({ id, tenant_id: ctx.tenantId }).first();
    if (!wh) throw new NotFoundException('Webhook not found');
    await this.db('webhooks').where({ id }).update({ is_active: isActive });
    return { id, isActive };
  }

  async remove(id: string): Promise<void> {
    const ctx = requireTenantContext();
    await this.db('webhooks').where({ id, tenant_id: ctx.tenantId }).del();
  }
}
