export type ExpenseForm = {
  id?: number | string;
  amount: number;
  category: string;
  note?: string;
  date?: string;
  fileUrl?: string;
};

// types.ts (atau di file yang sesuai)
export type ParamsWithId = {
  params: {
    id: string;
  };
};
