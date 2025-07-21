
export interface Operator {
  id: string | number;
  name: string;
}

export interface DefaultTask {
  title: string;
  description?: string;
}

export interface TaskFromAPI {
  id: string | number;
  defaultTask: DefaultTask;
  priority: string;
  status: string;
  operators: Operator[];
  defaultTaskId: string | number;
  isCompleted: boolean;
  taskDate: string;
}

export interface TransformedTask {
  id: string | number;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: string[];
  defaultTaskId: string | number;
  operatorIds: (string | number)[];
  isCompleted: boolean;
  taskDate: string;
}

export interface FormTask {
  defaultTaskId: string | number;
  operatorIds: (string | number)[];
  priority: string;
  status: string;
}

export interface ApiCache {
  data: TransformedTask[] | null;
  timestamp: number | null;
  promise: Promise<TransformedTask[]> | null;
}