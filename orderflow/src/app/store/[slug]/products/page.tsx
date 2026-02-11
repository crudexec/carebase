import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Filter, Grid, List } from "lucide-react";

async function getProducts(slug: string, category?: string) {
  const business = await db.business.findUnique({
    where: { slug, storeEnabled: true },
    include: {
      products: {
        where: {
          status: "ACTIVE",
          ...(category && { category: { slug: category } }),
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      },
      categories: true,
    },
  });
  return business;
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { category } = await searchParams;
  const store = await getProducts(slug, category);

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-6 sticky top-24">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h3>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Categories</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/store/${slug}/products`}
                    className={`text-sm hover:text-primary ${
                      !category ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {store.categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/store/${slug}/products?category=${cat.slug}`}
                      className={`text-sm hover:text-primary ${
                        category === cat.slug
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                />
              </div>
            </div>

            <button className="w-full bg-primary text-white py-2 rounded-lg text-sm hover:bg-primary/90">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {category
                  ? store.categories.find((c) => c.slug === category)?.name ||
                    "Products"
                  : "All Products"}
              </h1>
              <p className="text-muted-foreground">
                {store.products.length} products found
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>Sort by: Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Best Selling</option>
              </select>
              <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
                <button className="p-1.5 rounded hover:bg-gray-100">
                  <Grid className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {store.products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
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
                      {product.category && (
                        <span className="text-xs text-muted-foreground">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="font-medium group-hover:text-primary transition line-clamp-2 mt-1">
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
      </div>
    </div>
  );
}
