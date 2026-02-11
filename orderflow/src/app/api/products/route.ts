import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db.product.findMany({
      where: { businessId: user.businessId },
      include: {
        category: true,
        inventory: {
          include: { location: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Generate unique slug
    let slug = slugify(validatedData.name);
    const existingProduct = await db.product.findUnique({
      where: {
        businessId_slug: {
          businessId: user.businessId,
          slug,
        },
      },
    });

    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create product with inventory
    const product = await db.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          businessId: user.businessId!,
          name: validatedData.name,
          slug,
          description: validatedData.description,
          sku: validatedData.sku,
          barcode: validatedData.barcode,
          price: validatedData.price,
          comparePrice: validatedData.comparePrice,
          costPrice: validatedData.costPrice,
          taxable: validatedData.taxable,
          trackQuantity: validatedData.trackQuantity,
          status: validatedData.status,
          images: validatedData.images,
          tags: validatedData.tags,
          weight: validatedData.weight,
          weightUnit: validatedData.weightUnit,
          categoryId: validatedData.categoryId,
        },
      });

      // Create inventory record for default location
      const defaultLocation = await tx.location.findFirst({
        where: {
          businessId: user.businessId!,
          isDefault: true,
        },
      });

      if (defaultLocation) {
        await tx.inventory.create({
          data: {
            productId: newProduct.id,
            locationId: defaultLocation.id,
            quantity: 0,
          },
        });
      }

      return newProduct;
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
