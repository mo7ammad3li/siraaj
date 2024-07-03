"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import Transaction from "@/lib/database/models/transaction.model";

export async function initiateCheckout({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) {
  try {
    await connectToDatabase();

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-paypal-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan,
        amount,
        credits,
        buyerId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create PayPal order");
    }

    const data = await response.json();
    return data.approvalUrl;
  } catch (error) {
    console.error("Error initiating checkout:", error);
    throw error;
  }
}