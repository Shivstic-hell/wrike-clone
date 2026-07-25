import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Only drop after verifying tasks have assignees (migration 004 ran successfully)
  const result = await knex('tasks').count('* as count').whereNotNull('assignee_id').first();
  const hasAssigneeData = Number(result?.count || 0) > 0;

  if (hasAssigneeData) {
    await knex.schema.dropTableIfExists('task_assignees');
  }
}

export async function down(knex: Knex): Promise<void> {
  // Recreate if needed
  const exists = await knex.schema.hasTable('task_assignees');
  if (!exists) {
    await knex.schema.createTable('task_assignees', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('assigned_at').notNullable().defaultTo(knex.fn.now());
      table.string('role', 64);
      table.unique(['task_id', 'user_id']);
    });
  }
}
