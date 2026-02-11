import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;

      case "transfer.success":
        await handleTransferSuccess(event.data);
        break;

      case "transfer.failed":
        await handleTransferFailed(event.data);
        break;

      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(data: {
  reference: string;
  amount: number;
  customer: { email: string };
  paid_at: string;
  channel: string;
  metadata?: { orderId?: string };
}) {
  const { reference, amount, customer, paid_at, channel, metadata } = data;

  // Find order by reference or metadata
  const orderId = metadata?.orderId;

  if (orderId) {
    // Update order payment status
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paidAmount: amount / 100, // Convert from kobo
        status: "CONFIRMED",
      },
    });

    // Create payment record
    await db.payment.create({
      data: {
        orderId,
        amount: amount / 100,
        method: channel === "card" ? "CARD" : "BANK_TRANSFER",
        reference,
        status: "completed",
        metadata: data as object,
      },
    });

    // Update customer stats
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (order?.customerId) {
      await db.customer.update({
        where: { id: order.customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: amount / 100 },
          lastOrderAt: new Date(),
        },
      });
    }

    console.log(`Order ${orderId} payment confirmed via Paystack`);
  }
}

async function handleTransferSuccess(data: {
  reference: string;
  amount: number;
  recipient: { name: string; account_number: string };
}) {
  console.log(`Transfer ${data.reference} successful`);
  // Handle successful payout/transfer
}

async function handleTransferFailed(data: {
  reference: string;
  reason: string;
}) {
  console.log(`Transfer ${data.reference} failed: ${data.reason}`);
  // Handle failed transfer
}
