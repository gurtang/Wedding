import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = (await searchParams) ?? {};

  return (
    <main className="wedding-container py-16">
      <form action="/admin/login/submit" method="post" className="mx-auto max-w-md rounded-3xl border border-[#e8d9bf] bg-white p-6 shadow-sm">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#463316]">Admin login</h1>
        <p className="mt-2 text-sm text-neutral-600">Pristup dashboard-u za upravljanje pozivnicama.</p>
        <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
            <input name="username" className="w-full rounded-xl border border-[#d4c2a2] px-3 py-2 focus:border-[#b4945a] focus:outline-none" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
            <input name="password" type="password" className="w-full rounded-xl border border-[#d4c2a2] px-3 py-2 focus:border-[#b4945a] focus:outline-none" required />
        </div>
        {params.error ? <p className="text-sm text-rose-700">Pogresno korisnicko ime ili lozinka.</p> : null}
          <button className="w-full rounded-full bg-[#a68149] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#8e6b39]">
          Sign in
        </button>
        </div>
      </form>
    </main>
  );
}
