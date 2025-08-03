import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase-server";
import { ExpenseForm } from "@/lib/types";
import dayjs from "dayjs";
// import {ExpenseForm} from '@/lib/types'

export async function getTransactionList() {
  //   const user = await getUser();

  try {
    const transactionList = await prisma.expense.findMany({
      where: {
        // userId: user?.id,
        userId: "demo-user-id",
      },
      orderBy: {
        date: "desc",
      },
    });
    const response: ExpenseForm[] = transactionList.map((item) => {
      return {
        id: item.id,
        amount: item.amount,
        category: item.category,
        fileUrl: item.fileUrl ?? "",
        note: item.note ?? "",
        date: dayjs(item.date).format("DD MMM YYYY"),
      };
    });

    return response;
  } catch (error) {
    console.error("[Get Transaction List]", error);

    return [];
  }
}
