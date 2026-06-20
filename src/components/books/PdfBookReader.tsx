"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaBookOpen,
  FaCompress,
  FaDownload,
  FaExpand,
  FaMoon,
  FaSearchMinus,
  FaSearchPlus,
  FaSun,
  FaVolumeMute,
  FaVolumeUp,
  FaLayerGroup,
} from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type ReaderMode = "light" | "sepia" | "dark" | "auto";
type FitMode = "width" | "page";

interface PdfBookReaderProps {
  pdfUrl: string;
  title: string;
  onDownload?: () => Promise<void>;
}

interface PdfCanvasPageProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  filterClass: string;
  isLeftPage?: boolean;
}

function PdfCanvasPage({ doc, pageNumber, scale, filterClass, isLeftPage = false }: PdfCanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null;

    const render = async () => {
      setRendering(true);
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      renderTask = page.render({ canvas, canvasContext: context, viewport });
      await renderTask.promise.catch(() => null);
      if (!cancelled) setRendering(false);
    };

    void render();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [doc, pageNumber, scale]);

  return (
    <div className={`book-paper relative bg-white rounded-sm shadow-2xl ring-1 ring-black/10 overflow-hidden ${isLeftPage ? "book-paper-left" : "book-paper-right"}`}>
      {rendering && (
        <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center text-xs font-semibold text-gray-400">
          পৃষ্ঠা লোড হচ্ছে...
        </div>
      )}
      <canvas ref={canvasRef} className={`block max-w-full ${filterClass}`} />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-400 bg-white/75 px-2 py-0.5 rounded-full">
        {pageNumber}
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function touchDistance(touches: React.TouchList) {
  if (touches.length < 2) return 0;
  const first = touches[0];
  const second = touches[1];
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

export default function PdfBookReader({ pdfUrl, title, onDownload }: PdfBookReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinchStartRef = useRef(0);
  const zoomStartRef = useRef(1);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 612, height: 792 });
  const [containerWidth, setContainerWidth] = useState(1000);
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<FitMode>("width");
  const [mode, setMode] = useState<ReaderMode>("light");
  const [soundOn, setSoundOn] = useState(false);
  const [turning, setTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
        const loadedDoc = await loadingTask.promise;
        if (cancelled) return;
        setDoc(loadedDoc);
        const firstPage = await loadedDoc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        setPageSize({ width: viewport.width, height: viewport.height });
      } catch {
        if (!cancelled) setError("PDF রিডার লোড করতে সমস্যা হয়েছে।");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(containerRef.current?.clientWidth || window.innerWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const resolvedMode = useMemo(() => {
    if (mode !== "auto") return mode;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [mode]);

  const isDoublePage = containerWidth >= 900;
  const totalPages = doc?.numPages || 0;
  const pages = useMemo(() => {
    if (!doc) return [];
    if (isDoublePage && page < doc.numPages) return [page, page + 1];
    return [page];
  }, [doc, isDoublePage, page]);

  const scale = useMemo(() => {
    const gap = isDoublePage ? 28 : 0;
    const pageSlots = isDoublePage ? 2 : 1;
    const availableWidth = Math.max(containerWidth - gap - 48, 260);
    const widthScale = availableWidth / pageSlots / pageSize.width;
    const heightScale = Math.max((typeof window === "undefined" ? 720 : window.innerHeight - 250) / pageSize.height, 0.35);
    const base = fitMode === "page" ? Math.min(widthScale, heightScale) : widthScale;
    return clamp(base * zoom, 0.35, 3);
  }, [containerWidth, fitMode, isDoublePage, pageSize.height, pageSize.width, zoom]);

  const readerClasses = {
    light: "bg-[#eef2f7] text-slate-900",
    sepia: "bg-[#e7dac1] text-stone-900",
    dark: "bg-[#0d1420] text-slate-100",
  }[resolvedMode];

  const readerSurface = {
    light: "from-slate-100 via-white to-slate-200",
    sepia: "from-[#d5c4a2] via-[#f4ecd9] to-[#cbb48b]",
    dark: "from-slate-950 via-slate-900 to-slate-950",
  }[resolvedMode];

  const canvasFilter = {
    light: "",
    sepia: "sepia-[0.18] saturate-[0.92]",
    dark: "invert hue-rotate-180 brightness-95 contrast-90",
  }[resolvedMode];

  const playTurnSound = useCallback(() => {
    if (!soundOn) return;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(220, context.currentTime);
    gain.gain.setValueAtTime(0.03, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  }, [soundOn]);

  const turnPage = useCallback((direction: "next" | "prev") => {
    if (!doc || turning) return;
    const step = isDoublePage ? 2 : 1;
    const nextPage = direction === "next" ? Math.min(page + step, doc.numPages) : Math.max(page - step, 1);
    if (nextPage === page) return;
    setTurnDirection(direction);
    setTurning(true);
    playTurnSound();
    window.setTimeout(() => setPage(nextPage), 280);
    window.setTimeout(() => setTurning(false), 720);
  }, [doc, isDoublePage, page, playTurnSound, turning]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") turnPage("next");
      if (event.key === "ArrowLeft") turnPage("prev");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [turnPage]);

  const handleDownload = async () => {
    await onDownload?.();
    const anchor = document.createElement("a");
    anchor.href = pdfUrl;
    anchor.download = `${title}.pdf`;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.click();
  };

  const handleDoubleClick = () => {
    setZoom((current) => current > 1.2 ? 1 : 1.6);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      pinchStartRef.current = touchDistance(event.touches);
      zoomStartRef.current = zoom;
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchStartRef.current) return;
    event.preventDefault();
    const nextDistance = touchDistance(event.touches);
    const ratio = nextDistance / pinchStartRef.current;
    setZoom(clamp(zoomStartRef.current * ratio, 0.6, 2.4));
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div id="book-reader" className={`rounded-[28px] border border-black/5 shadow-xl overflow-hidden ${readerClasses}`}>
      <div className="bg-white/95 text-gray-800 border-b border-gray-100 px-4 md:px-5 py-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FaBookOpen className="w-4 h-4" />
            </span>
            বই রিডার
          </h2>
          <p className="text-xs text-gray-400 mt-1">পৃষ্ঠা উল্টাতে বাম/ডান প্রান্ত, ← → কী, ডাবল ক্লিক জুম, মোবাইলে পিঞ্চ জুম ব্যবহার করুন</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setMode("light")} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${mode === "light" ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"}`}>
            <FaSun className="inline w-3 h-3 mr-1" /> Light
          </button>
          <button type="button" onClick={() => setMode("sepia")} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${mode === "sepia" ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"}`}>
            Sepia
          </button>
          <button type="button" onClick={() => setMode("dark")} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${mode === "dark" ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"}`}>
            <FaMoon className="inline w-3 h-3 mr-1" /> Dark
          </button>
          <button type="button" onClick={() => setMode("auto")} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${mode === "auto" ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"}`}>
            Auto
          </button>
          <span className="w-px h-7 bg-gray-200 mx-1"></span>
          <button type="button" onClick={() => setZoom((current) => clamp(current - 0.15, 0.6, 2.4))} className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            <FaSearchMinus className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-gray-500 w-12 text-center">{zoomPercent}%</span>
          <button type="button" onClick={() => setZoom((current) => clamp(current + 0.15, 0.6, 2.4))} className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            <FaSearchPlus className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setFitMode("width")} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${fitMode === "width" ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"}`}>
            <FaExpand className="inline w-3 h-3 mr-1" /> Fit width
          </button>
          <button type="button" onClick={() => setFitMode("page")} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${fitMode === "page" ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"}`}>
            <FaCompress className="inline w-3 h-3 mr-1" /> Fit page
          </button>
          <button type="button" onClick={() => setSoundOn((current) => !current)} className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            {soundOn ? <FaVolumeUp className="w-3.5 h-3.5" /> : <FaVolumeMute className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={() => void handleDownload()} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold">
            <FaDownload className="w-3.5 h-3.5" /> ডাউনলোড
          </button>
        </div>
      </div>

      <div ref={containerRef} className={`relative min-h-[680px] p-4 md:p-8 bg-gradient-to-br ${readerSurface}`}>
        {loading ? (
          <div className="min-h-[540px] flex items-center justify-center text-sm font-semibold opacity-70">PDF লোড হচ্ছে...</div>
        ) : error || !doc ? (
          <div className="min-h-[540px] flex items-center justify-center text-sm font-semibold text-red-500">{error || "PDF পাওয়া যায়নি।"}</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-5">
              <button type="button" onClick={() => turnPage("prev")} disabled={turning || page <= 1} className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 disabled:opacity-40 border border-black/5 rounded-xl text-sm font-bold shadow-sm hover:-translate-x-0.5 transition-transform">
                <FaAngleLeft /> আগের পৃষ্ঠা
              </button>
              <div className="text-center bg-white/75 backdrop-blur border border-white/70 rounded-2xl px-5 py-3 shadow-sm">
                <p className="text-sm font-extrabold">পৃষ্ঠা {pages.join(" - ")} / {totalPages}</p>
                <p className="text-xs opacity-60 flex items-center justify-center gap-1 mt-0.5">
                  <FaLayerGroup className="w-3 h-3" /> {isDoublePage ? "ডাবল পেজ ভিউ" : "সিঙ্গেল পেজ ভিউ"}
                </p>
              </div>
              <button type="button" onClick={() => turnPage("next")} disabled={turning || page >= totalPages} className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 disabled:opacity-40 border border-black/5 rounded-xl text-sm font-bold shadow-sm hover:translate-x-0.5 transition-transform">
                পরের পৃষ্ঠা <FaAngleRight />
              </button>
            </div>

            <div
              onDoubleClick={handleDoubleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className="book-turn-stage relative flex justify-center items-start gap-0 overflow-auto pb-8 px-2 md:px-8"
            >
              <button
                type="button"
                aria-label="আগের পৃষ্ঠা"
                onClick={() => turnPage("prev")}
                disabled={turning || page <= 1}
                className="book-edge book-edge-left"
              />
              <button
                type="button"
                aria-label="পরের পৃষ্ঠা"
                onClick={() => turnPage("next")}
                disabled={turning || page >= totalPages}
                className="book-edge book-edge-right"
              />
              {turning && <div className={`book-flip-sheet ${turnDirection === "next" ? "book-flip-next" : "book-flip-prev"}`} />}
              {isDoublePage && <div className="book-spine" />}
              {pages.map((pageNumber) => (
                <PdfCanvasPage
                  key={`${pageNumber}-${scale}-${resolvedMode}`}
                  doc={doc}
                  pageNumber={pageNumber}
                  scale={scale}
                  filterClass={canvasFilter}
                  isLeftPage={isDoublePage && pageNumber === pages[0]}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .book-turn-stage {
          perspective: 2200px;
          min-height: 520px;
          touch-action: pan-x pan-y pinch-zoom;
        }

        .book-paper {
          transform-style: preserve-3d;
          transition: transform 220ms ease, box-shadow 220ms ease;
        }

        .book-paper::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.10), transparent 8%, transparent 92%, rgba(0,0,0,0.08)),
            radial-gradient(circle at 0 50%, rgba(0,0,0,0.08), transparent 38%);
          mix-blend-mode: multiply;
          opacity: 0.35;
          z-index: 4;
        }

        .book-paper::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 18px;
          pointer-events: none;
          z-index: 5;
          opacity: 0.45;
        }

        .book-paper-left {
          border-radius: 10px 2px 2px 10px;
          transform-origin: right center;
          box-shadow: -18px 28px 48px rgba(15, 23, 42, 0.20), inset -18px 0 22px rgba(0, 0, 0, 0.08);
        }

        .book-paper-left::after {
          right: 0;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.18));
        }

        .book-paper-right {
          border-radius: 2px 10px 10px 2px;
          transform-origin: left center;
          box-shadow: 18px 28px 48px rgba(15, 23, 42, 0.20), inset 18px 0 22px rgba(0, 0, 0, 0.06);
        }

        .book-paper-right::after {
          left: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.16), transparent);
        }

        .book-spine {
          position: sticky;
          left: 50%;
          align-self: stretch;
          width: 28px;
          min-height: 520px;
          z-index: 8;
          margin: 0 -14px;
          pointer-events: none;
          background:
            radial-gradient(ellipse at center, rgba(0,0,0,0.30), rgba(0,0,0,0.08) 38%, transparent 68%),
            linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          filter: blur(0.2px);
        }

        .book-edge {
          position: sticky;
          top: 44%;
          width: 44px;
          height: 120px;
          border: 0;
          border-radius: 999px;
          opacity: 0;
          z-index: 20;
          transition: opacity 180ms ease, transform 180ms ease;
          background: rgba(255,255,255,0.75);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
        }

        .book-turn-stage:hover .book-edge:not(:disabled) {
          opacity: 1;
        }

        .book-edge:disabled {
          display: none;
        }

        .book-edge-left {
          left: 12px;
          margin-right: -44px;
        }

        .book-edge-right {
          right: 12px;
          margin-left: -44px;
        }

        .book-edge-left:hover {
          transform: translateX(-4px);
        }

        .book-edge-right:hover {
          transform: translateX(4px);
        }

        .book-flip-sheet {
          position: absolute;
          top: 0;
          bottom: 32px;
          width: min(46%, 520px);
          z-index: 18;
          pointer-events: none;
          transform-style: preserve-3d;
          border-radius: 4px 14px 14px 4px;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.72) 48%, rgba(204, 190, 160, 0.50)),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 5px);
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.32), inset 18px 0 26px rgba(255,255,255,0.55), inset -24px 0 34px rgba(0,0,0,0.14);
        }

        .book-flip-sheet::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at 92% 4%, rgba(255,255,255,0.95), transparent 18%),
            linear-gradient(105deg, transparent 0 68%, rgba(255,255,255,0.75) 71%, rgba(0,0,0,0.08) 75%, transparent 82%);
          opacity: 0.9;
        }

        .book-flip-next {
          left: 50%;
          transform-origin: left center;
          animation: pageCurlNext 720ms cubic-bezier(.2,.65,.18,1) forwards;
        }

        .book-flip-prev {
          right: 50%;
          transform-origin: right center;
          border-radius: 14px 4px 4px 14px;
          animation: pageCurlPrev 720ms cubic-bezier(.2,.65,.18,1) forwards;
        }

        @keyframes pageCurlNext {
          0% {
            transform: rotateY(0deg) skewY(0deg);
            opacity: 0.10;
          }
          14% {
            opacity: 1;
          }
          48% {
            transform: rotateY(-92deg) skewY(-2deg) translateX(18px);
            box-shadow: -30px 26px 64px rgba(15,23,42,0.42), inset -42px 0 58px rgba(0,0,0,0.26);
          }
          100% {
            transform: rotateY(-178deg) skewY(0deg) translateX(0);
            opacity: 0;
          }
        }

        @keyframes pageCurlPrev {
          0% {
            transform: rotateY(0deg) skewY(0deg);
            opacity: 0.10;
          }
          14% {
            opacity: 1;
          }
          48% {
            transform: rotateY(92deg) skewY(2deg) translateX(-18px);
            box-shadow: 30px 26px 64px rgba(15,23,42,0.42), inset 42px 0 58px rgba(0,0,0,0.26);
          }
          100% {
            transform: rotateY(178deg) skewY(0deg) translateX(0);
            opacity: 0;
          }
        }

        @media (max-width: 899px) {
          .book-paper-left,
          .book-paper-right {
            border-radius: 10px;
            box-shadow: 0 22px 48px rgba(15, 23, 42, 0.22);
          }

          .book-paper-left::after,
          .book-paper-right::after,
          .book-spine {
            display: none;
          }

          .book-flip-sheet {
            width: min(82%, 420px);
            left: 9%;
            right: auto;
          }
        }
      `}</style>
    </div>
  );
}
