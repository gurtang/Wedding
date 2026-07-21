import { redirect } from "next/navigation";
import { getAdminWeddingAccount } from "./auth";

export async function requireAdmin() {
  const account = await getAdminWeddingAccount();
  if (!account) {
    redirect("/admin/login");
  }
  return account;
}


