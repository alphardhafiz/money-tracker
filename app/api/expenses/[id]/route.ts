import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { ExpenseForm, ParamsWithId } from "@/lib/types";
import getFilePathFromUrl from "@/lib/utils/getFilePathFromUrl";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: ParamsWithId) {
  try {
    const body: ExpenseForm = await req.json();
    const { amount, category, date, note } = body;
    let { fileUrl } = body;
    const { id } = params;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (!fileUrl && existing.fileUrl) {
      fileUrl = existing.fileUrl;
    }

    if (fileUrl && existing.fileUrl && existing.fileUrl !== fileUrl) {
      const filePath = getFilePathFromUrl(existing.fileUrl);
      await supabase.storage.from("expenses").remove([filePath]);
    }

    const updated = await prisma.expense.update({
      where: {
        id,
      },
      data: {
        amount,
        category,
        note,
        date: date ? new Date(date) : new Date(),
        fileUrl,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[update expense]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: ParamsWithId) {
  try {
    const { id } = params;
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Hapus file dari Supabase jika ada
    if (existing.fileUrl) {
      const filePath = getFilePathFromUrl(existing.fileUrl);
      await supabase.storage.from("expenses").remove([filePath]);
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("[delete expense]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
