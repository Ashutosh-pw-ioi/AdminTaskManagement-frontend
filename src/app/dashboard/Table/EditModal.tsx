import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface TableItem {
  id: string | number;
  [key: string]: string | number | string[] | number[] | boolean;
}

interface Column {
  key: string;
  label: string;
}

interface Operator {
  id: string | number;
  name: string;
}

interface EditModalProps {
  isOpen: boolean;
  item: TableItem | null;
  columns: Column[];
  onSave: (item: TableItem) => void;
  onCancel: () => void;
  arrayFields?: string[];
  editableFields?: string[];
  userRole?: string;
  dateFields?: string[]; // New prop to specify which fields are dates
}

// Date conversion utility functions
const convertISOToIndianFormat = (isoDateString: string): string => {
  if (!isoDateString) return '';
  
  try {
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error converting ISO to Indian format:', error);
    return '';
  }
};

const convertIndianFormatToISO = (indianDateString: string): string => {
  if (!indianDateString) return '';
  
  try {
    const [day, month, year] = indianDateString.split('/');
    if (!day || !month || !year) return '';
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Validate the date
    if (date.getDate() != parseInt(day) || 
        date.getMonth() != parseInt(month) - 1 || 
        date.getFullYear() != parseInt(year)) {
      return '';
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error converting Indian format to ISO:', error);
    return '';
  }
};

const validateIndianDateFormat = (dateString: string): boolean => {
  if (!dateString) return true; // Empty is valid (optional field)
  
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) return false;
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (dayNum < 1 || dayNum > 31) return false;
  if (monthNum < 1 || monthNum > 12) return false;
  if (yearNum < 1900 || yearNum > 2100) return false;
  
  const date = new Date(yearNum, monthNum - 1, dayNum);
  return date.getDate() === dayNum && 
         date.getMonth() === monthNum - 1 && 
         date.getFullYear() === yearNum;
};

const formatDateInput = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format as DD/MM/YYYY
  if (digits.length >= 8) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  } else if (digits.length >= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  } else if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
};

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  columns,
  onSave,
  onCancel,
  arrayFields = [],
  editableFields = [],
  userRole = "operator",
  dateFields = ['dueDate', 'createdAt', 'updatedAt'], // Default date fields
}) => {
  const [editItem, setEditItem] = useState<TableItem | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [isOperatorsDropdownOpen, setIsOperatorsDropdownOpen] = useState(false);
  const [isLoadingOperators, setIsLoadingOperators] = useState(false);
  const [dateErrors, setDateErrors] = useState<{[key: string]: string}>({});

  const priorityOptions = [
    { value: "High", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "inprogress", label: "In Progress" },
    { value: "completed", label: "Completed" }
  ];

  // Check if a field is editable
  const isFieldEditable = (fieldKey: string) => {
    if (fieldKey === "id") return false;
    
    if (editableFields.length === 0) {
      return fieldKey !== "title" && fieldKey !== "description";
    }
    
    return editableFields.includes(fieldKey);
  };

  // Check if a field is a date field
  const isDateField = (fieldKey: string) => {
    return dateFields.includes(fieldKey);
  };

  const shouldFetchOperators = () => {
    return userRole === "admin" && isFieldEditable("assigned_to");
  };

  const fetchOperators = async () => {
    if (!shouldFetchOperators()) {
      return;
    }

    setIsLoadingOperators(true);
    try {
      const response = await fetch("http://localhost:8000/api/admin/getOperators", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setOperators(result.data);
      } else {
        console.error("Failed to fetch operators:", result.error);
      }
    } catch (error) {
      console.error("Error fetching operators:", error);
    } finally {
      setIsLoadingOperators(false);
    }
  };

  useEffect(() => {
    if (isOpen && shouldFetchOperators() && operators.length === 0) {
      fetchOperators();
    }
  }, [isOpen, userRole, editableFields]);

  useEffect(() => {
    if (item) {
      const processedItem = { ...item };
      
      // Convert ISO dates to Indian format for display
      dateFields.forEach(dateField => {
        if (processedItem[dateField] && typeof processedItem[dateField] === 'string') {
          processedItem[dateField] = convertISOToIndianFormat(processedItem[dateField] as string);
        }
      });
      
      setEditItem(processedItem);
      
      // Set selected operators based on assigned_to field
      if (item.assigned_to && Array.isArray(item.assigned_to) && isFieldEditable("assigned_to")) {
        setSelectedOperators(item.assigned_to as string[]);
      }
    }
  }, [item, editableFields, dateFields]);

  const handleSave = () => {
    if (editItem) {
      // Validate all date fields before saving
      const newDateErrors: {[key: string]: string} = {};
      let hasDateErrors = false;

      dateFields.forEach(dateField => {
        if (editItem[dateField] && isFieldEditable(dateField)) {
          const dateValue = editItem[dateField] as string;
          if (!validateIndianDateFormat(dateValue)) {
            newDateErrors[dateField] = 'Please enter a valid date in DD/MM/YYYY format';
            hasDateErrors = true;
          }
        }
      });

      if (hasDateErrors) {
        setDateErrors(newDateErrors);
        return;
      }

      const processedItem = { ...editItem };
      
      // Update assigned_to with selected operators only if the field is editable
      if (isFieldEditable("assigned_to")) {
        processedItem.assigned_to = selectedOperators;
      }

      // Convert Indian format dates back to ISO for backend
      dateFields.forEach(dateField => {
        if (processedItem[dateField] && isFieldEditable(dateField)) {
          const indianDate = processedItem[dateField] as string;
          if (indianDate) {
            const isoDate = convertIndianFormatToISO(indianDate);
            if (!isoDate && indianDate) {
              newDateErrors[dateField] = 'Invalid date provided';
              hasDateErrors = true;
              return;
            }
            processedItem[dateField] = isoDate;
          }
        }
      });

      if (hasDateErrors) {
        setDateErrors(newDateErrors);
        return;
      }

      // Clear date errors before saving
      setDateErrors({});
      onSave(processedItem);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    if (editItem) {
      setEditItem({ ...editItem, [key]: value });
      
      // Clear date error when user starts typing
      if (dateErrors[key]) {
        setDateErrors(prev => ({
          ...prev,
          [key]: ''
        }));
      }
    }
  };

  const handleDateInputChange = (key: string, value: string) => {
    if (editItem) {
      // Auto-format the date input
      const formattedValue = formatDateInput(value);
      setEditItem({ ...editItem, [key]: formattedValue });
      
      // Clear date error when user starts typing
      if (dateErrors[key]) {
        setDateErrors(prev => ({
          ...prev,
          [key]: ''
        }));
      }
    }
  };

  const handleDateBlur = (key: string, value: string) => {
    if (value && !validateIndianDateFormat(value)) {
      setDateErrors(prev => ({
        ...prev,
        [key]: 'Please enter date in DD/MM/YYYY format'
      }));
    } else {
      setDateErrors(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const handleOperatorToggle = (operatorName: string) => {
    setSelectedOperators(prev => 
      prev.includes(operatorName)
        ? prev.filter(name => name !== operatorName)
        : [...prev, operatorName]
    );
  };

  const renderEditInput = (column: Column, value: TableItem[string]) => {
    if (!editItem) return null;

    const fieldEditable = isFieldEditable(column.key);

    // Handle read-only fields
    if (!fieldEditable) {
      if (column.key === "assigned_to" && Array.isArray(value)) {
        return (
          <input
            type="text"
            value={(value as string[]).join(", ")}
            disabled
            className="w-full p-2 border rounded bg-gray-100 text-gray-500"
          />
        );
      }
      
      return (
        <input
          type="text"
          value={String(value)}
          disabled
          className="w-full p-2 border rounded bg-gray-100 text-gray-500"
        />
      );
    }

    // Handle date fields
    if (isDateField(column.key)) {
      return (
        <div>
          <input
            type="text"
            placeholder="DD/MM/YYYY (e.g., 23/07/2025)"
            value={String(value || "")}
            onChange={(e) => handleDateInputChange(column.key, e.target.value)}
            onBlur={(e) => handleDateBlur(column.key, e.target.value)}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              dateErrors[column.key] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {dateErrors[column.key] && (
            <p className="text-red-500 text-sm mt-1">{dateErrors[column.key]}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Enter date in Indian format: DD/MM/YYYY
          </p>
        </div>
      );
    }

    // Priority dropdown
    if (column.key === "priority") {
      return (
        <select
          value={String(value).toLowerCase()}
          onChange={(e) => handleInputChange(column.key, e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Status dropdown
    if (column.key === "status") {
      return (
        <select
          value={String(value).toLowerCase()}
          onChange={(e) => handleInputChange(column.key, e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Assigned to multiselect (only for admins)
    if (column.key === "assigned_to" && shouldFetchOperators()) {
      return (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOperatorsDropdownOpen(!isOperatorsDropdownOpen)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center bg-white"
          >
            <span className="text-left">
              {selectedOperators.length === 0 
                ? "Select operators..." 
                : `${selectedOperators.length} operator(s) selected`
              }
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOperatorsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {selectedOperators.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {selectedOperators.map(operatorName => (
                <span
                  key={operatorName}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {operatorName}
                  <button
                    type="button"
                    onClick={() => handleOperatorToggle(operatorName)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {isOperatorsDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {isLoadingOperators ? (
                <div className="p-2 text-gray-500">Loading operators...</div>
              ) : operators.length === 0 ? (
                <div className="p-2 text-gray-500">No operators found</div>
              ) : (
                operators.map(operator => (
                  <button
                    key={operator.id}
                    type="button"
                    onClick={() => handleOperatorToggle(operator.name)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center ${
                      selectedOperators.includes(operator.name) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOperators.includes(operator.name)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    {operator.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    // Default input for other fields
    return (
      <input
        type="text"
        value={String(value || "")}
        onChange={(e) => handleInputChange(column.key, e.target.value)}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={`Enter ${column.label.toLowerCase()}`}
      />
    );
  };

  if (!isOpen || !item) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Edit Record</h3>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.label}
                    {arrayFields.includes(column.key) && (
                      <span className="text-xs text-[#1B3A6A] ml-1">(List)</span>
                    )}
                    {isDateField(column.key) && (
                      <span className="text-xs text-green-600 ml-1">(Date)</span>
                    )}
                    {!isFieldEditable(column.key) && (
                      <span className="text-xs text-gray-500 ml-1">(Read-only)</span>
                    )}
                  </label>
                  {renderEditInput(column, editItem?.[column.key] ?? "")}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 p-4 border-t">
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#1B3A6A] text-white rounded hover:bg-[#486AA0] cursor-pointer duration-200 ease-in-out"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      
      {/* Click outside to close operators dropdown */}
      {isOperatorsDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOperatorsDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default EditModal;