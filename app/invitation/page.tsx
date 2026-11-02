import type { Metadata } from "next";

import InvitationForm from "@/components/account/InvitationForm";

export const metadata: Metadata = {
  title: "Activer mon espace client | Sphorix France",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <InvitationForm token={token ?? ""} />;
}
