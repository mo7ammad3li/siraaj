import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import CreditPackages from "@/components/shared/CreditPackages";
import Header from "@/components/shared/Header";
import { getUserById } from "@/lib/actions/user.actions";

export default async function CreditsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserById(userId);

  if (!user) {
    return <div>User not found. Please try logging in again.</div>;
  }

  return (
    <div className="credits-container">
      <Header
        title="Buy Credits"
        subtitle="Choose a credit package that suits your needs!"
      />
      <CreditPackages userId={user._id} />
    </div>
  );
}