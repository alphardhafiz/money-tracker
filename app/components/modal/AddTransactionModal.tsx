"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import TransactionForm from "../form/TransactionForm";
import { ExpenseForm } from "@/lib/types";
import { useForm } from "react-hook-form";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddTransactionModal({ open, onClose }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReset, setFormReset] = useState<
    ReturnType<typeof useForm<ExpenseForm>>["reset"] | null
  >(null);
  const userId = "demo-user-id"; // replace with actual user session

  const handleUpload = async (file: File | null): Promise<string | null> => {
    if (!file) return null;
    const path = `expenses/${userId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("expenses")
      .upload(path, file);
    if (error) {
      toast.error("Gagal upload bukti");
      return null;
    }

    const { data: url } = supabase.storage.from("expenses").getPublicUrl(path);
    return url?.publicUrl ?? null;
  };

  const handleSubmit = async (data: ExpenseForm, file: File | null) => {
    setIsSubmitting(true);
    const fileUrl = await handleUpload(file);

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, userId, fileUrl }),
    });

    if (res.ok) {
      toast.success("Berhasil disimpan!");
      router.refresh(); // refresh data di dashboard
      onClose();
    } else {
      toast.error("Gagal menyimpan data");
    }
    setIsSubmitting(false);
  };

  // Effect to reset the form when the modal closes
  useEffect(() => {
    if (!open && formReset) {
      // Check if the modal is closing and the reset function is available
      formReset();
    }
  }, [open, formReset]); // Depend on 'open' and 'formReset'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <DialogPanel className="z-50 max-w-md w-full mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <DialogTitle className="text-lg font-semibold text-violet-700 mb-4">
          Tambah Pengeluaran
        </DialogTitle>
        <TransactionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onFormReady={setFormReset} // Pass setFormReset to the child
        />
      </DialogPanel>
    </Dialog>
  );
}
