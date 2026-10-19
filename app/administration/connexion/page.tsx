import { redirect } from "next/navigation";

export default function AdministrationLoginPage() {
  redirect("/connexion?area=administration");
}