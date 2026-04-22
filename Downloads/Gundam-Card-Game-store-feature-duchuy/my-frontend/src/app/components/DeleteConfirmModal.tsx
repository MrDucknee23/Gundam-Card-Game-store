import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'sản phẩm'
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md rounded-2xl border-gray-200 p-0 overflow-hidden">
        <AlertDialogHeader className="px-6 py-4 border-b border-gray-200 gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-black">
              Xác nhận xóa
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn xóa {itemType} này không?
              </p>
              <p className="text-black font-semibold break-words">
                &quot;{itemName}&quot;
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. {itemType.charAt(0).toUpperCase() + itemType.slice(1)} sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 sm:justify-end">
          <AlertDialogCancel className="mt-0 border-gray-300 font-semibold text-gray-700 hover:bg-gray-100">
            Hủy
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 font-semibold text-white hover:bg-red-700"
          >
            Xóa
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
