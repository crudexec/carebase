const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackInitializeOptions {
  email: string;
  amount: number; // in kobo (multiply by 100)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  channels?: ("card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer")[];
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyData {
  id: number;
  domain: string;
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  customer: {
    id: number;
    email: string;
    customer_code: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
  };
}

async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Paystack request failed");
  }

  return data;
}

export async function initializePayment(
  options: PaystackInitializeOptions
): Promise<PaystackInitializeData> {
  const reference = options.reference || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const response = await paystackRequest<PaystackInitializeData>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        ...options,
        amount: options.amount * 100, // Convert to kobo
        reference,
      }),
    }
  );

  return response.data;
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyData> {
  const response = await paystackRequest<PaystackVerifyData>(
    `/transaction/verify/${reference}`
  );

  return response.data;
}

export async function createTransferRecipient(options: {
  type: "nuban" | "mobile_money" | "basa";
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}): Promise<{ recipient_code: string }> {
  const response = await paystackRequest<{ recipient_code: string }>(
    "/transferrecipient",
    {
      method: "POST",
      body: JSON.stringify({
        ...options,
        currency: options.currency || "NGN",
      }),
    }
  );

  return response.data;
}

export async function initiateTransfer(options: {
  amount: number;
  recipient: string; // recipient_code
  reason?: string;
  reference?: string;
}): Promise<{ reference: string; status: string }> {
  const response = await paystackRequest<{ reference: string; status: string }>(
    "/transfer",
    {
      method: "POST",
      body: JSON.stringify({
        source: "balance",
        amount: options.amount * 100,
        recipient: options.recipient,
        reason: options.reason,
        reference: options.reference,
      }),
    }
  );

  return response.data;
}

export async function getBanks(): Promise<
  Array<{ name: string; code: string; slug: string }>
> {
  const response = await paystackRequest<
    Array<{ name: string; code: string; slug: string }>
  >("/bank");

  return response.data;
}

export function generatePaymentLink(options: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
}): string {
  const params = new URLSearchParams({
    email: options.email,
    amount: (options.amount * 100).toString(),
    ref: options.reference,
    callback_url: options.callbackUrl,
  });

  return `https://checkout.paystack.com/?${params.toString()}`;
}
