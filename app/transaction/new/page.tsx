/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm } from "react-hook-form";
import { CATEGORY_OPTIONS } from "@/lib/categoryOptions";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema } from "@/lib/validation/expense";
import { formatRupiah, parseRupiah } from "@/lib/utils/rupiahFormat";
import { ImagePlus, X } from "lucide-react";

type FormValues = {
  amount: number;
  category: string;
  note?: string;
  date?: string;
};

export default function NewTransactionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: dayjs().format("YYYY-MM-DD"),
    },
  });
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amountDisplay, setAmountDisplay] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userId = "demo-user-id"; // nanti ambil dari session supabase

  const handleUpload = async (): Promise<string | null> => {
    if (!file) return null;

    const filePath = `expenses/${userId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("expenses")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error", error);
      toast.error("Upload image failed");
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("expenses")
      .getPublicUrl(filePath);

    return urlData?.publicUrl ?? null;
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const fileUrl = await handleUpload();

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        amount: Number(data.amount),
        userId,
        fileUrl,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      toast.error("Gagal menyimpan data");
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-violet-700">
          Tambah Pengeluaran
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-xl p-6 space-y-5"
        >
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
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

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
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

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

          <div>
            <label className="block text-sm font-medium text-violet-700 mb-2">
              Bukti Struk (Opsional)
            </label>

            {/* Upload box */}
            <div
              className={`relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed ${
                file ? "border-violet-400" : "border-gray-300"
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
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-violet-400" />
                  <p className="text-sm text-violet-500 mt-2">
                    Klik di sini untuk upload gambar
                  </p>
                </>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>

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
            {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
          </button>
        </form>
      </div>

      {/* Tombol kembali ke dashboard (simulasi) */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white border shadow-md p-3 rounded-full text-blue-600 hover:bg-blue-100"
        >
          ⬅
        </button>
      </div>
    </main>
  );
}
