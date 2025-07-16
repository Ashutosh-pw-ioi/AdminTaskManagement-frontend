import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface TableItem {
  id: string | number;
  [key: string]: any;
}

interface Column {
  key: string;
  label: string;
}

interface EditModalProps {
  isOpen: boolean;
  item: TableItem | null;
  columns: Column[];
  onSave: (item: TableItem) => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  columns,
  onSave,
  onCancel,
}) => {
  const [editItem, setEditItem] = useState<TableItem | null>(null);

  useEffect(() => {
    if (item) {
      setEditItem({ ...item });
    }
  }, [item]);

  const handleSave = () => {
    if (editItem) {
      onSave(editItem);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    if (editItem) {
      setEditItem({ ...editItem, [key]: value });
    }
  };

  const renderEditInput = (column: Column, value: any) => {
    if (!editItem) return null;

    if (column.key === "id") {
      return (
        <input
          type="text"
          value={value}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      );
    }

    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => handleInputChange(column.key, e.target.value)}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={`Enter ${column.label.toLowerCase()}`}
      />
    );
  };

  if (!isOpen || !item) return null;

  return (
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
                </label>
                {renderEditInput(column, editItem?.[column.key])}
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
  );
};

export default EditModal;
