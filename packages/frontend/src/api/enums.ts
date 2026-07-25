/**
 * Frontend-local enum value constants.
 * Mirrors the values from @wrike-clone/shared enums for runtime use,
 * since the shared package uses CommonJS output that Rollup can't statically analyze.
 */
export const TASK_STATUS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export const TASK_PRIORITY = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;
