export function postLoginDestination(role: string | null | undefined, isActive: boolean) {
  return isActive && (role === "owner" || role === "admin")
    ? "/administration"
    : "/compte";
}