import React, { useState } from "react";
import { Edit, Trash2, Search, ChevronRight, ChevronDown } from "lucide-react";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";

// Import types and utils
import { SimpleTableProps, TableItem } from "./simpleTableUtils/types";
import { useTableState, useModalState, useDropdownState } from "./simpleTableUtils/tableHooks";
import { updateItemInData, removeItemFromData, updateItemField, getItemDisplayName } from "./simpleTableUtils/tableUtils";
import { CellRenderer } from "./simpleTableUtils/TableComponents";

// Extended interface to include editableFields
interface ExtendedSimpleTableProps extends SimpleTableProps {
  editableFields?: string[]; // New prop for controlling editable fields in EditModal
  userRole?: string; // New prop to control visibility of edit/delete actions
  dateFields?: string[]; // Optional prop for date fields
}

const SimpleTable: React.FC<ExtendedSimpleTableProps> = ({
  data = [],
  onEdit,
  onDelete,
  badgeFields = [],
  searchFields = [],
  itemsPerPage,
  arrayFields = [],
  dropdownFields = [],
  editableFields = [], // New prop with default empty array
  dateFields = [], // New prop for date fields
  userRole = "admin", // Default user role
}) => {
  // Custom hooks for state management
  const {
    tableData,
    setTableData,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    columns,
    filteredData,
    paginatedData,
  } = useTableState(data, itemsPerPage, searchFields);

  const {
    editItem,
    deleteId,
    itemToDelete,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  } = useModalState();

  const { openDropdowns, toggleDropdown } = useDropdownState();
  
  // Mobile state management
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  // Helper function to generate a safe key
  const getSafeKey = (item: TableItem, index: number): string => {
    if (item.id !== null && item.id !== undefined && !Number.isNaN(item.id)) {
      return String(item.id);
    }
    return `item-${index}`;
  };

  const toggleRowExpansion = (itemId: string | number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Event handlers
  const handleSaveEdit = (updatedItem: TableItem) => {
    const updated = updateItemInData(tableData, updatedItem);
    setTableData(updated);
    onEdit?.(updatedItem);
    closeEditModal();
  };

  const handleConfirmDelete = () => {
    if (deleteId === null) return;

    const updated = removeItemFromData(tableData, deleteId);
    setTableData(updated);
    onDelete?.(deleteId);
    closeDeleteModal();
  };

  const handleDropdownChange = (
    itemId: string | number,
    field: string,
    value: string
  ) => {
    const updated = updateItemField(tableData, itemId, field, value);
    setTableData(updated);

    const updatedItem = updated.find((item) => item.id === itemId);
    if (updatedItem && onEdit) {
      onEdit(updatedItem);
    }
  };

  // Early return for empty data
  if (!data.length) {
    return (
      <div className="p-4 sm:p-8 text-center text-gray-500">No data available</div>
    );
  }

  // Mobile Card Component
  const MobileCard = ({ item, index }: { item: TableItem, index: number }) => {
    const safeId = getSafeKey(item, index);
    const isExpanded = expandedRows.has(safeId);
    const primaryField = columns[0];
    const secondaryFields = columns.slice(1);
    
    return (
      <div className="bg-white border rounded-lg p-4 mb-3 shadow-sm w-full overflow-hidden">
        {/* Primary row - always visible */}
        <div 
          className="flex items-start justify-between cursor-pointer gap-3"
          onClick={() => toggleRowExpansion(safeId)}
        >
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="font-medium text-gray-900 break-words">
              {primaryField && (
                <div className="w-full overflow-hidden">
                  <CellRenderer
                    item={item}
                    column={primaryField}
                    badgeFields={badgeFields}
                    arrayFields={arrayFields}
                    dropdownFields={dropdownFields}
                    openDropdowns={openDropdowns}
                    onToggleDropdown={toggleDropdown}
                    onDropdownChange={handleDropdownChange}
                  />
                </div>
              )}
            </div>
            {/* Show first secondary field as subtitle */}
            {secondaryFields[0] && (
              <div className="text-sm text-gray-500 mt-1 break-words">
                 {String(item[secondaryFields[0].key])}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Action buttons */}
            {(onEdit || onDelete) && (
              <div className="flex space-x-1">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(item);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            
            {/* Expand/Collapse icon */}
            {secondaryFields.length > 1 && (
              <div className="text-gray-400 flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && secondaryFields.length > 1 && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {secondaryFields.slice(1).map((column) => (
              <div key={column.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3">
                <span className="text-sm font-medium text-gray-600 flex-shrink-0 sm:w-1/3">
                  {column.label}:
                </span>
                <div className="text-sm text-gray-900 flex-1 sm:text-right break-words overflow-hidden">
                  <CellRenderer
                    item={item}
                    column={column}
                    badgeFields={badgeFields}
                    arrayFields={arrayFields}
                    dropdownFields={dropdownFields}
                    openDropdowns={openDropdowns}
                    onToggleDropdown={toggleDropdown}
                    onDropdownChange={handleDropdownChange}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white shadow rounded-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-3 sm:p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden overflow-hidden">
          {paginatedData.length > 0 ? (
            <div className="p-3">
              {paginatedData.map((item, index) => (
                <MobileCard key={getSafeKey(item, index)} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No records found</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="text-left p-4 px-4 font-medium text-gray-700 text-sm"
                  >
                    {column.label}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="text-left p-4 px-6 font-medium text-gray-700 text-sm">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={getSafeKey(item, index)} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="py-4 px-[18px] text-gray-600 text-sm">
                      <CellRenderer
                        item={item}
                        column={column}
                        badgeFields={badgeFields}
                        arrayFields={arrayFields}
                        dropdownFields={dropdownFields}
                        openDropdowns={openDropdowns}
                        onToggleDropdown={toggleDropdown}
                        onDropdownChange={handleDropdownChange}
                      />
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => openDeleteModal(item)}
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

          {/* Desktop No Results Message */}
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-gray-500">No records found</div>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > itemsPerPage && (
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 border-t">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Page {currentPage} of{" "}
              {Math.ceil(filteredData.length / itemsPerPage)}
              <span className="hidden sm:inline">
                {" "}({filteredData.length} total items)
              </span>
            </p>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 cursor-pointer bg-[#1B3A6A] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              <button
                disabled={
                  currentPage === Math.ceil(filteredData.length / itemsPerPage)
                }
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50 cursor-pointer bg-[#1B3A6A] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditModal
        isOpen={editItem !== null}
        item={editItem}
        columns={columns}
        onSave={handleSaveEdit}
        onCancel={closeEditModal}
        arrayFields={arrayFields}
        editableFields={editableFields} // Pass the editableFields prop to EditModal
        userRole={userRole}
        dateFields={dateFields} 
      />

      <DeleteModal
        isOpen={deleteId !== null}
        itemName={itemToDelete ? getItemDisplayName(itemToDelete) : undefined}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </>
  );
};

export default SimpleTable;