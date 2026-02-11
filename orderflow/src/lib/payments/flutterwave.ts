const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;
const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

interface FlutterwavePaymentOptions {
  tx_ref: string;
  amount: number;
  currency?: string;
  redirect_url: string;
  customer: {
    email: string;
    phone_number?: string;
    name?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  payment_options?: string;
  meta?: Record<string, unknown>;
}

interface FlutterwaveResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface FlutterwavePaymentData {
  link: string;
}

interface FlutterwaveVerifyData {
  id: number;
  tx_ref: string;
  flw_ref: string;
  device_fingerprint: string;
  amount: number;
  currency: string;
  charged_amount: number;
  app_fee: number;
  merchant_fee: number;
  processor_response: string;
  auth_model: string;
  ip: string;
  narration: string;
  status: "successful" | "failed" | "pending";
  payment_type: string;
  created_at: string;
  account_id: number;
  customer: {
    id: number;
    name: string;
    phone_number: string;
    email: string;
    created_at: string;
  };
  card?: {
    first_6digits: string;
    last_4digits: string;
    issuer: string;
    country: string;
    type: string;
    token: string;
    expiry: string;
  };
}

async function flutterwaveRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<FlutterwaveResponse<T>> {
  const response = await fetch(`${FLUTTERWAVE_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Flutterwave request failed");
  }

  return data;
}

export async function createPaymentLink(
  options: FlutterwavePaymentOptions
): Promise<string> {
  const response = await flutterwaveRequest<FlutterwavePaymentData>(
    "/payments",
    {
      method: "POST",
      body: JSON.stringify({
        ...options,
        currency: options.currency || "NGN",
      }),
    }
  );

  return response.data.link;
}

export async function verifyPayment(
  transactionId: string
): Promise<FlutterwaveVerifyData> {
  const response = await flutterwaveRequest<FlutterwaveVerifyData>(
    `/transactions/${transactionId}/verify`
  );

  return response.data;
}

export async function verifyPaymentByRef(
  tx_ref: string
): Promise<FlutterwaveVerifyData> {
  const response = await flutterwaveRequest<{ data: FlutterwaveVerifyData[] }>(
    `/transactions?tx_ref=${tx_ref}`
  );

  if (!response.data.data || response.data.data.length === 0) {
    throw new Error("Transaction not found");
  }

  return response.data.data[0];
}

export async function initiateTransfer(options: {
  account_bank: string;
  account_number: string;
  amount: number;
  currency?: string;
  narration?: string;
  reference?: string;
  beneficiary_name?: string;
}): Promise<{ id: number; status: string; reference: string }> {
  const reference =
    options.reference ||
    `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const response = await flutterwaveRequest<{
    id: number;
    status: string;
    reference: string;
  }>("/transfers", {
    method: "POST",
    body: JSON.stringify({
      ...options,
      currency: options.currency || "NGN",
      reference,
    }),
  });

  return response.data;
}

export async function getBanks(
  country: string = "NG"
): Promise<Array<{ id: number; name: string; code: string }>> {
  const response = await flutterwaveRequest<
    Array<{ id: number; name: string; code: string }>
  >(`/banks/${country}`);

  return response.data;
}

export async function verifyBankAccount(options: {
  account_number: string;
  account_bank: string;
}): Promise<{ account_number: string; account_name: string }> {
  const response = await flutterwaveRequest<{
    account_number: string;
    account_name: string;
  }>("/accounts/resolve", {
    method: "POST",
    body: JSON.stringify(options),
  });

  return response.data;
}

export function generateTransactionRef(): string {
  return `flw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
