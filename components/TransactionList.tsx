"use client";

import { useState } from "react";
import { ExpenseForm } from "@/lib/types";
import AddTransactionModal from "./modal/AddTransactionModal";
import EditTransactionModal from "./modal/EditTransactionModal";
// import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import { Plus, Edit3, Trash2, Calendar, DollarSign, Tag, FileText, TrendingDown, Search, Filter } from "lucide-react";
import { useToast } from "./ToastContext";

type Props = {
  expenses: ExpenseForm[];
};

export default function TransactionList({ expenses }: Props) {
  const toast = useToast()
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState<Props["expenses"][number] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter expenses based on search and category
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = (expense.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(expenses.map(expense => expense.category)));

  // Calculate total amount
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // const handleDelete = async () => {
  //   setIsDeleting(true);
  //   try {
  //     const res = await fetch(`/api/expenses/${selectedId}`, {
  //       method: "DELETE",
  //     });
  //     if (res.ok) {
  //       toast.success("Pengeluaran berhasil dihapus! 🗑️");
  //       router.refresh();
  //     } else {
  //       toast.error("Gagal menghapus pengeluaran 😞");
  //     }
  //   } catch (error) {
  //     toast.error("Terjadi kesalahan 😞");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

    
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${selectedId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.expenseDeleted(); // ✨ Beautiful themed toast
        router.refresh();
      } else {
        toast.expenseError('menghapus');
      }
    } catch (error) {
      toast.expenseError('menghapus');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Makanan': 'bg-orange-100 text-orange-700 border-orange-200',
      'Transport': 'bg-blue-100 text-blue-700 border-blue-200',
      'Hiburan': 'bg-purple-100 text-purple-700 border-purple-200',
      'Belanja': 'bg-pink-100 text-pink-700 border-pink-200',
      'Kesehatan': 'bg-green-100 text-green-700 border-green-200',
      'default': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 text-white shadow-xl">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Pengeluaran Saya</h2>
            <div className="flex items-center gap-2 text-violet-200">
              <TrendingDown className="w-4 h-4" />
              <span className="text-base font-semibold">
                Total: {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-white text-violet-600 px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            Tambah Pengeluaran
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-3 text-xs text-gray-500">
          Menampilkan {filteredExpenses.length} dari {expenses.length} pengeluaran
        </div>
      </div>

      {/* Transaction List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || selectedCategory !== "all" ? "Tidak ada hasil" : "Belum ada pengeluaran"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchTerm || selectedCategory !== "all" 
              ? "Coba ubah kata kunci atau filter pencarian"
              : "Mulai catat pengeluaran pertama Anda"
            }
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-violet-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors duration-200"
            >
              Tambah Pengeluaran Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              <div className="space-y-4">
                {/* Main Content */}
                <div className="space-y-3">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">{item.date}</span>
                  </div>
                  
                  {/* Amount */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-violet-600" />
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  
                  {/* Note */}
                  {item.note && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">{item.note}</p>
                    </div>
                  )}
                  
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setEditData(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedId(item.id !== undefined ? String(item.id) : null);
                      setShowConfirm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddTransactionModal 
          open 
          onClose={() => setShowAddModal(false)} 
        />
      )}

      {editData && (
        <EditTransactionModal
          open
          onClose={() => setEditData(null)}
          transaction={editData}
        />
      )}

      <ConfirmDeleteModal
        open={showConfirm}
        onClose={() => {
          if (!isDeleting) {
            setShowConfirm(false);
            setSelectedId(null);
          }
        }}
        onConfirm={handleDelete}
        title="Hapus Pengeluaran?"
        description="Data pengeluaran akan dihapus permanen dan tidak dapat dikembalikan. Apakah Anda yakin?"
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}