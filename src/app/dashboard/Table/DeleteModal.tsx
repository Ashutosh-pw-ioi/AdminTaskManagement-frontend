import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">Confirm Delete</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            {itemName ? (
              <span className="font-medium text-gray-800">
                &quot;{itemName}&quot;
              </span>
            ) : (
              "this record"
            )}
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
