import type { Metadata } from "next";
import QRCode from "qrcode";
import { PrintPhotosCardButton } from "@/components/photos/print-photos-card-button";
import { guestPhotosUrl } from "@/lib/photos";

const printCards = Array.from({ length: 9 }, (_, index) => index);

export const metadata: Metadata = {
  title: "Podelite slike | Milena & Slobodan",
  description: "QR kod za zajednički album venčanja Milene i Slobodana.",
};

function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 92 92"
      className={className}
      fill="none"
    >
      <path
        d="M15 76C22 58 33 45 51 34"
        stroke="#8d9a67"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 56C22 51 18 43 19 34C28 37 34 44 35 54"
        fill="#e8b9b5"
        opacity="0.9"
      />
      <path
        d="M46 39C39 32 37 24 41 16C49 21 54 29 52 39"
        fill="#d89a9e"
        opacity="0.88"
      />
      <path
        d="M58 31C57 21 61 14 70 10C73 20 69 28 60 34"
        fill="#f2d6c9"
      />
      <path
        d="M24 67C30 65 36 65 42 69C36 75 29 76 22 72"
        fill="#a9b382"
      />
      <path
        d="M39 48C45 47 51 49 55 54C48 58 41 57 36 52"
        fill="#889765"
      />
      <circle cx="45" cy="36" r="3" fill="#c59a58" />
      <circle cx="31" cy="56" r="2.5" fill="#b5844a" />
    </svg>
  );
}

function OrnamentalBorder() {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-[4mm] h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#b5945f] to-transparent" />
      <div className="pointer-events-none absolute bottom-[4mm] left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#b5945f] to-transparent" />
      <span className="pointer-events-none absolute left-[6mm] top-[6mm] h-1.5 w-1.5 rounded-full bg-[#c69a6a]" />
      <span className="pointer-events-none absolute right-[6mm] top-[6mm] h-1.5 w-1.5 rounded-full bg-[#c69a6a]" />
      <span className="pointer-events-none absolute bottom-[6mm] left-[6mm] h-1.5 w-1.5 rounded-full bg-[#c69a6a]" />
      <span className="pointer-events-none absolute bottom-[6mm] right-[6mm] h-1.5 w-1.5 rounded-full bg-[#c69a6a]" />
    </>
  );
}

function PhotosQrCard({
  qrSvg,
  compact = false,
}: {
  qrSvg: string;
  compact?: boolean;
}) {
  return (
    <article
      className={
        compact
          ? "photos-print-card relative overflow-hidden border border-[#d8bf94] bg-white text-center text-[#332c24]"
          : "relative flex w-full max-w-[620px] flex-col items-center overflow-hidden rounded-[30px] border border-[#d8bf94] bg-white px-7 py-10 text-center shadow-[0_20px_80px_rgba(75,55,25,0.12)]"
      }
    >
      {compact && <OrnamentalBorder />}
      <FloralCorner
        className={
          compact
            ? "absolute left-[2mm] top-[2mm] h-14 w-14 opacity-90"
            : "absolute left-3 top-3 h-20 w-20 opacity-85"
        }
      />
      <FloralCorner
        className={
          compact
            ? "absolute bottom-[2mm] right-[2mm] h-14 w-14 rotate-180 opacity-90"
            : "absolute bottom-3 right-3 h-20 w-20 rotate-180 opacity-85"
        }
      />

      <p
        className={
          compact
            ? "relative font-[family-name:var(--font-montserrat)] text-[7.4px] font-semibold uppercase tracking-[0.16em] text-[#a68149]"
            : "relative font-[family-name:var(--font-montserrat)] text-[11px] uppercase tracking-[0.34em] text-[#a68149]"
        }
      >
        Milena & Slobodan
      </p>

      <h1
        className={
          compact
            ? "relative mt-1 font-[family-name:var(--font-great-vibes)] text-[28px] leading-none text-[#9d5f61]"
            : "relative mt-5 font-[family-name:var(--font-great-vibes)] text-[64px] leading-none text-[#9d5f61] sm:text-[86px]"
        }
      >
        Podelite slike
      </h1>

      <p
        className={
          compact
            ? "relative mt-1 font-[family-name:var(--font-cormorant)] text-[12.5px] leading-tight text-[#463518]"
            : "relative mt-5 max-w-[560px] font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#463518] sm:text-3xl"
        }
      >
        Sačuvajmo zajedno uspomene iz vašeg ugla.
      </p>

      <div
        className={
          compact
            ? "relative my-1.5 h-px w-16 bg-gradient-to-r from-transparent via-[#b5945f] to-transparent"
            : "relative my-8 h-px w-32 bg-gradient-to-r from-transparent via-[#b5945f] to-transparent"
        }
      />

      <div
        className={
          compact
            ? "relative rounded-[12px] border border-[#d8bf94] bg-[#fffaf2] p-1.5 shadow-sm"
            : "relative rounded-[28px] border border-[#d8bf94] bg-[#fffaf2] p-4 shadow-sm"
        }
      >
        <div
          aria-label="QR kod za zajednički Google Photos album"
          className={
            compact
              ? "h-[72px] w-[72px] [&>svg]:h-full [&>svg]:w-full"
              : "h-[260px] w-[260px] [&>svg]:h-full [&>svg]:w-full sm:h-[340px] sm:w-[340px]"
          }
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      </div>

      <ol
        className={
          compact
            ? "relative mt-2 grid gap-0.5 text-left text-[7.2px] leading-tight text-[#5f513f]"
            : "relative mt-8 grid max-w-[590px] gap-3 text-left text-[15px] leading-relaxed text-[#5f513f] sm:text-base"
        }
      >
        <li><strong>1.</strong> Skenirajte QR kod kamerom telefona.</li>
        <li><strong>2.</strong> Otvorite Google Photos album.</li>
        <li><strong>3.</strong> Izaberite <strong>Join</strong> ili <strong>Pridruži se</strong>, pa dodajte svoje fotografije i snimke.</li>
      </ol>

      {!compact && (
        <p className="relative mt-7 max-w-[540px] text-sm leading-relaxed text-[#7b6a54]">
          Ako QR kod ne radi, otvorite pozivnicu i kliknite na dugme <strong>Otvori album</strong>.
          Za dodavanje slika Google može tražiti da budete prijavljeni na Google nalog.
        </p>
      )}
    </article>
  );
}

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
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[760px] flex-col items-center justify-center print:hidden">
        <PhotosQrCard qrSvg={qrSvg} />
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

      <section className="photos-print-sheet hidden print:grid" aria-label="Kartice za štampu i sečenje">
        {printCards.map((card) => (
          <PhotosQrCard key={card} qrSvg={qrSvg} compact />
        ))}
      </section>
    </main>
  );
}
