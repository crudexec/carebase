import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  accessibleItem,
  checklistRoute,
  checklistUser,
  personSelect,
} from "@/lib/checklists/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return checklistRoute(async () => {
    const user = await checklistUser();
    const { id } = await context.params;
    await accessibleItem(user, id);
    const { body } = z
      .object({ body: z.string().trim().min(1, "Enter a comment").max(5000) })
      .parse(await request.json());
    const comment = await prisma.checklistComment.create({
      data: { itemId: id, authorId: user.id, body },
      include: { author: { select: personSelect } },
    });
    return NextResponse.json({ comment }, { status: 201 });
  });
}
