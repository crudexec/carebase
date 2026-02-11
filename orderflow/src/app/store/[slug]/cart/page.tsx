"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

// Sample cart data - in production this would come from cart context/store
const initialCartItems = [
  {
    id: "1",
    productId: "p1",
    name: "Sample Product 1",
    image: null,
    price: 25000,
    quantity: 2,
  },
  {
    id: "2",
    productId: "p2",
    name: "Sample Product 2",
    image: null,
    price: 15000,
    quantity: 1,
  },
];

export default function CartPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            href={`/store/${slug}/products`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border overflow-hidden">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 flex gap-4 ${
                  index !== cartItems.length - 1 ? "border-b" : ""
                }`}
              >
                {/* Product Image */}
                <div className="h-24 w-24 bg-gray-100 rounded-lg flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                      {item.name[0]}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-primary font-bold mt-1">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded border hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded border hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Item Total & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={`/store/${slug}/products`}
            className="inline-flex items-center gap-2 text-primary mt-4 hover:underline"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Free shipping on orders over {formatCurrency(50000)}
                </p>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              href={`/store/${slug}/checkout`}
              className="block w-full bg-primary text-white text-center py-3 rounded-lg mt-6 hover:bg-primary/90"
            >
              Proceed to Checkout
            </Link>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Secure checkout powered by
              </p>
              <div className="flex justify-center gap-2">
                <div className="px-3 py-1 bg-gray-100 rounded text-xs">Paystack</div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs">Flutterwave</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
