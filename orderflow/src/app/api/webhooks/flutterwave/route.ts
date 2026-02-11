import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const FLUTTERWAVE_SECRET_HASH = process.env.FLUTTERWAVE_SECRET_HASH!;

function verifyWebhookSignature(signature: string | null): boolean {
  if (!signature) return false;
  return signature === FLUTTERWAVE_SECRET_HASH;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("verif-hash");

    // Verify webhook signature
    if (!verifyWebhookSignature(signature)) {
      console.error("Invalid Flutterwave webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Flutterwave webhook event:", body.event);

    switch (body.event) {
      case "charge.completed":
        await handleChargeCompleted(body.data);
        break;

      case "transfer.completed":
        await handleTransferCompleted(body.data);
        break;

      default:
        console.log(`Unhandled Flutterwave event: ${body.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleChargeCompleted(data: {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: string;
  customer: { email: string; name: string };
  payment_type: string;
  meta?: { orderId?: string };
}) {
  if (data.status !== "successful") {
    console.log(`Payment ${data.tx_ref} status: ${data.status}`);
    return;
  }

  const orderId = data.meta?.orderId;

  if (orderId) {
    // Update order payment status
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paidAmount: data.amount,
        status: "CONFIRMED",
      },
    });

    // Create payment record
    const paymentMethod = data.payment_type === "card" ? "CARD" : "BANK_TRANSFER";

    await db.payment.create({
      data: {
        orderId,
        amount: data.amount,
        method: paymentMethod,
        reference: data.flw_ref,
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
          totalSpent: { increment: data.amount },
          lastOrderAt: new Date(),
        },
      });
    }

    console.log(`Order ${orderId} payment confirmed via Flutterwave`);
  }
}

async function handleTransferCompleted(data: {
  id: number;
  reference: string;
  amount: number;
  status: string;
}) {
  console.log(`Transfer ${data.reference} completed with status: ${data.status}`);
  // Handle transfer completion
}
