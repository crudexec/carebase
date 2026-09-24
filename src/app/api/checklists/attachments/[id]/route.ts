import { prisma } from "@/lib/db";
import {
  ChecklistError,
  accessibleChecklists,
  checklistRoute,
  checklistUser,
} from "@/lib/checklists/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return checklistRoute(async () => {
    const user = await checklistUser();
    const { id } = await context.params;
    const file = await prisma.checklistAttachment.findFirst({
      where: { id, item: { checklist: accessibleChecklists(user) } },
    });
    if (!file) throw new ChecklistError("Attachment not found", 404);
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName).replace(/'/g, "%27")}`,
        "Content-Length": String(file.size),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });
}
