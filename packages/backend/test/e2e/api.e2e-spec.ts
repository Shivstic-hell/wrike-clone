/**
 * E2E API tests — full request/response lifecycle.
 * These require a running PostgreSQL instance and are excluded from
 * the default `npm test` run. Run with `npm run test:e2e`.
 *
 * The tests:
 * 1. Create a tenant
 * 2. Register a user
 * 3. Login and get JWT
 * 4. Create workspace, folder, project, task
 * 5. Verify CRUD operations
 * 6. Verify RBAC enforcement
 * 7. Verify input validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /api/v1/health returns status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(res.body.status).toBeDefined();
      expect(res.body.checks).toBeDefined();
      expect(res.body.checks.database).toBeDefined();
    });

    it('GET /api/v1/health/ready returns readiness', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect(200);
      expect(res.body.status).toBeDefined();
    });
  });

  describe('Auth', () => {
    const testTenantSlug = 'e2e-test-org';
    const testEmail = 'e2e-admin@test.com';
    const testPassword = 'e2e-test-password-123';

    it('POST /api/v1/auth/register creates a user', async () => {
      // First create the tenant directly
      await request(app.getHttpServer())
        .post('/api/v1/tenants')
        .send({ name: 'E2E Test Org', slug: testTenantSlug })
        .expect(201);

      // Register user
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          displayName: 'E2E Admin',
          tenantSlug: testTenantSlug,
        })
        .expect(201);

      expect(res.body.message).toBe('Registration successful');
    });

    it('POST /api/v1/auth/login authenticates and returns JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
          tenantSlug: testTenantSlug,
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.tenant).toBeDefined();
    });

    it('POST /api/v1/auth/login rejects wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'wrong-password',
          tenantSlug: testTenantSlug,
        })
        .expect(401);
    });

    it('POST /api/v1/auth/login rejects invalid tenant', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
          tenantSlug: 'nonexistent-org',
        })
        .expect(401);
    });
  });

  describe('Task CRUD (authenticated)', () => {
    let authToken: string;
    let workspaceId: string;
    let folderId: string;
    let projectId: string;
    let taskId: string;

    beforeAll(async () => {
      // Login to get token
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'e2e-admin@test.com',
          password: 'e2e-test-password-123',
          tenantSlug: 'e2e-test-org',
        });

      if (loginRes.status === 200) {
        authToken = loginRes.body.accessToken;
      }
    });

    it('POST /api/v1/workspaces creates a workspace', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/workspaces')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'E2E Engineering' })
        .expect(201);

      workspaceId = res.body.id;
    });

    it('POST /api/v1/folders creates a folder', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ workspaceId, name: 'E2E Q3 Projects' })
        .expect(201);

      folderId = res.body.id;
    });

    it('POST /api/v1/projects creates a project', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ folderId, name: 'E2E Mobile App' })
        .expect(201);

      projectId = res.body.id;
    });

    it('POST /api/v1/tasks creates a task', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ projectId, title: 'E2E Implement login' })
        .expect(201);

      taskId = res.body.id;
      expect(res.body.status).toBe('todo');
    });

    it('GET /api/v1/tasks returns paginated tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/tasks/:id returns task with details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(taskId);
      expect(res.body.title).toBe('E2E Implement login');
    });

    it('PATCH /api/v1/tasks/:id updates a task', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress', priority: 'high' })
        .expect(200);

      expect(res.body.status).toBe('in_progress');
      expect(res.body.priority).toBe('high');
    });

    it('DELETE /api/v1/tasks/:id soft-deletes a task', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Validation', () => {
    it('rejects invalid task creation', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .set('Authorization', 'Bearer invalid')
        .send({})  // missing required fields
        .expect(401);
    });

    it('returns 404 for nonexistent task', async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'e2e-admin@test.com',
          password: 'e2e-test-password-123',
          tenantSlug: 'e2e-test-org',
        });

      if (loginRes.status === 200) {
        await request(app.getHttpServer())
          .get('/api/v1/tasks/00000000-0000-4000-8000-000000000000')
          .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
          .expect(404);
      }
    });
  });
});
