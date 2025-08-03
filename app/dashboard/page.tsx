import TransactionList from "@/components/TransactionList";
import { getTransactionList } from "./data";

export default async function DashboardPage() {
  const expenses = await getTransactionList()

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-violet-700">
        Pengeluaran Saya
      </h1>
      <TransactionList expenses={expenses} />
    </main>
  );
}
