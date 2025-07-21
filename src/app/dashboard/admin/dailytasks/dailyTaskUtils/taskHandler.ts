// createutils/taskHandlers.ts
import { TransformedTask, FormTask } from "./types";
import { createDailyTask, updateDailyTask, deleteDailyTask } from "./apiClient";
import { clearCache } from "./cache";
import { getErrorMessage } from "./errorHandlers";

type SetError = (error: string | null) => void;
type SetTasks = React.Dispatch<React.SetStateAction<TransformedTask[]>>;
type RefreshTasks = () => Promise<TransformedTask[]>;

export const createHandleAddTask = (
  refreshTasks: RefreshTasks,
  setError: SetError,
  setIsAddModal: (isOpen: boolean) => void
) => {
  return async (task: FormTask) => {
    try {
      await createDailyTask(task);
      await refreshTasks();
      setIsAddModal(false);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };
};

export const createHandleEdit = (
  refreshTasks: RefreshTasks,
  setError: SetError
) => {
  return async (updatedTask: TransformedTask) => {
    try {
      await updateDailyTask(updatedTask);
      await refreshTasks();
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };
};

export const createHandleDelete = (
  setTasks: SetTasks,
  setError: SetError,
  refreshTasks: RefreshTasks
) => {
  return (id: string | number) => {
    (async () => {
      try {
        await deleteDailyTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
        clearCache();
        setError(null);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
        refreshTasks();
      }
    })();
  };
};

export const createHandleTableEdit = (
  tasks: TransformedTask[],
  handleEdit: (task: TransformedTask) => Promise<void>
) => {
  return (item: unknown) => {
    if (typeof item === "object" && item !== null && "id" in item) {
      const { id } = item as { id: string | number };
      const originalTask = tasks.find(t => t.id === id);
      if (originalTask) {
        handleEdit(originalTask);
      }
    }
  };
};