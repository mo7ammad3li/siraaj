import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/database/mongoose';
import Transaction from '@/lib/database/models/transaction.model';
import { updateCredits } from '@/lib/actions/user.actions';
import fetch from "node-fetch";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"; // Use sandbox for testing
const webhookId = process.env.PAYPAL_WEBHOOK_ID!;

async function verifyWebhookSignature(
  transmissionId: string,
  transmissionTime: string,
  webhookId: string,
  event: string,
  transmissionSig: string,
  certUrl: string
) {
  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: "SHA256withRSA",
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await req.text();
  const transmissionSig = req.headers.get('paypal-transmission-sig') || '';
  const transmissionTime = req.headers.get('paypal-transmission-time') || '';
  const transmissionId = req.headers.get('paypal-transmission-id') || '';
  const certUrl = req.headers.get('paypal-cert-url') || '';

  const event = JSON.parse(body);

  try {
    const isVerified = await verifyWebhookSignature(
      transmissionId,
      transmissionTime,
      webhookId,
      event,
      transmissionSig,
      certUrl
    );

    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const { id, amount, custom_id } = event.resource;
      const { plan, credits, buyerId } = JSON.parse(custom_id);

      await connectToDatabase();

      // Create a new transaction
      await Transaction.create({
        createdAt: new Date(),
        paypalId: id,
        amount: parseFloat(amount.value),
        plan,
        credits,
        buyer: buyerId,
      });

      // Update the user's credits
      await updateCredits(buyerId, credits);

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ message: 'Event type not handled' });
    }
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}