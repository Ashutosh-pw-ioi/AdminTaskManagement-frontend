import React, { useState, useMemo, useEffect } from "react";
import { Edit, Trash2, Search, ChevronDown } from "lucide-react";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

interface TableItem {
  id: string | number;
  [key: string]: any;
}

interface Column {
  key: string;
  label: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownField {
  field: string;
  options: DropdownOption[];
}

interface SimpleTableProps {
  data: TableItem[];
  onEdit?: (item: TableItem) => void;
  onDelete?: (id: string | number) => void;
  badgeFields?: string[];
  searchFields?: string[];
  itemsPerPage: number;
  arrayFields?: string[];
  dropdownFields?: DropdownField[];
}

const SimpleTable: React.FC<SimpleTableProps> = ({
  data = [],
  onEdit,
  onDelete,
  badgeFields = [],
  searchFields = [],
  itemsPerPage,
  arrayFields = [],
  dropdownFields = [],
}) => {
  const [editItem, setEditItem] = useState<TableItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TableItem | null>(null);
  const [search, setSearch] = useState("");
  const [tableData, setTableData] = useState<TableItem[]>(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTableData(data);
  }, [data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, data]);

  const columns = useMemo<Column[]>(() => {
    if (!data.length) return [];
    return Object.keys(data[0])
      .filter((key) => key !== "id") // Filter out the 'id' field
      .map((key) => ({
        key,
        label:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!search) return tableData;

    return tableData.filter((item) => {
      const fieldsToSearch = searchFields.length
        ? searchFields
        : Object.keys(item);
      return fieldsToSearch.some((field) => {
        const value = item[field];
        // Handle array fields in search
        if (Array.isArray(value)) {
          return value.some((element) =>
            String(element ?? "")
              .toLowerCase()
              .includes(search.toLowerCase())
          );
        }
        return String(value ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      });
    });
  }, [tableData, search, searchFields]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const getBadgeColor = (value: string) => {
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

  const handleEdit = (item: TableItem) => {
    setEditItem({ ...item });
  };

  const handleSaveEdit = (updatedItem: TableItem) => {
    const updated = tableData.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setTableData(updated);
    onEdit?.(updatedItem);
    setEditItem(null);
  };

  const handleDelete = (item: TableItem) => {
    setDeleteId(item.id);
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (deleteId === null) return;

    const updated = tableData.filter((item) => item.id !== deleteId);
    setTableData(updated);
    onDelete?.(deleteId);
    setDeleteId(null);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteId(null);
    setItemToDelete(null);
  };

  const handleDropdownChange = (
    itemId: string | number,
    field: string,
    value: string
  ) => {
    const updated = tableData.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setTableData(updated);

    const updatedItem = updated.find((item) => item.id === itemId);
    if (updatedItem && onEdit) {
      onEdit(updatedItem);
    }
  };

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

  const getDropdownConfig = (fieldKey: string) => {
    return dropdownFields.find((df) => df.field === fieldKey);
  };

  const renderCell = (item: TableItem, column: Column) => {
    const value = item[column.key];
    const dropdownConfig = getDropdownConfig(column.key);

    if (dropdownConfig) {
      const dropdownId = `${item.id}-${column.key}`;
      const isOpen = openDropdowns.has(dropdownId);

      return (
        <div className="relative">
          <button
            onClick={() => toggleDropdown(dropdownId)}
            className={`flex items-center justify-between min-w-[110px] px-2 py-1 text-xs rounded-full border ${getBadgeColor(
              String(value)
            )} hover:opacity-80 transition-opacity`}
          >
            <span>{value}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
              {dropdownConfig.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleDropdownChange(item.id, column.key, option.value);
                    toggleDropdown(dropdownId);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (arrayFields.includes(column.key) && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((element, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {String(element)}
            </span>
          ))}
        </div>
      );
    }

    if (badgeFields.includes(column.key)) {
      return (
        <div
          className={`py-1 px-2 text-xs rounded-full text-center ${getBadgeColor(
            String(value)
          )}`}
        >
          {value}
        </div>
      );
    }

    return String(value);
  };

  const getItemDisplayName = (item: TableItem) => {
    const nameFields = ["name", "title", "email", "username"];
    for (const field of nameFields) {
      if (item[field]) {
        return String(item[field]);
      }
    }
    return `Record #${item.id}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".relative")) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!data.length) {
    return (
      <div className="p-8 text-center text-gray-500">No data available</div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="text-left p-4 px-4 font-medium text-gray-700"
                  >
                    {column.label}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="text-left p-4 px-6 font-medium text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="py-4 px-[18px] text-gray-600 text-sm">
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500">No records found</div>
        )}

        {filteredData.length > itemsPerPage && (
          <div className="p-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {currentPage} of{" "}
              {Math.ceil(filteredData.length / itemsPerPage)}
            </p>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer bg-[#1B3A6A] text-white"
              >
                Previous
              </button>
              <button
                disabled={
                  currentPage === Math.ceil(filteredData.length / itemsPerPage)
                }
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer bg-[#1B3A6A] text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <EditModal
        isOpen={editItem !== null}
        item={editItem}
        columns={columns}
        onSave={handleSaveEdit}
        onCancel={() => setEditItem(null)}
        arrayFields={arrayFields}
      />

      <DeleteModal
        isOpen={deleteId !== null}
        itemName={itemToDelete ? getItemDisplayName(itemToDelete) : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default SimpleTable;