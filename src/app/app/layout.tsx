import { AppShell } from "@/components/app/AppShell";
import { Providers } from "@/components/app/Providers";

export const metadata = {
  title: "Collection · Cardfolio",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
