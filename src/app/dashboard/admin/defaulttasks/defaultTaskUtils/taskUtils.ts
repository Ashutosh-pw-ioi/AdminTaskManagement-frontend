import { Task, TableItem } from './types';

export class TaskUtils {
  /**
   * Ensures a task object has a description field
   */
  static enforceDescription(task: Record<string, unknown>): Task {
    return {
      id: String(task.id),
      title: String(task.title || ''),
      description: task.description ? String(task.description) : "No description provided.",
      adminId: task.adminId ? String(task.adminId) : undefined,
      createdAt: task.createdAt ? String(task.createdAt) : undefined,
      updatedAt: task.updatedAt ? String(task.updatedAt) : undefined,
    };
  }

  /**
   * Prepares tasks for display in the table component
   */
  static prepareTasksForDisplay(tasks: Task[]): TableItem[] {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description
    }));
  }

  /**
   * Gets standard authentication headers
   */
  static getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Creates a unique request key for deduplication
   */
  static createRequestKey(operation: string, identifier?: string | number): string {
    return identifier ? `${operation}_${identifier}` : operation;
  }

  /**
   * Handles API response parsing with error handling
   */
  static async parseJsonResponse<T>(response: Response): Promise<T | null> {
    try {
      return await response.json() as T;
    } catch (jsonError) {
      // Try to read as text to clear the response
      await response.text().catch(() => {});
      return null;
    }
  }

  /**
   * Creates a generic error message from unknown error types
   */
  static getErrorMessage(error: unknown, defaultMessage: string): string {
    return error instanceof Error ? error.message : defaultMessage;
  }

  /**
   * Validates task data before processing
   */
  static validateTask(task: Partial<Task>): boolean {
    return Boolean(task.title && typeof task.title === 'string' && task.title.trim().length > 0);
  }

  /**
   * Sanitizes task input data
   */
  static sanitizeTaskInput(input: { title: string; description?: string }): {
    title: string;
    description: string;
  } {
    return {
      title: input.title.trim(),
      description: input.description?.trim() || "No description provided."
    };
  }
}

export default TaskUtils;