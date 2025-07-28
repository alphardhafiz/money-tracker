/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm } from "react-hook-form";
import { CATEGORY_OPTIONS } from "@/lib/categoryOptions";
import dayjs from "dayjs";
import { useRef, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema } from "@/lib/validation/expense";
import { formatRupiah, parseRupiah } from "@/lib/utils/rupiahFormat";
import { ImagePlus, X } from "lucide-react";
import { ExpenseForm } from "@/lib/types";

type Props = {
  defaultValues?: ExpenseForm;
  defaultFileUrl?: string | null;
  onSubmit: (data: ExpenseForm, file: File | null) => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
  // Add a new prop to pass the reset function
  onFormReady?: (reset: ReturnType<typeof useForm<ExpenseForm>>['reset']) => void;
};

export default function TransactionForm({
  defaultValues,
  defaultFileUrl,
  onSubmit,
  isEdit = false,
  isSubmitting = false,
   onFormReady, // Destructure the new prop
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: defaultValues?.amount ?? 0,
      category: defaultValues?.category ?? "",
      note: defaultValues?.note ?? "",
      date: defaultValues?.date ?? dayjs().format("YYYY-MM-DD"),
    },
  });

  const [amountDisplay, setAmountDisplay] = useState(
    defaultValues?.amount ? formatRupiah(defaultValues.amount) : ""
  );
  const [file, setFile] = useState<File | null>(null);
  const [defaultFileUrlState, setDefaultFileUrl] = useState(defaultFileUrl ?? "");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (defaultValues?.amount) {
      setAmountDisplay(formatRupiah(defaultValues.amount));
    }
  }, [defaultValues?.amount]);

    useEffect(() => {
    if (onFormReady) {
      onFormReady(reset);
    }
  }, [onFormReady, reset]);
  
  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, file))}
      className="space-y-5"
    >
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-violet-700 mb-1">
          Jumlah (Rp)
        </label>
        <input
          type="text"
          inputMode="numeric"
          {...register("amount", {
            setValueAs: (v) => parseRupiah(v),
          })}
          value={amountDisplay}
          onChange={(e) => {
            const raw = e.target.value;
            const cleaned = formatRupiah(raw);
            setAmountDisplay(cleaned);
          }}
          className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-violet-700 mb-1">
          Kategori
        </label>
        <select
          {...register("category")}
          className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
        >
          <option value="">Pilih kategori</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-violet-700 mb-1">
          Tanggal
        </label>
        <input
          type="date"
          {...register("date")}
          className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-violet-700 mb-1">
          Catatan
        </label>
        <textarea
          {...register("note")}
          rows={2}
          placeholder="Contoh: makan siang"
          className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
        />
      </div>

      {/* Upload */}
      <div>
        <label className="block text-sm font-medium text-violet-700 mb-2">
          Bukti Struk (Opsional)
        </label>
        <div
          className={`relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed ${
            file || defaultFileUrlState ? "border-violet-400" : "border-gray-300"
          } bg-white hover:bg-violet-50 transition cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <>
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="h-full object-contain rounded-md"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </>
          ) : defaultFileUrlState ? (
            <>
              <img
                src={defaultFileUrlState}
                alt="Preview"
                className="h-full object-contain rounded-md"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDefaultFileUrl("");
                }}
                className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-violet-400" />
              <p className="text-sm text-violet-500 mt-2">
                Klik di sini untuk upload gambar
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setDefaultFileUrl(""); // Reset gambar lama jika upload baru
          }}
          className="hidden"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-2 ${
          isSubmitting
            ? "bg-violet-400 cursor-not-allowed"
            : "bg-violet-600 hover:bg-violet-700"
        } text-white font-bold py-2 rounded-lg shadow-md transition duration-200`}
      >
        {isSubmitting && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {isEdit ? "Simpan Perubahan" : "Simpan Pengeluaran"}
      </button>
    </form>
  );
}
