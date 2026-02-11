import * as paystack from "./paystack";
import * as flutterwave from "./flutterwave";

export type PaymentProvider = "paystack" | "flutterwave";

export interface PaymentInitOptions {
  provider: PaymentProvider;
  email: string;
  amount: number;
  reference?: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  customerName?: string;
  customerPhone?: string;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  amount: number;
  status: string;
  provider: PaymentProvider;
  customerEmail: string;
  paidAt?: string;
  channel?: string;
}

export async function initializePayment(
  options: PaymentInitOptions
): Promise<{ paymentUrl: string; reference: string }> {
  const reference =
    options.reference ||
    `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  if (options.provider === "paystack") {
    const result = await paystack.initializePayment({
      email: options.email,
      amount: options.amount,
      reference,
      callback_url: options.callbackUrl,
      metadata: options.metadata,
    });

    return {
      paymentUrl: result.authorization_url,
      reference: result.reference,
    };
  }

  if (options.provider === "flutterwave") {
    const paymentUrl = await flutterwave.createPaymentLink({
      tx_ref: reference,
      amount: options.amount,
      redirect_url: options.callbackUrl,
      customer: {
        email: options.email,
        name: options.customerName,
        phone_number: options.customerPhone,
      },
      meta: options.metadata,
    });

    return { paymentUrl, reference };
  }

  throw new Error(`Unknown payment provider: ${options.provider}`);
}

export async function verifyPayment(
  provider: PaymentProvider,
  reference: string
): Promise<PaymentResult> {
  if (provider === "paystack") {
    const result = await paystack.verifyPayment(reference);

    return {
      success: result.status === "success",
      reference: result.reference,
      amount: result.amount / 100, // Convert from kobo
      status: result.status,
      provider: "paystack",
      customerEmail: result.customer.email,
      paidAt: result.paid_at,
      channel: result.channel,
    };
  }

  if (provider === "flutterwave") {
    const result = await flutterwave.verifyPaymentByRef(reference);

    return {
      success: result.status === "successful",
      reference: result.tx_ref,
      amount: result.amount,
      status: result.status,
      provider: "flutterwave",
      customerEmail: result.customer.email,
      paidAt: result.created_at,
      channel: result.payment_type,
    };
  }

  throw new Error(`Unknown payment provider: ${provider}`);
}

export { paystack, flutterwave };
