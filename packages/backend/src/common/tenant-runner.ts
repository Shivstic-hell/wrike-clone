/**
 * Query runner that sets the tenant context on every database query.
 * Wraps the Knex instance so that `app.current_tenant_id` is set for RLS.
 */

import { Knex } from 'knex';

let knexInstance: Knex | null = null;

export function setKnexInstance(knex: Knex): void {
  knexInstance = knex;
}

export async function runWithTenant<T>(
  tenantId: string | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  if (!knexInstance || !tenantId) {
    return fn();
  }

  // Set the session variable for PostgreSQL RLS, then run the callback
  return knexInstance.transaction(async (trx) => {
    await trx.raw(`SET app.current_tenant_id = '${tenantId}'`);
    return fn();
  });
}
