import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";
import { checkoutCredits } from '@/lib/actions/transaction.action';

interface CheckoutProps {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}

const Checkout: React.FC<CheckoutProps> = ({ plan, amount, credits, buyerId }) => {
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      const result = await checkoutCredits({
        plan,
        amount,
        credits,
        buyerId,
      });
      
      if (result?.orderId) {
        window.location.href = `https://www.paypal.com/checkoutnow?token=${result.orderId}`;
      } else {
        throw new Error('Failed to create PayPal order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "An error occurred during checkout. Please try again.",
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleCheckout} className="w-full rounded bg-purple-600 text-white mt-2">
      Checkout with PayPal
    </Button>
  );
};

export default Checkout;