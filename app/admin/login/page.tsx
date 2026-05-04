import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  try {
    if (await isAdminAuthenticated()) {
      redirect("/admin");
    }
  } catch (error) {
    // Never break login page rendering in production due to auth helper issues.
    console.error("Admin login auth check failed:", error);
  }

  const params = (await searchParams) ?? {};

  return (
    <main className="wedding-container py-16">
      <div
        className="mx-auto max-w-xl rounded-3xl border p-8 sm:p-10"
        style={{
          background: "white",
          borderColor: "var(--rose-lt)",
          boxShadow: "0 18px 48px rgba(120, 85, 48, 0.12)",
        }}
      >
        <p
          className="text-center font-montserrat text-[10px] uppercase tracking-[0.3em]"
          style={{ color: "var(--gold)" }}
        >
          Administracija
        </p>
        <h1
          className="mt-3 text-center font-great-vibes leading-none"
          style={{ fontSize: "clamp(46px,8vw,64px)", color: "var(--rose-dk)" }}
        >
          Admin login
        </h1>
        <p className="mt-4 text-center font-cormorant text-lg" style={{ color: "var(--ink-lt)" }}>
          Pristup dashboard-u za upravljanje pozivnicama.
        </p>

        <form action="/admin/login/submit" method="post" className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block font-montserrat text-[11px] uppercase tracking-[0.2em]"
              style={{ color: "var(--ink-lt)" }}
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              required
              className="w-full rounded-none border px-4 py-3 font-cormorant text-lg outline-none transition"
              style={{ borderColor: "var(--rose-lt)", background: "var(--cream)", color: "var(--ink)" }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-montserrat text-[11px] uppercase tracking-[0.2em]"
              style={{ color: "var(--ink-lt)" }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-none border px-4 py-3 font-cormorant text-lg outline-none transition"
              style={{ borderColor: "var(--rose-lt)", background: "var(--cream)", color: "var(--ink)" }}
            />
          </div>
          {params.error ? (
            <p className="text-center font-cormorant text-base" style={{ color: "var(--rose-dk)" }}>
              Pogrešno korisničko ime ili lozinka.
            </p>
          ) : null}
          <button
            className="w-full border px-6 py-4 font-montserrat text-[11px] uppercase tracking-[0.24em] text-white transition"
            style={{ borderColor: "var(--rose-dk)", background: "var(--rose-dk)" }}
          >
            Prijava
          </button>
        </form>
      </div>
    </main>
  );
}
