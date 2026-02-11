import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Generate unique slug for business
    let slug = slugify(validatedData.businessName);
    const existingBusiness = await db.business.findUnique({
      where: { slug },
    });

    if (existingBusiness) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create user and business in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          phone: validatedData.phone,
          password: hashedPassword,
        },
      });

      // Create business
      const business = await tx.business.create({
        data: {
          name: validatedData.businessName,
          slug,
          email: validatedData.email,
          phone: validatedData.phone,
        },
      });

      // Create default location
      await tx.location.create({
        data: {
          businessId: business.id,
          name: "Main Location",
          isDefault: true,
        },
      });

      // Add user as business owner
      await tx.businessMember.create({
        data: {
          businessId: business.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      return { user, business };
    });

    return NextResponse.json({
      message: "Account created successfully",
      userId: result.user.id,
      businessId: result.business.id,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
