"use server";

import paypalClient from '../paypal-client';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { redirect } from 'next/navigation';

interface CheckoutTransactionParams {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}

export async function initiateCheckout(transaction: CheckoutTransactionParams) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: transaction.amount.toString()
        },
        description: `${transaction.credits} credits for ${transaction.plan} plan`,
        custom_id: JSON.stringify({
          plan: transaction.plan,
          credits: transaction.credits,
          buyerId: transaction.buyerId
        })
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/credits`
      }
    });

    const order = await paypalClient.execute(request);
    
    if (order.result.id) {
      return `https://www.paypal.com/checkoutnow?token=${order.result.id}`;
    } else {
      throw new Error('Failed to create PayPal order');
    }
  } catch (error) {
    console.error('PayPal checkout error:', error);
    throw error;
  }
}

// ... other transaction-related functions
export async function checkoutCredits(transaction: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: transaction.amount.toString()
        },
        description: `${transaction.credits} credits for ${transaction.plan} plan`,
        custom_id: JSON.stringify({
          plan: transaction.plan,
          credits: transaction.credits,
          buyerId: transaction.buyerId
        })
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/credits`
      }
    });

    const order = await paypalClient.execute(request);
    
    if (order.result.id) {
      return { orderId: order.result.id };
    } else {
      throw new Error('Failed to create PayPal order');
    }
  } catch (error) {
    console.error('PayPal checkout error:', error);
    throw error;
  }
}