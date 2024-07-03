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
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const checkoutUrl = await checkoutCredits({
        plan,
        amount,
        credits,
        buyerId,
      });
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create PayPal order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "An error occurred during checkout. Please try again.",
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      className="w-full rounded bg-purple-600 text-white mt-2"
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Checkout with PayPal"}
    </Button>
  );
};

export default Checkout;