// utils/tableComponents.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TableItem, Column, DropdownField } from './types';
import { getBadgeColor } from './tableUtils';
import { getDropdownConfig, createDropdownId } from './droupdownUtils';

interface DropdownCellProps {
  item: TableItem;
  column: Column;
  dropdownConfig: DropdownField;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (itemId: string | number, field: string, value: string) => void;
}

export const DropdownCell: React.FC<DropdownCellProps> = ({
  item,
  column,
  dropdownConfig,
  isOpen,
  onToggle,
  onChange,
}) => {
  const value = item[column.key];

  return (
    <div className="relative ">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between min-w-[90px] sm:min-w-[110px] px-2 py-1 text-xs rounded-full border ${getBadgeColor(
          String(value)
        )} hover:opacity-80 transition-opacity`}
      >
        <span className="truncate">{String(value)}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform flex-shrink-0 ml-1 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[100px] sm:min-w-[120px] max-w-[200px]">
          {dropdownConfig.options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(item.id, column.key, option.value);
                onToggle();
              }}
              className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg truncate"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ArrayCellProps {
  value: (string | number)[];
}

export const ArrayCell: React.FC<ArrayCellProps> = ({ value }) => (
  <div className="flex flex-wrap gap-1 max-w-xs sm:max-w-none">
    {value.map((element, index) => (
      <span
        key={index}
        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full truncate max-w-[80px] sm:max-w-none"
        title={String(element)}
      >
        {String(element)}
      </span>
    ))}
  </div>
);

interface BadgeCellProps {
  value: string | number | boolean;
}

export const BadgeCell: React.FC<BadgeCellProps> = ({ value }) => (
  <div
    className={`py-1 px-2 text-xs rounded-full text-center inline-block max-w-[100px] sm:max-w-none truncate ${getBadgeColor(
      String(value)
    )}`}
    title={String(value)}
  >
    {String(value)}
  </div>
);

interface CellRendererProps {
  item: TableItem;
  column: Column;
  badgeFields: string[];
  arrayFields: string[];
  dropdownFields: DropdownField[];
  openDropdowns: Set<string>;
  onToggleDropdown: (dropdownId: string) => void;
  onDropdownChange: (itemId: string | number, field: string, value: string) => void;
}

const formatDateForDisplay = (
  input: unknown
): string => {
  if (
    typeof input !== 'string' &&
    typeof input !== 'number' &&
    !(input instanceof Date)
  ) {
    return '';
  }

  const date = new Date(input);

  // Check if date is valid
  if (isNaN(date.getTime())) return String(input);

  // ISO format detection
  if (typeof input === 'string' && input.includes('T') && input.includes('Z')) {
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-IN');
};


export const CellRenderer: React.FC<CellRendererProps> = ({
  item,
  column,
  badgeFields,
  arrayFields,
  dropdownFields,
  openDropdowns,
  onToggleDropdown,
  onDropdownChange,
}) => {
 const value = item[column.key];
  
  // Handle date formatting specifically for dueDate field
  if (column.key === 'dueDate') {
    return <span>{formatDateForDisplay(value)}</span>;
  }
  
  // Handle badge fields
  if (badgeFields.includes(column.key)) {
    if (arrayFields.includes(column.key) && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }
    
    return (
      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
        {String(value)}
      </span>
    );
  }
  
  // Handle array fields (that are not badges)
  if (arrayFields.includes(column.key) && Array.isArray(value)) {
    return <span>{value.map(String).join(', ')}</span>;
  }
  
  const dropdownConfig = dropdownFields.find((df) => df.field === column.key);
if (dropdownConfig) {
  const dropdownId = createDropdownId(item.id, column.key);
  const isOpen = openDropdowns.has(dropdownId);

  return (
    <DropdownCell
      item={item}
      column={column}
      dropdownConfig={dropdownConfig}
      isOpen={isOpen}
      onToggle={() => onToggleDropdown(dropdownId)}
      onChange={onDropdownChange}
    />
  );
}

  
  // Default case - just display the value
  return <span>{String(value || '')}</span>;
};  