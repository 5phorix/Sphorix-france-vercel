import { redirect } from "next/navigation";

import ChatbotAdminConsole from "@/components/admin/ChatbotAdminConsole";
import { isChatbotAdministrator } from "@/lib/chatbot/admin";

export const dynamic = "force-dynamic";

export default async function ChatbotAdministrationPage() {
  if (!(await isChatbotAdministrator())) redirect("/administration/connexion?access=denied");
  return <ChatbotAdminConsole />;
}
