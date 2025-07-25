// utils/tableUtils.ts
import { TableItem, Column } from './types';

/**
 * Generate columns from data, excluding the 'id' field
 */
export const generateColumns = (data: TableItem[]): Column[] => {
  if (!data.length) return [];
  return Object.keys(data[0])
    .filter((key) => key !== "id")
    .map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    }));
};

/**
 * Filter data based on search query and specified search fields
 */
export const filterData = (
  data: TableItem[],
  search: string,
  searchFields: string[]
): TableItem[] => {
  if (!search) return data;

  return data.filter((item) => {
    const fieldsToSearch = searchFields.length ? searchFields : Object.keys(item);
    return fieldsToSearch.some((field) => {
      const value = item[field];
      // Handle array fields in search
      if (Array.isArray(value)) {
        return value.some((element) =>
          String(element ?? "").toLowerCase().includes(search.toLowerCase())
        );
      }
      return String(value ?? "").toLowerCase().includes(search.toLowerCase());
    });
  });
};

/**
 * Paginate data based on current page and items per page
 */
export const paginateData = (
  data: TableItem[],
  currentPage: number,
  itemsPerPage: number
): TableItem[] => {
  const start = (currentPage - 1) * itemsPerPage;
  return data.slice(start, start + itemsPerPage);
};

/**
 * Get badge color based on value
 */
export const getBadgeColor = (value: string): string => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    "in progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };
  return colors[value.toLowerCase()] || "bg-gray-100 text-gray-800";
};

/**
 * Get display name for an item based on common name fields
 */
export const getItemDisplayName = (item: TableItem): string => {
  const nameFields = ["name", "title", "email", "username"];
  for (const field of nameFields) {
    if (item[field]) {
      return String(item[field]);
    }
  }
  return `Record #${item.id}`;
};

/**
 * Update item in data array
 */
export const updateItemInData = (
  data: TableItem[],
  updatedItem: TableItem
): TableItem[] => {
  return data.map((item) => (item.id === updatedItem.id ? updatedItem : item));
};

/**
 * Remove item from data array by id
 */
export const removeItemFromData = (
  data: TableItem[],
  itemId: string | number
): TableItem[] => {
  return data.filter((item) => item.id !== itemId);
};

/**
 * Update specific field of an item in data array
 */
export const updateItemField = (
  data: TableItem[],
  itemId: string | number,
  field: string,
  value: string | number | boolean | string[] | number[]
): TableItem[] => {
  return data.map((item) =>
    item.id === itemId ? { ...item, [field]: value } : item
  );
};