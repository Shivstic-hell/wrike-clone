/**
 * Tenant service unit tests.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from '../../src/tenant/tenant.service';
import { DATABASE_PROVIDER } from '../../src/database/database.module';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { tenantContext } from '../../src/common/tenant-context';

// Knex query builder chain: db('table').where(...).first()
function createQb() {
  const qb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    whereNull: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),  // chainable for .returning()
    returning: jest.fn(),
    from: jest.fn().mockReturnThis(),
  };
  return qb;
}

function createMockDb() {
  const qb = createQb();
  const fn = jest.fn().mockReturnValue(qb);
  return fn;
}

describe('TenantService', () => {
  let service: TenantService;
  let qb: ReturnType<typeof createQb>;
  let mockDb: jest.Mock;

  beforeEach(async () => {
    qb = createQb();
    mockDb = jest.fn().mockReturnValue(qb);
    qb.first.mockResolvedValue(null);
    qb.returning.mockResolvedValue([{}]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: DATABASE_PROVIDER, useValue: mockDb },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('creates a tenant with default settings', async () => {
      qb.first.mockResolvedValueOnce(null);
      qb.returning.mockResolvedValueOnce([{ id: 'tenant-1', name: 'Acme Corp', slug: 'acme' }]);

      const result = await service.create({ name: 'Acme Corp', slug: 'acme' });
      expect(result.name).toBe('Acme Corp');
      expect(qb.insert).toHaveBeenCalled();
    });

    it('rejects duplicate slug', async () => {
      qb.first.mockResolvedValueOnce({ id: 'existing', slug: 'acme' });

      await expect(service.create({ name: 'Acme Corp', slug: 'acme' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('returns a tenant', async () => {
      qb.first.mockResolvedValueOnce({ id: 'tenant-1', name: 'Acme' });
      const result = await service.findById('tenant-1');
      expect(result.name).toBe('Acme');
    });

    it('throws when tenant not found', async () => {
      qb.first.mockResolvedValueOnce(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('finds tenant by slug', async () => {
      qb.first.mockResolvedValueOnce({ id: 't1', slug: 'acme', name: 'Acme' });
      const result = await service.findBySlug('acme');
      expect(result.id).toBe('t1');
    });

    it('returns undefined for nonexistent slug', async () => {
      qb.first.mockResolvedValueOnce(undefined);
      const result = await service.findBySlug('nope');
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('updates tenant settings', async () => {
      const ctx = { tenantId: 'tenant-1', userId: 'u1', membershipId: 'm1', role: 'admin', permissions: ['*'] };
      tenantContext.enterWith(ctx);

      qb.first.mockResolvedValueOnce({
        id: 'tenant-1',
        settings: JSON.stringify({ defaultTimezone: 'UTC', defaultLocale: 'en' }),
        deleted_at: null,
      });

      qb.returning.mockResolvedValueOnce([{
        id: 'tenant-1',
        settings: JSON.stringify({ defaultTimezone: 'America/New_York', defaultLocale: 'en' }),
      }]);

      await service.update('tenant-1', {
        name: 'Acme Corp Updated',
        settings: { defaultTimezone: 'America/New_York' },
      });

      expect(qb.update).toHaveBeenCalled();
    });

    it('throws when tenant not found', async () => {
      const ctx = { tenantId: 't1', userId: 'u1', membershipId: 'm1', role: 'admin', permissions: ['*'] };
      tenantContext.enterWith(ctx);

      qb.first.mockResolvedValueOnce(null);

      await expect(service.update('nonexistent', { name: 'New Name' }))
        .rejects.toThrow(NotFoundException);
    });
  });
});
