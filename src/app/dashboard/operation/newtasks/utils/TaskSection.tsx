import React from 'react';
import SimpleTable from '@/src/app/dashboard/Table/SimpleTable';
import { TransformedNewTask } from './newTaskTypes';

interface TaskSectionProps {
  title: string;
  tasks: TransformedNewTask[];
  count: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
  emptyMessage: string;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  tableProps: unknown;
  onEdit: (task: TransformedNewTask) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  tasks,
  count,
  bgColor,
  borderColor,
  textColor,
  emptyMessage,
  isCollapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  tableProps,
  onEdit,
}) => {
  const headerContent = (
    <h2 className={`text-2xl font-semibold ${textColor}`}>
      {title} ({count})
    </h2>
  );

  const content = (
    <div className="mt-4">
      {tasks.length > 0 ? (
        <SimpleTable 
          itemsPerPage={0} data={tasks}
          {...(typeof tableProps === 'object' && tableProps !== null ? tableProps : {})}
          onEdit={(item) => onEdit(item as TransformedNewTask)}        />
      ) : (
        <p className={`${textColor.replace('800', '600')} italic`}>
          {emptyMessage}
        </p>
      )}
    </div>
  );

  return (
    <div className={`${bgColor} p-6 rounded-lg border ${borderColor}`}>
      {isCollapsible ? (
        <>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={onToggleCollapse}
          >
            {headerContent}
            <span className={`${textColor.replace('800', '600')} text-xl`}>
              {isCollapsed ? "▼" : "▲"}
            </span>
          </div>
          {!isCollapsed && content}
        </>
      ) : (
        <>
          {headerContent}
          {content}
        </>
      )}
    </div>
  );
};

export default TaskSection;