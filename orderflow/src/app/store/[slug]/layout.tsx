import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ShoppingCart, Search, Menu } from "lucide-react";

async function getStore(slug: string) {
  const business = await db.business.findUnique({
    where: { slug, storeEnabled: true },
  });
  return business;
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore(slug);

  if (!store) {
    notFound();
  }

  const theme = (store.storeTheme as { primaryColor?: string }) || {};
  const primaryColor = theme.primaryColor || "#3b82f6";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href={`/store/${slug}`} className="flex items-center gap-2">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.name[0]}
                </div>
              )}
              <span className="font-bold text-xl hidden sm:block">{store.name}</span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full h-10 pl-9 pr-4 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                href={`/store/${slug}/cart`}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  0
                </span>
              </Link>
              <button className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Store Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-bold mb-4">{store.name}</h3>
              <p className="text-sm text-muted-foreground">
                {store.description || "Welcome to our store"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`/store/${slug}`} className="hover:text-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href={`/store/${slug}/products`} className="hover:text-primary">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href={`/store/${slug}/cart`} className="hover:text-primary">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {store.email && <li>{store.email}</li>}
                {store.phone && <li>{store.phone}</li>}
                {store.address && <li>{store.address}</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">We Accept</h4>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-gray-100 rounded text-xs">Visa</div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs">Mastercard</div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs">Transfer</div>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>Powered by OrderFlow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
