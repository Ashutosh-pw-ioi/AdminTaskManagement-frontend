export const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const TASK_PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export const TABLE_CONFIG = {
  DEFAULT_ITEMS_PER_PAGE: 10,
  SEARCH_FIELDS: ['title', 'description'],
  BADGE_FIELDS: ['priority', 'assigned_by'],
  ARRAY_FIELDS: ['assigned_by'],
} as const;

export const UI_MESSAGES = {
  LOADING: 'Loading tasks...',
  NO_CHANGES: 'No changes to update',
  UPDATE_SUCCESS: 'Tasks updated successfully',
  UPDATE_ERROR: 'Failed to update tasks',
  FETCH_ERROR: 'Failed to fetch tasks',
} as const;