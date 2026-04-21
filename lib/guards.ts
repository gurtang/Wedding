import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "./auth";

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    redirect("/admin/login");
  }
}


