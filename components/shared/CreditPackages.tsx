"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { initiateCheckout } from "@/lib/actions/transaction.action";

export default function CreditPackages({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePurchase = async (plan: typeof plans[0]) => {
    try {
      setIsLoading(plan.name);
      const checkoutUrl = await initiateCheckout({
        plan: plan.name,
        amount: plan.price,
        credits: plan.credits,
        buyerId: userId,
      });
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to initiate checkout");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <ul className="credit-packages-list">
      {plans.map((plan) => (
        <li key={plan.name} className="credit-package-item">
          <div className="package-info">
            <Image src={plan.icon} alt={`${plan.name} icon`} width={50} height={50} />
            <h3>{plan.name}</h3>
            <p>${plan.price}</p>
            <p>{plan.credits} Credits</p>
          </div>
          <Button
            onClick={() => handlePurchase(plan)}
            disabled={isLoading === plan.name}
            className="purchase-button"
          >
            {isLoading === plan.name ? "Processing..." : "Purchase"}
          </Button>
        </li>
      ))}
    </ul>
  );
}