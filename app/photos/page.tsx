import type { Metadata } from "next";
import QRCode from "qrcode";
import { PrintPhotosCardButton } from "@/components/photos/print-photos-card-button";
import { guestPhotosUrl } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Podelite slike | Milena & Slobodan",
  description: "QR kod za zajednički album venčanja Milene i Slobodana.",
};

export default async function GuestPhotosPage() {
  const qrSvg = await QRCode.toString(guestPhotosUrl, {
    type: "svg",
    margin: 2,
    width: 720,
    color: {
      dark: "#332c24",
      light: "#fffaf2",
    },
  });

  return (
    <main className="min-h-screen bg-[#fbf5eb] px-5 py-8 text-[#332c24] print:bg-white print:p-0">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[760px] flex-col items-center justify-center border border-[#d8bf94] bg-white px-7 py-10 text-center shadow-[0_20px_80px_rgba(75,55,25,0.12)] print:min-h-screen print:max-w-none print:border-0 print:shadow-none">
        <p className="font-[family-name:var(--font-montserrat)] text-[11px] uppercase tracking-[0.34em] text-[#a68149]">
          Milena & Slobodan
        </p>

        <h1 className="mt-5 font-[family-name:var(--font-great-vibes)] text-[64px] leading-none text-[#9d5f61] sm:text-[86px]">
          Podelite slike
        </h1>

        <p className="mt-5 max-w-[560px] font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#463518] sm:text-3xl">
          Sačuvajmo zajedno uspomene iz vašeg ugla.
        </p>

        <div className="my-8 h-px w-32 bg-gradient-to-r from-transparent via-[#b5945f] to-transparent" />

        <div className="rounded-[28px] border border-[#d8bf94] bg-[#fffaf2] p-4 shadow-sm">
          <div
            aria-label="QR kod za zajednički Google Photos album"
            className="h-[260px] w-[260px] [&>svg]:h-full [&>svg]:w-full sm:h-[340px] sm:w-[340px]"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>

        <ol className="mt-8 grid max-w-[590px] gap-3 text-left text-[15px] leading-relaxed text-[#5f513f] sm:text-base">
          <li><strong>1.</strong> Skenirajte QR kod kamerom telefona.</li>
          <li><strong>2.</strong> Otvorite Google Photos album.</li>
          <li><strong>3.</strong> Izaberite <strong>Join</strong> ili <strong>Pridruži se</strong>, pa dodajte svoje fotografije i snimke.</li>
        </ol>

        <p className="mt-7 max-w-[540px] text-sm leading-relaxed text-[#7b6a54]">
          Ako QR kod ne radi, otvorite pozivnicu i kliknite na dugme <strong>Otvori album</strong>.
          Za dodavanje slika Google može tražiti da budete prijavljeni na Google nalog.
        </p>

        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <PrintPhotosCardButton />
          <a
            href={guestPhotosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 rounded-full border border-[#a68149] px-7 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#6c5228] transition hover:bg-[#a68149] hover:text-white"
          >
            Otvori album
          </a>
        </div>
      </section>
    </main>
  );
}
