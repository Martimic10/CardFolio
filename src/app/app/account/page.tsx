import { Suspense } from "react";
import { AccountBillingView } from "@/components/app/AccountBillingView";

export const metadata = {
  title: "Settings · Cardfolio",
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="cf-panel px-6 py-16 text-center font-body text-sm text-charcoal">
          Loading account…
        </div>
      }
    >
      <AccountBillingView />
    </Suspense>
  );
}
