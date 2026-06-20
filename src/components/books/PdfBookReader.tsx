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
}

function PdfCanvasPage({ doc, pageNumber, scale, filterClass }: PdfCanvasPageProps) {
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
    <div className="relative bg-white rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden">
      {rendering && (
        <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center text-xs font-semibold text-gray-400">
          পৃষ্ঠা লোড হচ্ছে...
        </div>
      )}
      <canvas ref={canvasRef} className={`block max-w-full ${filterClass}`} />
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
    light: "bg-slate-100 text-slate-900",
    sepia: "bg-[#eadfc8] text-stone-900",
    dark: "bg-slate-950 text-slate-100",
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
    if (!doc) return;
    const step = isDoublePage ? 2 : 1;
    const nextPage = direction === "next" ? Math.min(page + step, doc.numPages) : Math.max(page - step, 1);
    if (nextPage === page) return;
    setTurnDirection(direction);
    setTurning(true);
    setPage(nextPage);
    playTurnSound();
    window.setTimeout(() => setTurning(false), 360);
  }, [doc, isDoublePage, page, playTurnSound]);

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
    <div id="book-reader" className={`rounded-3xl border border-gray-100 shadow-sm overflow-hidden ${readerClasses}`}>
      <div className="bg-white/95 text-gray-800 border-b border-gray-100 px-4 py-3 flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <FaBookOpen className="w-4 h-4 text-primary-600" /> বই রিডার
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">পৃষ্ঠা উল্টাতে ← → কী, বাটন, ডাবল ক্লিক জুম, মোবাইলে পিঞ্চ জুম ব্যবহার করুন</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setMode("light")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${mode === "light" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"}`}>
            <FaSun className="inline w-3 h-3 mr-1" /> Light
          </button>
          <button type="button" onClick={() => setMode("sepia")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${mode === "sepia" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"}`}>
            Sepia
          </button>
          <button type="button" onClick={() => setMode("dark")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${mode === "dark" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"}`}>
            <FaMoon className="inline w-3 h-3 mr-1" /> Dark
          </button>
          <button type="button" onClick={() => setMode("auto")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${mode === "auto" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"}`}>
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
          <button type="button" onClick={() => setFitMode("width")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${fitMode === "width" ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-white text-gray-600 border-gray-200"}`}>
            <FaExpand className="inline w-3 h-3 mr-1" /> Fit width
          </button>
          <button type="button" onClick={() => setFitMode("page")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${fitMode === "page" ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-white text-gray-600 border-gray-200"}`}>
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

      <div ref={containerRef} className="relative min-h-[620px] p-4 md:p-8">
        {loading ? (
          <div className="min-h-[540px] flex items-center justify-center text-sm font-semibold opacity-70">PDF লোড হচ্ছে...</div>
        ) : error || !doc ? (
          <div className="min-h-[540px] flex items-center justify-center text-sm font-semibold text-red-500">{error || "PDF পাওয়া যায়নি।"}</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-5">
              <button type="button" onClick={() => turnPage("prev")} disabled={page <= 1} className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 disabled:opacity-40 border border-black/5 rounded-xl text-sm font-bold shadow-sm">
                <FaAngleLeft /> আগের পৃষ্ঠা
              </button>
              <div className="text-center">
                <p className="text-sm font-extrabold">পৃষ্ঠা {pages.join(" - ")} / {totalPages}</p>
                <p className="text-xs opacity-60">{isDoublePage ? "ডাবল পেজ ভিউ" : "সিঙ্গেল পেজ ভিউ"}</p>
              </div>
              <button type="button" onClick={() => turnPage("next")} disabled={page >= totalPages} className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 disabled:opacity-40 border border-black/5 rounded-xl text-sm font-bold shadow-sm">
                পরের পৃষ্ঠা <FaAngleRight />
              </button>
            </div>

            <div
              onDoubleClick={handleDoubleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              className={`book-turn-stage ${turning ? (turnDirection === "next" ? "book-turn-next" : "book-turn-prev") : ""} flex justify-center items-start gap-7 overflow-auto pb-4`}
            >
              {pages.map((pageNumber) => (
                <PdfCanvasPage key={`${pageNumber}-${scale}-${resolvedMode}`} doc={doc} pageNumber={pageNumber} scale={scale} filterClass={canvasFilter} />
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .book-turn-stage {
          perspective: 1800px;
        }

        .book-turn-next {
          animation: bookFlipNext 360ms ease;
          transform-origin: left center;
        }

        .book-turn-prev {
          animation: bookFlipPrev 360ms ease;
          transform-origin: right center;
        }

        @keyframes bookFlipNext {
          0% { transform: translateX(18px) rotateY(-10deg); opacity: 0.72; }
          55% { transform: translateX(0) rotateY(4deg); opacity: 0.94; }
          100% { transform: translateX(0) rotateY(0); opacity: 1; }
        }

        @keyframes bookFlipPrev {
          0% { transform: translateX(-18px) rotateY(10deg); opacity: 0.72; }
          55% { transform: translateX(0) rotateY(-4deg); opacity: 0.94; }
          100% { transform: translateX(0) rotateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
