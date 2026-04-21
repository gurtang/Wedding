"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/translations";
import type { Language } from "@/lib/types";
import { getCountdown } from "@/lib/date";

export function Countdown({ deadline, language }: { deadline: string; language: Language }) {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(() => getCountdown(deadline));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setCountdown(getCountdown(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, mounted]);

  if (!mounted) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[#6f5b3c]">
          {t(language, "confirmBy")} <span className="font-semibold">{t(language, "deadlineDateText")}</span>
        </p>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-xl font-bold text-[#5a4320]">--</div><div className="text-xs text-[#7b6a54]">{t(language, "days")}</div></div>
          <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-xl font-bold text-[#5a4320]">--</div><div className="text-xs text-[#7b6a54]">{t(language, "hours")}</div></div>
          <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-xl font-bold text-[#5a4320]">--</div><div className="text-xs text-[#7b6a54]">{t(language, "minutes")}</div></div>
          <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-xl font-bold text-[#5a4320]">--</div><div className="text-xs text-[#7b6a54]">{t(language, "seconds")}</div></div>
        </div>
      </div>
    );
  }

  if (countdown.expired) {
    return (
      <div className="rounded-2xl border border-[#ead9ba] bg-[#fff9ef] p-4 text-sm text-[#7a5a2a]">
        {t(language, "deadlineExpiredElegant")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#6f5b3c]">
        {t(language, "confirmBy")} <span className="font-semibold">{t(language, "deadlineDateText")}</span>
      </p>
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-2xl font-bold text-[#5a4320]">{countdown.days}</div><div className="text-xs text-[#7b6a54]">{t(language, "days")}</div></div>
        <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-2xl font-bold text-[#5a4320]">{countdown.hours}</div><div className="text-xs text-[#7b6a54]">{t(language, "hours")}</div></div>
        <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-2xl font-bold text-[#5a4320]">{countdown.minutes}</div><div className="text-xs text-[#7b6a54]">{t(language, "minutes")}</div></div>
        <div className="rounded-2xl border border-[#e4d2b4] bg-white/90 p-3"><div className="text-2xl font-bold text-[#5a4320]">{countdown.seconds}</div><div className="text-xs text-[#7b6a54]">{t(language, "seconds")}</div></div>
      </div>
    </div>
  );
}


