"use client";
import { Dialog, Transition } from "@headlessui/react";
import { useState, Fragment } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmDeleteModal({ 
  open, 
  onClose, 
  onConfirm,
  title = "Hapus Pengeluaran?",
  description = "Tindakan ini tidak bisa dibatalkan. Apakah kamu yakin?",
  confirmText = "Hapus",
  cancelText = "Batal"
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error during confirmation:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                      <AlertTriangle 
                        className="w-6 h-6 text-red-600" 
                        aria-hidden="true" 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center items-center rounded-lg border border-transparent bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {confirmText}
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}