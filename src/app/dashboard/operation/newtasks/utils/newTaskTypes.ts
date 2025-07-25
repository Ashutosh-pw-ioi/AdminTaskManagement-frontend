
import { TableItem } from "../../dailytasks/utils";

export interface NewTaskAdmin {
  id: string;
  name: string;
  email: string;
}

export interface NewTask {
  id: string;
  title: string;
  description: string;
  // assignedDate: string;
  dueDate: string;
  // isCompleted: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  // createdAt: string;
  // updatedAt: string;
  // adminId: string;
  admin: NewTaskAdmin;
}

export interface NewTaskApiResponse {
  success: boolean;
  tasks: NewTask[];
}

export interface NewTaskUpdateResponse {
  success: boolean;
  task: {
    id: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    [key: string]: unknown; // Allow other fields to be present
  };
}

// If TableItem is needed, import or define it above. Otherwise, remove the extension.
export interface TransformedNewTask extends TableItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_by: string;
  due_date: string;
  
 
  
  
}

export type NewTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface TaskCategories {
  upcoming: TransformedNewTask[];
  overdue: TransformedNewTask[];
  completed: TransformedNewTask[];
}

export interface CollapsibleState {
  overdue: boolean;
  completed: boolean;
}