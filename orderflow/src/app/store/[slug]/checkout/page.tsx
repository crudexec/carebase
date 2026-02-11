"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Building, Smartphone, ChevronLeft, Lock } from "lucide-react";

const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  address: z.string().min(1, "Address required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  paymentMethod: z.enum(["card", "bank_transfer", "ussd"]),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

// Sample order data
const orderItems = [
  { name: "Sample Product 1", quantity: 2, price: 25000 },
  { name: "Sample Product 2", quantity: 1, price: 15000 },
];

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "card",
    },
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  const onSubmit = async (data: CheckoutInput) => {
    setIsLoading(true);
    // In production, this would:
    // 1. Create order in database
    // 2. Initialize payment with Paystack/Flutterwave
    // 3. Redirect to payment page
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate redirect to payment
    alert("In production, you would be redirected to the payment gateway.");
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Cart
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Checkout Form */}
        <div>
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    {...register("phone")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+234 800 000 0000"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      {...register("firstName")}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...register("lastName")}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    {...register("address")}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Street address"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      {...register("city")}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      {...register("state")}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === "card" ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    {...register("paymentMethod")}
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="h-4 w-4"
                  />
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Card Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Pay with Visa, Mastercard, or Verve
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === "bank_transfer"
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    {...register("paymentMethod")}
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                    className="h-4 w-4"
                  />
                  <Building className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">
                      Transfer to our bank account
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === "ussd" ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <input
                    type="radio"
                    {...register("paymentMethod")}
                    value="ussd"
                    checked={paymentMethod === "ussd"}
                    onChange={() => setPaymentMethod("ussd")}
                    className="h-4 w-4"
                  />
                  <Smartphone className="h-5 w-5" />
                  <div>
                    <p className="font-medium">USSD</p>
                    <p className="text-xs text-muted-foreground">
                      Pay using USSD code
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay {formatCurrency(total)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm border-t pt-4">
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
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Secure checkout
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <div className="px-3 py-1 bg-gray-100 rounded text-xs">Paystack</div>
                <div className="px-3 py-1 bg-gray-100 rounded text-xs">
                  Flutterwave
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
