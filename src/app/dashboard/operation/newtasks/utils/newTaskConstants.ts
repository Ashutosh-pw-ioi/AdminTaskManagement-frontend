export const NEW_TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const NEW_TASK_PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export const NEW_TASK_TABLE_CONFIG = {
  DEFAULT_ITEMS_PER_PAGE: 4,
  SEARCH_FIELDS: [] as string[],
  BADGE_FIELDS: ['priority', 'assigned_by'],
  ARRAY_FIELDS: ['assigned_to'],
} as const;

export const NEW_TASK_UI_MESSAGES = {
  LOADING: 'Loading new tasks...',
  NO_CHANGES: 'No changes to update',
  UPDATE_SUCCESS: 'New tasks updated successfully',
  UPDATE_ERROR: 'Failed to update new tasks',
  FETCH_ERROR: 'Failed to fetch new tasks',
  NO_UPCOMING: 'No upcoming tasks',
  NO_OVERDUE: 'No overdue tasks',
  NO_COMPLETED: 'No completed tasks',
} as const;

export const TASK_SECTION_COLORS = {
  UPCOMING: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
  },
  OVERDUE: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
  },
  COMPLETED: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
} as const;