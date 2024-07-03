import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { auth } from "@clerk/nextjs";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"; // Use sandbox for testing

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
  // Check authentication
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { plan, amount, credits, buyerId } = await req.json();
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
            custom_id: JSON.stringify({ plan, credits, buyerId }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PayPal API error:", errorData);
      return NextResponse.json({ error: "Error creating PayPal order" }, { status: response.status });
    }

    const order = await response.json();
    const approvalUrl = order.links.find((link: any) => link.rel === "approve")?.href;

    return NextResponse.json({ orderId: order.id, approvalUrl });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json({ error: "Error creating PayPal order" }, { status: 500 });
  }
}