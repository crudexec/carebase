import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, ArrowRight } from "lucide-react";

async function getStoreData(slug: string) {
  const business = await db.business.findUnique({
    where: { slug, storeEnabled: true },
    include: {
      products: {
        where: { status: "ACTIVE" },
        take: 8,
        orderBy: { createdAt: "desc" },
      },
      categories: {
        take: 6,
      },
    },
  });
  return business;
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreData(slug);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to {store.name}</h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {store.description || "Discover amazing products at great prices"}
          </p>
          <Link
            href={`/store/${slug}/products`}
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Shop Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      {store.categories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {store.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/store/${slug}/products?category=${category.slug}`}
                  className="group"
                >
                  <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-4xl">
                        {category.name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-center font-medium">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link
              href={`/store/${slug}/products`}
              className="text-primary hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {store.products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available yet</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {store.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/store/${slug}/products/${product.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition">
                    <div className="aspect-square bg-gray-100 relative">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                          {product.name[0]}
                        </div>
                      )}
                      {product.comparePrice && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {formatCurrency(Number(product.price))}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(Number(product.comparePrice))}
                          </span>
                        )}
                      </div>
                      <button className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition">
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4 p-6 bg-white rounded-xl border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Quick and reliable shipping
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-xl border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">
                  100% secure transactions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-xl border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  We're here to help
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
