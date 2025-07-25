// utils/dropdownUtils.ts
import { DropdownField } from './types';

/**
 * Get dropdown configuration for a specific field
 */
export const getDropdownConfig = (
  fieldKey: string,
  dropdownFields: DropdownField[]
): DropdownField | undefined => {
  return dropdownFields.find((df) => df.field === fieldKey);
};

/**
 * Toggle dropdown in the set of open dropdowns
 */
export const toggleDropdownInSet = (
  openDropdowns: Set<string>,
  dropdownId: string
): Set<string> => {
  const newSet = new Set(openDropdowns);
  if (newSet.has(dropdownId)) {
    newSet.delete(dropdownId);
  } else {
    newSet.add(dropdownId);
  }
  return newSet;
};

/**
 * Create dropdown ID from item and column
 */
export const createDropdownId = (
  itemId: string | number,
  columnKey: string
): string => {
  return `${itemId}-${columnKey}`;
};