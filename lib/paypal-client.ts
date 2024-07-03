import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const environment = process.env.NODE_ENV === 'production'
  ? new checkoutNodeJssdk.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_SECRET!)
  : new checkoutNodeJssdk.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_SECRET!);

const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

export default client;