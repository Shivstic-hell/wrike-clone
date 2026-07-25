/**
 * Application configuration.
 * Reads from environment variables with sensible defaults.
 */

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  encryptionKey: string;
  defaultTenantSlug?: string;
}

export interface DatabaseConfig {
  /** If DATABASE_URL is set, this single string overrides all other DB_* vars. */
  databaseUrl?: string;
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMs: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
}

export interface AuthConfig {
  jwtSecret: string;
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
}

export interface S3Config {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  useSsl: boolean;
}

export function loadAppConfig(): AppConfig {
  return {
    nodeEnv: process.env['NODE_ENV'] || 'development',
    port: parseInt(process.env['APP_PORT'] || '4000', 10),
    apiPrefix: process.env['API_PREFIX'] || '/api/v1',
    corsOrigins: (process.env['CORS_ORIGINS'] || 'http://localhost:5173').split(','),
    encryptionKey: process.env['ENCRYPTION_KEY'] || 'dev-key-change-in-prod',
    defaultTenantSlug: process.env['DEFAULT_TENANT_SLUG'] || undefined,
  };
}

export function loadDatabaseConfig(): DatabaseConfig {
  // If DATABASE_URL is set, use it as a single connection string (Supabase/Neon style)
  const databaseUrl = process.env['DATABASE_URL'];
  if (databaseUrl) {
    return {
      databaseUrl,
      host: '',
      port: 5432,
      name: '',
      user: '',
      password: '',
      ssl: process.env['DB_SSL'] === 'true',
      maxConnections: parseInt(process.env['DB_MAX_CONNECTIONS'] || '10', 10),
      idleTimeoutMs: parseInt(process.env['DB_IDLE_TIMEOUT_MS'] || '10000', 10),
    };
  }

  return {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    name: process.env['DB_NAME'] || 'wrike_clone',
    user: process.env['DB_USER'] || 'wrike',
    password: process.env['DB_PASSWORD'] || 'wrike_dev',
    ssl: process.env['DB_SSL'] === 'true',
    maxConnections: parseInt(process.env['DB_MAX_CONNECTIONS'] || '25', 10),
    idleTimeoutMs: parseInt(process.env['DB_IDLE_TIMEOUT_MS'] || '10000', 10),
  };
}

/**
 * Returns Redis config or null if Redis is not configured.
 * The app should work without Redis (sync mode).
 */
export function loadRedisConfig(): RedisConfig | null {
  if (!process.env['REDIS_HOST']) return null;
  return {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'] || '',
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
  };
}

export function loadAuthConfig(): AuthConfig {
  return {
    jwtSecret: process.env['JWT_SECRET'] || 'dev-jwt-secret-change-in-prod',
    accessTokenTtlSec: parseInt(process.env['ACCESS_TOKEN_TTL_SEC'] || '900', 10),
    refreshTokenTtlSec: parseInt(process.env['REFRESH_TOKEN_TTL_SEC'] || '2592000', 10),
  };
}

/**
 * Returns S3 config or null if S3 is not configured.
 * File storage is deferred to Phase 6 (Supabase Storage).
 */
export function loadS3Config(): S3Config | null {
  if (!process.env['S3_ENDPOINT']) return null;
  return {
    endpoint: process.env['S3_ENDPOINT'] || 'http://localhost:9000',
    region: process.env['S3_REGION'] || 'us-east-1',
    accessKey: process.env['S3_ACCESS_KEY'] || 'minioadmin',
    secretKey: process.env['S3_SECRET_KEY'] || 'minioadmin',
    bucket: process.env['S3_BUCKET'] || 'wrike-files',
    useSsl: process.env['S3_USE_SSL'] === 'true',
  };
}
