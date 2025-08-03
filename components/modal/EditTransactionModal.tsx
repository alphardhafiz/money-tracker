"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useCallback, useEffect, useRef, useState } from "react";
// import TransactionForm from "@/components/forms/TransactionForm";
import { supabase } from "@/lib/supabase";
// import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import TransactionForm from "../form/TransactionForm";
import { ExpenseForm } from "@/lib/types";
import { useForm } from "react-hook-form";
import { useToast } from "../ToastContext";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  transaction: ExpenseForm;
};

export default function EditTransactionModal({
  open,
  onClose,
  transaction,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formResetRef = useRef<
    ReturnType<typeof useForm<ExpenseForm>>["reset"] | null
  >(null);
  const previousOpenRef = useRef(open);
  const userId = "demo-user-id"; // replace with actual user session

  const handleUpload = async (file: File | null): Promise<string | null> => {
    if (!file) return null;
    const path = `${userId}/${Date.now()}`;
    const { error } = await supabase.storage
      .from("expenses")
      .upload(path, file);
    if (error) {
      toast.error("Gagal upload");
      return null;
    }
    const { data: url } = supabase.storage.from("expenses").getPublicUrl(path);
    return url?.publicUrl ?? null;
  };

  const handleSubmit = async (data: ExpenseForm, file: File | null) => {
    setIsSubmitting(true);
    const fileUrl = await handleUpload(file);

    const res = await fetch(`/api/expenses/${transaction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, fileUrl }),
    });

    if (res.ok) {
      // toast.success("Berhasil diperbarui!");
      toast.expenseUpdated();
      router.refresh();
      onClose();
    } else {
      toast.expenseError("mengubah");
    }
    setIsSubmitting(false);
  };

  // Use useCallback to create a stable reference for the onFormReady function
  const handleFormReady = useCallback(
    (reset: ReturnType<typeof useForm<ExpenseForm>>["reset"]) => {
      formResetRef.current = reset;
    },
    []
  );

  // Effect to reset the form when the modal closes
  useEffect(() => {
    const wasOpen = previousOpenRef.current;
    previousOpenRef.current = open;

    // Only reset when modal transitions from open to closed
    if (wasOpen && !open && formResetRef.current) {
      formResetRef.current();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <DialogPanel className="z-50 max-w-md w-full mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-lg font-semibold text-violet-700">
            Edit Pengeluaran
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <TransactionForm
          defaultValues={transaction}
          defaultFileUrl={transaction.fileUrl} // ⬅ TAMBAHKAN INI
          onSubmit={handleSubmit}
          isEdit
          isSubmitting={isSubmitting}
          onFormReady={handleFormReady}
        />
      </DialogPanel>
    </Dialog>
  );
}
