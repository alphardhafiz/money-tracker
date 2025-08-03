/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm } from "react-hook-form";
import { CATEGORY_OPTIONS } from "@/lib/categoryOptions";
import dayjs from "dayjs";
import { useRef, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema } from "@/lib/validation/expense";
import { formatRupiah, parseRupiah } from "@/lib/utils/rupiahFormat";
import { ImagePlus, X, Upload, FileImage, Calendar, Receipt, DollarSign, Tag, FileText } from "lucide-react";
import { ExpenseForm } from "@/lib/types";

type Props = {
  defaultValues?: ExpenseForm;
  defaultFileUrl?: string | null;
  onSubmit: (data: ExpenseForm, file: File | null) => void;
  isEdit?: boolean;
  isSubmitting?: boolean;
  onFormReady?: (reset: ReturnType<typeof useForm<ExpenseForm>>['reset']) => void;
};

export default function TransactionForm({
  defaultValues,
  defaultFileUrl,
  onSubmit,
  isEdit = false,
  isSubmitting = false,
  onFormReady,
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
      date: defaultValues?.date ? dayjs(defaultValues.date).format('YYYY-MM-DD') : dayjs().format("YYYY-MM-DD"),
    },
  });
  
  const [amountDisplay, setAmountDisplay] = useState(
    defaultValues?.amount ? formatRupiah(defaultValues.amount) : ""
  );
  const [file, setFile] = useState<File | null>(null);
  const [defaultFileUrlState, setDefaultFileUrl] = useState(defaultFileUrl ?? "");
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're leaving the drop zone completely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
      setFile(files[0]);
      setDefaultFileUrl("");
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setDefaultFileUrl("");
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setDefaultFileUrl("");
  };
  
  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit((data) => onSubmit(data, file))}
        className="space-y-4"
      >
        {/* Amount - Compact */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <DollarSign className="w-4 h-4 text-violet-600" />
            Jumlah Pengeluaran
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              {...register("amount", {
                setValueAs: (v) => parseRupiah(v.toString()),
              })}
              value={amountDisplay}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = formatRupiah(raw);
                setAmountDisplay(cleaned);
              }}
              placeholder="Masukkan jumlah..."
              className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 text-sm
                ${errors.amount 
                  ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' 
                  : 'border-gray-200 bg-gray-50 hover:border-violet-300 focus:border-violet-400 focus:bg-white focus:ring-violet-100'
                } focus:ring-4 outline-none font-medium`}
            />
            <div className="absolute right-3 top-2.5 text-gray-400 font-medium text-sm">Rp</div>
          </div>
          {errors.amount && (
            <p className="flex items-center gap-1 text-red-600 text-xs font-medium">
              <X className="w-3 h-3" />
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Category - Compact */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Tag className="w-4 h-4 text-violet-600" />
            Kategori
          </label>
          <select
            {...register("category")}
            className={`w-full px-4 py-2.5 border-2 rounded-xl transition-all duration-200 text-sm
              ${errors.category 
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100' 
                : 'border-gray-200 bg-gray-50 hover:border-violet-300 focus:border-violet-400 focus:bg-white focus:ring-violet-100'
              } focus:ring-4 outline-none font-medium`}
          >
            <option value="">Pilih kategori</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="flex items-center gap-1 text-red-600 text-xs font-medium">
              <X className="w-3 h-3" />
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Date - Compact */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="w-4 h-4 text-violet-600" />
            Tanggal
          </label>
          <input
            type="date"
            {...register("date")}
            className="w-full px-4 py-2.5 border-2 border-gray-200 bg-gray-50 rounded-xl hover:border-violet-300 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 outline-none font-medium transition-all duration-200 text-sm"
          />
        </div>

        {/* Note - Compact */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText className="w-4 h-4 text-violet-600" />
            Catatan
          </label>
          <textarea
            {...register("note")}
            rows={2}
            placeholder="Contoh: makan siang..."
            className="w-full px-4 py-2.5 border-2 border-gray-200 bg-gray-50 rounded-xl hover:border-violet-300 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 outline-none font-medium transition-all duration-200 resize-none text-sm"
          />
        </div>

        {/* Compact Upload Section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Receipt className="w-4 h-4 text-violet-600" />
            Bukti Struk <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
          </label>
          
          <div
            className={`relative group transition-all duration-300 ${
              file || defaultFileUrlState ? 'h-32' : 'h-20'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={`relative flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                isDragOver
                  ? "border-violet-500 bg-violet-100 scale-[1.02]"
                  : file || defaultFileUrlState
                  ? "border-violet-400 bg-violet-50"
                  : "border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50"
              } shadow-sm hover:shadow-md`}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="relative w-full h-full p-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
                  >
                    <X className="w-3 h-3 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              ) : defaultFileUrlState ? (
                <div className="relative w-full h-full p-2">
                  <img
                    src={defaultFileUrlState}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
                  >
                    <X className="w-3 h-3 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="bg-violet-100 p-2 rounded-full">
                    <Upload className="w-4 h-4 text-violet-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Upload Struk</p>
                  <p className="text-xs text-gray-400">Drag & drop atau klik</p>
                </div>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>

        {/* Compact Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white transform hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                {isEdit ? "Simpan Perubahan" : "Simpan Pengeluaran"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}