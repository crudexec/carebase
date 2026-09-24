import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ChecklistError,
  accessibleItem,
  attachmentSelect,
  checklistRoute,
  checklistUser,
} from "@/lib/checklists/server";

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return checklistRoute(async () => {
    const user = await checklistUser();
    const { id } = await context.params;
    await accessibleItem(user, id);
    if (Number(request.headers.get("content-length")) > MAX_SIZE + 65536)
      throw new ChecklistError("Maximum file size is 10 MB", 413);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size)
      throw new ChecklistError("Choose a non-empty file");
    if (file.size > MAX_SIZE)
      throw new ChecklistError("Maximum file size is 10 MB", 413);
    if (!allowedTypes.has(file.type))
      throw new ChecklistError(
        "Use a PDF, image, Word, Excel, text, or CSV file",
      );
    // Private database storage: attachments never receive public upload URLs.
    const attachment = await prisma.checklistAttachment.create({
      data: {
        itemId: id,
        authorId: user.id,
        fileName:
          Array.from(file.name, (char) =>
            char.charCodeAt(0) < 32 ||
            char.charCodeAt(0) === 127 ||
            char === "/" ||
            char === "\\"
              ? "_"
              : char,
          )
            .join("")
            .slice(0, 255) || "attachment",
        contentType: file.type,
        size: file.size,
        data: new Uint8Array(await file.arrayBuffer()),
      },
      select: attachmentSelect,
    });
    return NextResponse.json({ attachment }, { status: 201 });
  });
}
