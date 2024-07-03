import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/database/mongoose';
import Transaction from '@/lib/database/models/transaction.model';
import { updateCredits } from '@/lib/actions/user.actions';

const webhookId = process.env.PAYPAL_WEBHOOK_ID!;

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get('paypal-transmission-sig');
  const timestamp = req.headers.get('paypal-transmission-time');
  const webhookEvent = req.headers.get('paypal-transmission-id');
  const certUrl = req.headers.get('paypal-cert-url');

  // Verify the webhook signature
  const expectedSignature = crypto.createHmac('sha256', webhookId)
    .update(webhookEvent + '|' + timestamp + '|' + body)
    .digest('base64');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  try {
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