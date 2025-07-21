"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import EmptyList from "@/src/app/dashboard/admin/EmptyList";
import { Plus } from "lucide-react";
import SimpleTable from "../../Table/SimpleTable";
import AddTaskModal from "./AddTaskModal";
import { useAuth } from "@/src/app/contexts/AuthProvider";
import { filterTasksForUI } from "./utils/taskUtils";
import { createTaskService, invalidateCaches } from "./utils/taskService";
import { Task, Operator, AuthContext, TableItem } from "./utils/types";

export default function NewTasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModal, setIsAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const { user, isAuthenticated, checkAuth } = useAuth() as AuthContext;

  const ongoingRequests = useRef<Set<string>>(new Set());

  const getAuthHeaders = useMemo(() => {
    return () => ({
      "Content-Type": "application/json",
    });
  }, []);

  const taskService = useMemo(() => createTaskService(getAuthHeaders), [getAuthHeaders]);

  const getOperatorNamesByIds = useCallback(
    (operatorIds: string[]) => {
      return operatorIds.map((id) => {
        const operator = operators.find((op) => op.id === id);
        return operator ? operator.name : id;
      });
    },
    [operators]
  );

  const loadOperators = useCallback(
    async (forceRefresh = false) => {
      const requestKey = "loadOperators";
      if (!forceRefresh && ongoingRequests.current.has(requestKey)) return;
      ongoingRequests.current.add(requestKey);
      try {
        const fetched = await taskService.fetchOperators(forceRefresh);
        setOperators(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        ongoingRequests.current.delete(requestKey);
      }
    },
    [taskService]
  );

  const loadTasks = useCallback(
    async (forceRefresh = false) => {
      const requestKey = "loadTasks";
      if (!forceRefresh && ongoingRequests.current.has(requestKey)) return;
      ongoingRequests.current.add(requestKey);
      try {
        setIsLoading(true);
        setError(null);
        const fetched = await taskService.fetchTasks(forceRefresh);
        const transformed = fetched.map((task) => ({
          ...task,
          assigned_to: task.operators?.map((op) => op.name || op.id) || [],
          description: task.description || "No description provided.",
        }));
        setTasks(transformed);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.message.includes("Unauthorized")) {
          setError("Session expired. Please log in again.");
          checkAuth();
        } else {
          setError("Failed to load tasks. Please try again.");
        }
        setTasks([]);
      } finally {
        setIsLoading(false);
        ongoingRequests.current.delete(requestKey);
      }
    },
    [taskService, checkAuth]
  );

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadOperators();
      loadTasks();
    } else if (isAuthenticated === false) {
      setIsLoading(false);
      setError("Please log in to view tasks.");
    }
  }, [isAuthenticated, user?.id, loadOperators, loadTasks]);

  const handleAddClick = useCallback(() => {
    if (!isAuthenticated) {
      setError("Please log in to add tasks.");
      return;
    }
    setIsAddModal(true);
  }, [isAuthenticated]);

  const handleAddTask = useCallback(
    async (task: Partial<Task>) => {
      const requestKey = `createTask_${task.title}`;
      if (ongoingRequests.current.has(requestKey)) return;
      ongoingRequests.current.add(requestKey);

      try {
        let operatorIds: string[] = [];
        if (task.assigned_to && Array.isArray(task.assigned_to)) {
          operatorIds = task.assigned_to.map((nameOrId) => {
            const byName = operators.find((op) => op.name === nameOrId);
            const byId = operators.find((op) => op.id === nameOrId);
            return byName?.id || byId?.id || nameOrId;
          });
        } else if (task.operatorIds) {
          operatorIds = task.operatorIds;
        }

        const taskData = {
          title: task.title || "",
          description: task.description || "",
          dueDate: task.dueDate || new Date().toISOString().split("T")[0],
          priority: task.priority || "low",
          status: task.status || "pending",
          adminId: task.adminId || user?.id || "",
          operatorIds: operatorIds,
        };

        const response = await taskService.createTask(taskData);
        const newTask = response.data || response;

        const transformed = {
          ...newTask,
          assigned_to:
            newTask.operators?.map((op: Operator) => op.name || op.id) ||
            getOperatorNamesByIds(operatorIds),
        };

        setTasks((prev) => [...prev, transformed]);
        setIsAddModal(false);
        setError(null);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.message.includes("Unauthorized")) {
          setError("Session expired. Please log in again.");
          checkAuth();
        } else {
          setError(`Failed to create task: ${error.message}`);
        }
      } finally {
        ongoingRequests.current.delete(requestKey);
      }
    },
    [taskService, user?.id, getOperatorNamesByIds, checkAuth, operators]
  );

  const handleEdit = useCallback(
    (updatedItem: TableItem) => {
      if (!updatedItem.id) return;
      const requestKey = `editTask_${updatedItem.id}`;
      if (ongoingRequests.current.has(requestKey)) return;
      ongoingRequests.current.add(requestKey);

      (async () => {
        try {
          let operatorIds: string[] = [];
          if (Array.isArray(updatedItem.assigned_to)) {
            operatorIds = updatedItem.assigned_to.map((nameOrId) => {
              const name = String(nameOrId);
              const byName = operators.find((op) => op.name === name);
              const byId = operators.find((op) => op.id === name);
              return byName?.id || byId?.id || name;
            });
          }

          const updateData = {
            title: String(updatedItem.title || ""),
            description: String(updatedItem.description || ""),
            dueDate: String(updatedItem.dueDate || ""),
            priority: String(updatedItem.priority || ""),
            status: String(updatedItem.status || ""),
            operatorIds,
          };

          await taskService.updateTask(String(updatedItem.id), updateData);

          setTasks((prev) =>
            prev.map((task) =>
              task.id === updatedItem.id
                ? {
                    ...task,
                    ...updateData,
                    assigned_to: Array.isArray(updatedItem.assigned_to)
                      ? updatedItem.assigned_to.map(String)
                      : [],
                  }
                : task
            )
          );
          setError(null);
        } catch (err: unknown) {
          const error = err as Error;
          if (error.message.includes("Unauthorized")) {
            setError("Session expired. Please log in again.");
            checkAuth();
          } else {
            setError(`Failed to update task: ${error.message}`);
          }
        } finally {
          ongoingRequests.current.delete(requestKey);
        }
      })();
    },
    [taskService, checkAuth, operators]
  );

  const handleDelete = useCallback(
    (id: string | number) => {
      const taskId = String(id);
      const requestKey = `deleteTask_${taskId}`;
      if (ongoingRequests.current.has(requestKey)) return;
      ongoingRequests.current.add(requestKey);

      (async () => {
        try {
          await taskService.deleteTask(taskId);
          setTasks((prev) => prev.filter((task) => task.id !== taskId));
          setError(null);
        } catch (err: unknown) {
          const error = err as Error;
          if (error.message.includes("Unauthorized")) {
            setError("Session expired. Please log in again.");
            checkAuth();
          } else {
            setError("Failed to delete task. Please try again.");
          }
        } finally {
          ongoingRequests.current.delete(requestKey);
        }
      })();
    },
    [taskService, checkAuth]
  );

  const filteredTasksForUI = useMemo(() => filterTasksForUI(tasks), [tasks]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Please log in to access tasks.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-4 relative">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => {
              invalidateCaches();
              loadTasks(true);
            }}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {isAddModal && (
        <AddTaskModal
          isOpen={isAddModal}
          onClose={() => setIsAddModal(false)}
          onSubmit={handleAddTask}
        />
      )}

      <button
        className="fixed top-6 right-6 w-10 h-10 bg-[#1B3A6A] rounded-full flex items-center justify-center mb-4 cursor-pointer shadow-xl"
        onClick={handleAddClick}
      >
        <Plus className="w-5 h-5 text-[#D4E3F5]" />
      </button>

      {filteredTasksForUI.length > 0 ? (
        <div className="w-full">
          <div className="text-3xl font-bold mb-8">New Tasks Management</div>
          <SimpleTable
            data={filteredTasksForUI}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchFields={["title", "description"]}
            itemsPerPage={4}
            badgeFields={["assigned_to", "status", "priority"]}
            arrayFields={["assigned_to"]}
          />
        </div>
      ) : (
        <div className="h-screen">
          <EmptyList taskType="new" />
        </div>
      )}
    </div>
  );
}
