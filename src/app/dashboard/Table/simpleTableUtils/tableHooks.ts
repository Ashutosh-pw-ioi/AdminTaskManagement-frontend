// utils/tableHooks.ts
import { useState, useEffect, useMemo } from 'react';
import { TableItem } from './types';
import { filterData, paginateData, generateColumns } from './tableUtils';

/**
 * Hook for detecting mobile screen size
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

/**
 * Hook for managing table state and operations
 */
export const useTableState = (
  initialData: TableItem[],
  itemsPerPage: number,
  searchFields: string[]
) => {
  const [tableData, setTableData] = useState<TableItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Update table data when initial data changes
  useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  // Reset to first page when search or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, initialData]);

  // Generate columns from data
  const columns = useMemo(() => generateColumns(initialData), [initialData]);

  // Filter data based on search
  const filteredData = useMemo(
    () => filterData(tableData, search, searchFields),
    [tableData, search, searchFields]
  );

  // Paginate filtered data
  const paginatedData = useMemo(
    () => paginateData(filteredData, currentPage, itemsPerPage),
    [filteredData, currentPage, itemsPerPage]
  );

  return {
    tableData,
    setTableData,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    columns,
    filteredData,
    paginatedData,
  };
};

/**
 * Hook for managing modal states
 */
export const useModalState = () => {
  const [editItem, setEditItem] = useState<TableItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TableItem | null>(null);

  const openEditModal = (item: TableItem) => {
    setEditItem({ ...item });
  };

  const closeEditModal = () => {
    setEditItem(null);
  };

  const openDeleteModal = (item: TableItem) => {
    setDeleteId(item.id);
    setItemToDelete(item);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setItemToDelete(null);
  };

  return {
    editItem,
    deleteId,
    itemToDelete,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  };
};

/**
 * Hook for managing dropdown states
 */
export const useDropdownState = () => {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dropdownId)) {
        newSet.delete(dropdownId);
      } else {
        newSet.add(dropdownId);
      }
      return newSet;
    });
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns(new Set());
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".relative")) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    openDropdowns,
    toggleDropdown,
    closeAllDropdowns,
  };
};