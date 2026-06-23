"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaClock, FaHourglassHalf, FaPlayCircle, FaTimesCircle } from "react-icons/fa";

interface EventCountdownProps {
  startDate: string;
  startTime?: string | null;
  status?: string;
  compact?: boolean;
}

interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function toBanglaNumber(value: number) {
  return new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 0 }).format(value);
}

function buildEventDate(startDate: string, startTime?: string | null) {
  const time = startTime ? startTime.slice(0, 8) : "00:00:00";
  return new Date(`${startDate}T${time}`);
}

function getRemaining(target: Date): RemainingTime | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function statusInfo(status?: string, hasRemaining?: boolean) {
  if (status === "ongoing") {
    return {
      tone: "from-emerald-600 to-teal-500",
      softTone: "bg-emerald-50 border-emerald-100 text-emerald-800",
      icon: FaPlayCircle,
      title: "অনুষ্ঠান চলছে",
      message: "আলহামদুলিল্লাহ, এই ইভেন্ট এখন চলমান",
    };
  }

  if (status === "completed") {
    return {
      tone: "from-slate-700 to-slate-500",
      softTone: "bg-slate-50 border-slate-200 text-slate-700",
      icon: FaCheckCircle,
      title: "অনুষ্ঠান সম্পন্ন",
      message: "আলহামদুলিল্লাহ, এই ইভেন্ট সম্পন্ন হয়েছে",
    };
  }

  if (status === "cancelled") {
    return {
      tone: "from-rose-600 to-red-500",
      softTone: "bg-rose-50 border-rose-100 text-rose-700",
      icon: FaTimesCircle,
      title: "অনুষ্ঠান বাতিল",
      message: "এই ইভেন্টটি বাতিল করা হয়েছে",
    };
  }

  if (!hasRemaining) {
    return {
      tone: "from-amber-600 to-orange-500",
      softTone: "bg-amber-50 border-amber-100 text-amber-800",
      icon: FaClock,
      title: "সময় হয়ে গেছে",
      message: "এই ইভেন্টের নির্ধারিত সময় শুরু হয়ে গেছে",
    };
  }

  return {
    tone: "from-primary-700 via-emerald-600 to-teal-500",
    softTone: "bg-primary-50 border-primary-100 text-primary-800",
    icon: FaHourglassHalf,
    title: "ইভেন্ট শুরু হতে বাকি",
    message: "",
  };
}

export default function EventCountdown({ startDate, startTime, status, compact = false }: EventCountdownProps) {
  const targetDate = useMemo(() => buildEventDate(startDate, startTime), [startDate, startTime]);
  const [remaining, setRemaining] = useState<RemainingTime | null>(() => getRemaining(targetDate));

  useEffect(() => {
    setRemaining(getRemaining(targetDate));
    const timer = window.setInterval(() => {
      setRemaining(getRemaining(targetDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const info = statusInfo(status, Boolean(remaining));
  const Icon = info.icon;

  if (compact) {
    if (!remaining) {
      return (
        <div className={`mt-4 rounded-2xl border px-3 py-3 text-xs font-bold shadow-sm ${info.softTone}`}>
          <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold leading-none">{info.title}</p>
              <p className="mt-1 font-medium leading-relaxed opacity-85">{info.message}</p>
            </div>
          </div>
        </div>
      );
    }

    const compactBlocks = [
      ["দিন", remaining.days],
      ["ঘন্টা", remaining.hours],
      ["মিনিট", remaining.minutes],
      ["সেকেন্ড", remaining.seconds],
    ] as const;

    return (
      <div className={`mt-4 overflow-hidden rounded-2xl bg-gradient-to-br ${info.tone} p-[1px] shadow-md shadow-primary-900/10`}>
        <div className="rounded-2xl bg-white/95 p-3">
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-primary-800">
            <span className={`w-7 h-7 rounded-xl bg-gradient-to-br ${info.tone} text-white flex items-center justify-center shadow-sm`}>
              <Icon className="w-3 h-3" />
            </span>
            <span>{info.title}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {compactBlocks.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-primary-50 border border-primary-100 px-1 py-2 text-center">
                <div className="text-sm font-black text-primary-800 leading-none">{toBanglaNumber(value)}</div>
                <div className="text-[9px] text-primary-600 font-bold mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const blocks = [
    { label: "দিন", value: remaining?.days ?? 0 },
    { label: "ঘন্টা", value: remaining?.hours ?? 0 },
    { label: "মিনিট", value: remaining?.minutes ?? 0 },
    { label: "সেকেন্ড", value: remaining?.seconds ?? 0 },
  ];

  return (
    <div className={`mt-7 overflow-hidden rounded-3xl bg-gradient-to-br ${info.tone} p-[1px] max-w-2xl shadow-2xl shadow-primary-950/15`}>
      <div className="rounded-3xl bg-white/95 p-4 md:p-5">
        <div className="flex items-center gap-3 text-primary-900 font-extrabold mb-4">
          <span className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${info.tone} text-white flex items-center justify-center shadow-md`}>
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <p>{info.title}</p>
            {!remaining && <p className="text-xs text-gray-500 font-medium mt-1">{info.message}</p>}
          </div>
        </div>

        {remaining ? (
          <>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {blocks.map((item) => (
                <div key={item.label} className="rounded-2xl bg-gradient-to-b from-primary-50 to-white border border-primary-100 px-2 py-3 text-center shadow-sm">
                  <div className="text-2xl md:text-4xl font-black text-primary-800 leading-none">{toBanglaNumber(item.value)}</div>
                  <div className="text-[10px] md:text-xs text-primary-700 font-bold mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {toBanglaNumber(remaining.days)} দিন {toBanglaNumber(remaining.hours)} ঘন্টা {toBanglaNumber(remaining.minutes)} মিনিট {toBanglaNumber(remaining.seconds)} সেকেন্ড বাকি আছে
            </p>
          </>
        ) : (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${info.softTone}`}>
            {info.message}
          </div>
        )}
      </div>
    </div>
  );
}
