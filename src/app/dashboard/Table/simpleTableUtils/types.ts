// utils/tableTypes.ts
export interface TableItem {
  id: string | number;
  [key: string]: string | number | boolean | string[] | number[];
}

export interface Column {
  key: string;
  label: string;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownField {
  field: string;
  options: DropdownOption[];
}

export interface SimpleTableProps {
  data: TableItem[];
  onEdit?: (item: TableItem) => void;
  onDelete?: (id: string | number) => void;
  badgeFields?: string[];
  searchFields?: string[];
  itemsPerPage: number;
  arrayFields?: string[];
  dropdownFields?: DropdownField[];
}