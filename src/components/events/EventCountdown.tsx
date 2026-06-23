"use client";

import { useEffect, useMemo, useState } from "react";
import { FaHourglassHalf } from "react-icons/fa";

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
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
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

  if (status && status !== "upcoming") return null;
  if (!remaining) return null;

  if (compact) {
    return (
      <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-xs font-bold text-primary-800">
        <div className="flex items-center gap-2">
          <FaHourglassHalf className="w-3 h-3 text-primary-600" />
          <span>
            {toBanglaNumber(remaining.days)} দিন {toBanglaNumber(remaining.hours)} ঘন্টা {toBanglaNumber(remaining.minutes)} মিনিট {toBanglaNumber(remaining.seconds)} সেকেন্ড বাকি
          </span>
        </div>
      </div>
    );
  }

  const blocks = [
    { label: "দিন", value: remaining.days },
    { label: "ঘন্টা", value: remaining.hours },
    { label: "মিনিট", value: remaining.minutes },
    { label: "সেকেন্ড", value: remaining.seconds },
  ];

  return (
    <div className="mt-7 rounded-3xl border border-primary-100 bg-white/90 shadow-sm p-4 md:p-5 max-w-2xl">
      <div className="flex items-center gap-2 text-primary-800 font-extrabold mb-4">
        <span className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
          <FaHourglassHalf className="w-4 h-4" />
        </span>
        ইভেন্ট শুরু হতে বাকি
      </div>
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {blocks.map((item) => (
          <div key={item.label} className="rounded-2xl bg-primary-50 border border-primary-100 px-2 py-3 text-center">
            <div className="text-xl md:text-3xl font-extrabold text-primary-800 leading-none">{toBanglaNumber(item.value)}</div>
            <div className="text-[10px] md:text-xs text-primary-700 font-bold mt-1">{item.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3">
        {toBanglaNumber(remaining.days)} দিন {toBanglaNumber(remaining.hours)} ঘন্টা {toBanglaNumber(remaining.minutes)} মিনিট {toBanglaNumber(remaining.seconds)} সেকেন্ড বাকি আছে
      </p>
    </div>
  );
}
