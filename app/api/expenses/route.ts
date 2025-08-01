import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { amount, category, note, date, fileUrl, userId } = body;

    if (!amount || !category || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        category,
        note,
        date: date ? new Date(date) : new Date(),
        fileUrl,
        userId,
      },
    });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    console.error("[create expense]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
