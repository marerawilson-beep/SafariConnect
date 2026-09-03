import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Unable to create user", error);
    return NextResponse.json({ error: "We could not create your account. Please try again." }, { status: 500 });
  }
}
