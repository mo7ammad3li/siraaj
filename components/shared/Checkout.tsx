"use client";

import { useToast } from "@/components/ui/use-toast";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";

interface PromoCodes {
  [key: string]: number;
}

const promoCodes: PromoCodes = {
  DISCOUNT25: 0.75,
  // Add more promo codes and their discount multipliers here
};

const PayPalButtonWrapper = ({ amount, plan, credits, buyerId }: { amount: number; plan: string; credits: number; buyerId: string }) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { toast } = useToast();

  const handleApprove = async (data: any, actions: any) => {
    try {
      const order = await actions.order.capture();
      console.log("Payment successful", order);
      toast({
        title: "Payment successful",
        description: `You've purchased ${credits} credits.`,
        duration: 5000,
        className: "success-toast",
      });
      // Additional logic here (e.g., updating user's credits in your backend)
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        duration: 5000,
        className: "error-toast",
      });
    }
  };

  if (isPending) return <div>Loading PayPal Buttons...</div>;

  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      createOrder={(data, actions) => {
        return actions.order.create({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount.toFixed(2),
              },
              custom_id: `${plan}|${credits}|${buyerId}`,
            },
          ],
        });
      }}
      onApprove={handleApprove}
      onError={(err) => {
        console.error("PayPal Error:", err);
        toast({
          title: "PayPal Error",
          description: "There was an error with PayPal. Please try again.",
          duration: 5000,
          className: "error-toast",
        });
      }}
    />
  );
};

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  const [isPromoCodeValid, setIsPromoCodeValid] = useState(true);

  useEffect(() => {
    // Reset discounted amount when original amount changes
    setDiscountedAmount(amount);
  }, [amount]);

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value.toUpperCase());
  };

  const applyPromoCode = () => {
    const discountMultiplier = promoCodes[promoCode];
    if (discountMultiplier) {
      setDiscountedAmount(amount * discountMultiplier);
      setIsPromoCodeValid(true);
      toast({
        title: "Promo code applied!",
        description: `You received a ${(1 - discountMultiplier) * 100}% discount.`,
        duration: 5000,
        className: "success-toast",
      });
    } else {
      setIsPromoCodeValid(false);
      toast({
        title: "Invalid promo code",
        description: "Please try a different code.",
        duration: 5000,
        className: "error-toast",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{plan}</h2>
      <p className="text-lg">Credits: {credits}</p>
      <p className="text-lg">Price: ${discountedAmount.toFixed(2)}</p>
      {plan !== "Free" && (
        <>
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={handlePromoCodeChange}
            className={`border rounded p-2 w-full ${
              isPromoCodeValid ? "" : "border-red-500"
            }`}
          />
          <Button
            onClick={applyPromoCode}
            className="w-full rounded bg-purple-600 text-white"
          >
            Apply Promo Code
          </Button>
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              currency: "USD",
              intent: "capture",
            }}
          >
            <PayPalButtonWrapper
              amount={discountedAmount}
              plan={plan}
              credits={credits}
              buyerId={buyerId}
            />
          </PayPalScriptProvider>
        </>
      )}
    </div>
  );
};

export default Checkout;