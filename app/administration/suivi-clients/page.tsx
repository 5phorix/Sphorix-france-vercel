import { redirect } from "next/navigation";

import ClientPortalConsole from "@/components/admin/ClientPortalConsole";
import { getClientPortalAdministrator } from "@/lib/client-portal/admin";

export const dynamic = "force-dynamic";

export default async function ClientPortalAdministrationPage() {
  if (!(await getClientPortalAdministrator())) {
    redirect("/administration/connexion?access=denied");
  }

  return <ClientPortalConsole />;
}
