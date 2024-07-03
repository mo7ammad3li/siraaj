"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CreditPackageProps {
  plan: {
    name: string;
    icon: string;
    price: number;
    credits: number;
  };
  onSelect: () => void;
}

export default function CreditPackage({ plan, onSelect }: CreditPackageProps) {
  return (
    <li className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <Image src={plan.icon} alt={`${plan.name} icon`} width={50} height={50} />
      <h3 className="mt-4 text-xl font-semibold text-purple-600">{plan.name}</h3>
      <p className="mt-2 text-3xl font-bold">${plan.price}</p>
      <p className="mt-1 text-gray-600">{plan.credits} Credits</p>
      <Button
        onClick={onSelect}
        className="mt-6 w-full"
        variant={plan.name === "Free" ? "outline" : "default"}
      >
        {plan.name === "Free" ? "Free Consumable" : "Select"}
      </Button>
    </li>
  );
}