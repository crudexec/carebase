import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { Prisma } from "@prisma/client";
import {
  createVisitNoteSchema,
  visitNoteListQuerySchema,
  validateFieldValue,
} from "@/lib/visit-notes/validation";
import { FormSchemaSnapshot } from "@/lib/visit-notes/types";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Helper to save base64 data as file
async function saveBase64File(
  base64Data: string,
  fieldType: "SIGNATURE" | "PHOTO"
): Promise<{ fileUrl: string; fileName: string; fileType: string; fileSize: number }> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", fieldType.toLowerCase());
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${uuidv4()}.png`;
  const filePath = path.join(uploadDir, fileName);

  // Handle both plain base64 and data URL format
  let buffer: Buffer;
  let mimeType = "image/png";

  if (base64Data.startsWith("data:")) {
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      throw new Error("Invalid data URL format");
    }
  } else {
    buffer = Buffer.from(base64Data, "base64");
  }

  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${fieldType.toLowerCase()}/${fileName}`;

  return {
    fileUrl,
    fileName,
    fileType: mimeType,
    fileSize: buffer.length,
  };
}

// GET /api/visit-notes - List visit notes
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryValidation = visitNoteListQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    const { shiftId, clientId, carerId, templateId, startDate, endDate, page, limit } =
      queryValidation.data;

    // Build query filters - scope to company
    const where: Prisma.VisitNoteWhereInput = {
      companyId: session.user.companyId,
    };

    // Carers can only see their own notes
    if (session.user.role === "CARER") {
      where.carerId = session.user.id;
    } else {
      // Other roles can filter by carer
      if (carerId) {
        where.carerId = carerId;
      }
    }

    if (shiftId) {
      where.shiftId = shiftId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (templateId) {
      where.templateId = templateId;
    }

    if (startDate) {
      where.submittedAt = { ...(where.submittedAt as object), gte: startDate };
    }

    if (endDate) {
      where.submittedAt = { ...(where.submittedAt as object), lte: endDate };
    }

    const [visitNotes, total] = await Promise.all([
      prisma.visitNote.findMany({
        where,
        select: {
          id: true,
          formSchemaSnapshot: true,
          submittedAt: true,
          shift: {
            select: {
              id: true,
              scheduledStart: true,
              scheduledEnd: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          carer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.visitNote.count({ where }),
    ]);

    // Transform to include template info from snapshot
    const notesWithTemplateInfo = visitNotes.map((note) => {
      const snapshot = note.formSchemaSnapshot as unknown as FormSchemaSnapshot;
      return {
        id: note.id,
        templateName: snapshot.templateName,
        templateVersion: snapshot.version,
        submittedAt: note.submittedAt.toISOString(),
        shift: {
          id: note.shift.id,
          scheduledStart: note.shift.scheduledStart.toISOString(),
          scheduledEnd: note.shift.scheduledEnd.toISOString(),
        },
        client: note.client,
        carer: note.carer,
      };
    });

    return NextResponse.json({
      visitNotes: notesWithTemplateInfo,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching visit notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit notes" },
      { status: 500 }
    );
  }
}

// POST /api/visit-notes - Submit a visit note
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - either can create notes or can view all notes (admin/manager)
    const canCreateOwn = hasPermission(session.user.role, PERMISSIONS.VISIT_NOTE_CREATE);
    const canManageAll = hasPermission(session.user.role, PERMISSIONS.VISIT_NOTE_VIEW_ALL);

    if (!canCreateOwn && !canManageAll) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createVisitNoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { templateId, shiftId, clientId, data } = validation.data;

    // Get the shift - admins/managers can access any shift in their company
    const shift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        companyId: session.user.companyId,
        // If user can manage all, don't restrict by carer
        ...(canManageAll ? {} : { carerId: session.user.id }),
      },
      include: {
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!shift) {
      return NextResponse.json(
        { error: "Shift not found or not accessible" },
        { status: 404 }
      );
    }

    // Verify the client matches the shift
    if (shift.clientId !== clientId) {
      return NextResponse.json(
        { error: "Client does not match shift assignment" },
        { status: 400 }
      );
    }

    // Determine if this is being submitted on behalf of someone else
    const isSubmittedOnBehalf = shift.carerId !== session.user.id;

    // Get the template with its full structure
    const template = await prisma.formTemplate.findFirst({
      where: {
        id: templateId,
        companyId: session.user.companyId,
        isEnabled: true,
        status: "ACTIVE",
      },
      include: {
        sections: {
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found or not enabled" },
        { status: 404 }
      );
    }

    // Validate all field values
    const validationErrors: Record<string, string> = {};
    for (const section of template.sections) {
      for (const field of section.fields) {
        const value = data[field.id];
        const fieldValidation = validateFieldValue(
          field.type,
          value,
          field.required,
          field.config
        );
        if (!fieldValidation.valid && fieldValidation.error) {
          validationErrors[field.id] = fieldValidation.error;
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // Create form schema snapshot
    const formSchemaSnapshot: FormSchemaSnapshot = {
      templateId: template.id,
      templateName: template.name,
      version: template.version,
      sections: template.sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description || undefined,
        order: section.order,
        fields: section.fields.map((field) => ({
          id: field.id,
          label: field.label,
          description: field.description || undefined,
          type: field.type,
          required: field.required,
          order: field.order,
          config: field.config as any,
        })),
      })),
    };

    // Process file fields - handle both base64 and file URLs
    const fileFields: { fieldId: string; fileUrl: string; fileName: string; fileType: string; fileSize: number }[] = [];
    const processedData = { ...data };

    for (const section of template.sections) {
      for (const field of section.fields) {
        if (
          (field.type === "SIGNATURE" || field.type === "PHOTO") &&
          data[field.id]
        ) {
          const fieldValue = data[field.id];

          if (typeof fieldValue === "string" && fieldValue.length > 0) {
            // Base64 data - save to file
            try {
              const savedFile = await saveBase64File(
                fieldValue,
                field.type as "SIGNATURE" | "PHOTO"
              );
              fileFields.push({ fieldId: field.id, ...savedFile });
              // Update the data with the file URL instead of base64
              processedData[field.id] = { fileUrl: savedFile.fileUrl };
            } catch (err) {
              console.error(`Error saving ${field.type} file:`, err);
              // Keep the original value if save fails
            }
          } else if (typeof fieldValue === "object" && fieldValue !== null) {
            // File object with URL
            const fileObj = fieldValue as { fileUrl?: string; fileName?: string; fileType?: string; fileSize?: number };
            if (fileObj.fileUrl) {
              fileFields.push({
                fieldId: field.id,
                fileUrl: fileObj.fileUrl,
                fileName: fileObj.fileName || fileObj.fileUrl.split("/").pop() || "file",
                fileType: fileObj.fileType || "image/png",
                fileSize: fileObj.fileSize || 0,
              });
            }
          }
        }
      }
    }

    // Create the visit note
    const visitNote = await prisma.visitNote.create({
      data: {
        companyId: session.user.companyId,
        templateId,
        templateVersion: template.version,
        shiftId,
        clientId,
        carerId: shift.carerId, // The carer assigned to the shift
        submittedById: session.user.id, // Who actually submitted the note
        formSchemaSnapshot: formSchemaSnapshot as unknown as Prisma.InputJsonValue,
        data: processedData as unknown as Prisma.InputJsonValue,
        files: {
          create: fileFields.map((file) => ({
            fieldId: file.fieldId,
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize: file.fileSize,
            fileUrl: file.fileUrl,
          })),
        },
      },
      include: {
        shift: {
          select: {
            id: true,
            scheduledStart: true,
            scheduledEnd: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        carer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        files: true,
      },
    });

    // Create audit log with detailed tracking
    await prisma.auditLog.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        action: isSubmittedOnBehalf ? "VISIT_NOTE_CREATED_ON_BEHALF" : "VISIT_NOTE_CREATED",
        entityType: "VisitNote",
        entityId: visitNote.id,
        changes: {
          templateId,
          templateName: template.name,
          shiftId,
          clientId,
          carerId: shift.carerId,
          carerName: `${shift.carer.firstName} ${shift.carer.lastName}`,
          submittedById: session.user.id,
          submittedOnBehalf: isSubmittedOnBehalf,
        },
      },
    });

    return NextResponse.json({ visitNote }, { status: 201 });
  } catch (error) {
    console.error("Error creating visit note:", error);
    return NextResponse.json(
      { error: "Failed to create visit note" },
      { status: 500 }
    );
  }
}
