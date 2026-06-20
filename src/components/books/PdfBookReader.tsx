"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaBookOpen,
  FaBookmark,
  FaClock,
  FaColumns,
  FaCompress,
  FaDownload,
  FaExpand,
  FaHighlighter,
  FaLayerGroup,
  FaListUl,
  FaMicrophone,
  FaMoon,
  FaPause,
  FaPlay,
  FaRegBookmark,
  FaRegStar,
  FaScroll,
  FaSearch,
  FaSearchMinus,
  FaSearchPlus,
  FaStar,
  FaStickyNote,
  FaStop,
  FaSun,
  FaThLarge,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type ReaderMode = "light" | "sepia" | "dark" | "auto";
type FitMode = "width" | "page";
type ViewMode = "book" | "scroll";
type HighlightColor = "yellow" | "green" | "blue";

interface PdfBookReaderProps {
  pdfUrl: string;
  title: string;
  onDownload?: () => Promise<void>;
}

interface ReaderBookmark {
  page: number;
  label: string;
  createdAt: number;
}

interface ReaderHighlight {
  page: number;
  color: HighlightColor;
  text: string;
  createdAt: number;
}

interface SearchResult {
  page: number;
  snippet: string;
  count: number;
}

interface ReaderOutline {
  title: string;
  page?: number;
  children: ReaderOutline[];
}

interface PdfCanvasPageProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  filterClass: string;
  isLeftPage?: boolean;
  lazy?: boolean;
  placeholderHeight?: number;
}

function PdfCanvasPage({ doc, pageNumber, scale, filterClass, isLeftPage = false, lazy = false, placeholderHeight }: PdfCanvasPageProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState(true);
  const [visible, setVisible] = useState(!lazy);

  useEffect(() => {
    if (!lazy) {
      setVisible(true);
      return;
    }
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (!visible) return;
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
  }, [doc, pageNumber, scale, visible]);

  return (
    <div
      ref={wrapperRef}
      className={`book-paper relative bg-white rounded-sm shadow-2xl ring-1 ring-black/10 overflow-hidden ${isLeftPage ? "book-paper-left" : "book-paper-right"}`}
      style={!visible ? { width: `${Math.floor(612 * scale)}px`, height: `${Math.floor(placeholderHeight || 792 * scale)}px` } : undefined}
    >
      {!visible ? (
        <div className="w-full h-full bg-white/70 flex items-center justify-center text-xs font-semibold text-gray-400">পৃষ্ঠা {pageNumber}</div>
      ) : (
        <>
          {rendering && (
            <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center text-xs font-semibold text-gray-400">
              পৃষ্ঠা লোড হচ্ছে...
            </div>
          )}
          <canvas ref={canvasRef} className={`block max-w-full ${filterClass}`} />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-400 bg-white/75 px-2 py-0.5 rounded-full">
            {pageNumber}
          </div>
        </>
      )}
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

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function storageSafeKey(input: string) {
  return input.replace(/[^a-z0-9]/gi, "_").slice(0, 120);
}

function secondsToLabel(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

async function getPageText(doc: PDFDocumentProxy, pageNumber: number) {
  const pdfPage = await doc.getPage(pageNumber);
  const content = await pdfPage.getTextContent();
  return content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
}

export default function PdfBookReader({ pdfUrl, title, onDownload }: PdfBookReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinchStartRef = useRef(0);
  const zoomStartRef = useRef(1);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 612, height: 792 });
  const [containerWidth, setContainerWidth] = useState(1000);
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<FitMode>("width");
  const [mode, setMode] = useState<ReaderMode>("light");
  const [viewMode, setViewMode] = useState<ViewMode>("book");
  const [soundOn, setSoundOn] = useState(false);
  const [turning, setTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev">("next");
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
  const [highlights, setHighlights] = useState<ReaderHighlight[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [favorite, setFavorite] = useState(false);
  const [outline, setOutline] = useState<ReaderOutline[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [autoScroll, setAutoScroll] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(2);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const storageKey = useMemo(() => `pdf-reader:${storageSafeKey(pdfUrl)}`, [pdfUrl]);

  useEffect(() => {
    setBookmarks(safeParse<ReaderBookmark[]>(localStorage.getItem(`${storageKey}:bookmarks`), []));
    setHighlights(safeParse<ReaderHighlight[]>(localStorage.getItem(`${storageKey}:highlights`), []));
    setNotes(safeParse<Record<string, string>>(localStorage.getItem(`${storageKey}:notes`), {}));
    setFavorite(localStorage.getItem(`${storageKey}:favorite`) === "true");
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:bookmarks`, JSON.stringify(bookmarks));
  }, [bookmarks, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:highlights`, JSON.stringify(highlights));
  }, [highlights, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:notes`, JSON.stringify(notes));
  }, [notes, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:favorite`, favorite ? "true" : "false");
  }, [favorite, storageKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setSessionSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!autoScroll) return;
    const timer = window.setInterval(() => {
      containerRef.current?.scrollBy({ top: autoScrollSpeed * 12, behavior: "smooth" });
    }, 450);
    return () => window.clearInterval(timer);
  }, [autoScroll, autoScrollSpeed]);

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
        const storedPage = Number(localStorage.getItem(`${storageKey}:page`) || "1");
        setPage(clamp(storedPage, 1, loadedDoc.numPages));

        const rawOutline = await loadedDoc.getOutline().catch(() => null);
        if (!cancelled && rawOutline) {
          setOutline(await resolveOutline(loadedDoc, rawOutline));
        }
      } catch {
        if (!cancelled) setError("PDF রিডার লোড করতে সমস্যা হয়েছে।");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
    };
  }, [pdfUrl, storageKey]);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(containerRef.current?.clientWidth || window.innerWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!doc) return;
    localStorage.setItem(`${storageKey}:page`, `${page}`);
    localStorage.setItem(`${storageKey}:progress`, JSON.stringify({ title, page, totalPages: doc.numPages, updatedAt: Date.now() }));
    const recent = safeParse<Array<{ title: string; pdfUrl: string; page: number; updatedAt: number }>>(localStorage.getItem("pdf-reader:recent"), []);
    const nextRecent = [{ title, pdfUrl, page, updatedAt: Date.now() }, ...recent.filter((item) => item.pdfUrl !== pdfUrl)].slice(0, 12);
    localStorage.setItem("pdf-reader:recent", JSON.stringify(nextRecent));
  }, [doc, page, pdfUrl, storageKey, title]);

  const resolvedMode = useMemo(() => {
    if (mode !== "auto") return mode;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [mode]);

  const isDoublePage = containerWidth >= 900 && viewMode === "book";
  const totalPages = doc?.numPages || 0;
  const visibleBookPages = useMemo(() => {
    if (!doc) return [];
    if (isDoublePage && page < doc.numPages) return [page, page + 1];
    return [page];
  }, [doc, isDoublePage, page]);

  const allPages = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

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

  const progress = totalPages ? Math.round((page / totalPages) * 100) : 0;
  const remainingMinutes = totalPages ? Math.max(1, Math.ceil((totalPages - page) * 0.75)) : 0;
  const currentNote = notes[String(page)] || "";
  const currentPageBookmarked = bookmarks.some((item) => item.page === page);

  const goToPage = useCallback((pageNumber: number) => {
    const nextPage = clamp(Math.round(pageNumber), 1, totalPages || 1);
    setPage(nextPage);
    if (viewMode === "scroll") {
      window.setTimeout(() => {
        document.querySelector(`[data-scroll-page="${nextPage}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [totalPages, viewMode]);

  const playTurnSound = useCallback(() => {
    if (!soundOn) return;
    const context = new AudioContext();
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
    window.setTimeout(() => goToPage(nextPage), 280);
    window.setTimeout(() => setTurning(false), 720);
  }, [doc, goToPage, isDoublePage, page, playTurnSound, turning]);

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

  const toggleBookmark = () => {
    setBookmarks((current) => {
      if (current.some((item) => item.page === page)) return current.filter((item) => item.page !== page);
      return [{ page, label: `পৃষ্ঠা ${page}`, createdAt: Date.now() }, ...current].sort((a, b) => a.page - b.page);
    });
  };

  const addHighlight = (color: HighlightColor) => {
    setHighlights((current) => [
      { page, color, text: `পৃষ্ঠা ${page} মার্ক করা হয়েছে`, createdAt: Date.now() },
      ...current,
    ]);
  };

  const runSearch = async () => {
    if (!doc || !searchQuery.trim()) return;
    setSearching(true);
    const query = searchQuery.trim().toLowerCase();
    const results: SearchResult[] = [];
    for (let index = 1; index <= doc.numPages; index += 1) {
      const pageText = (await getPageText(doc, index)).replace(/\s+/g, " ");
      const lower = pageText.toLowerCase();
      if (!lower.includes(query)) continue;
      const count = lower.split(query).length - 1;
      const start = Math.max(lower.indexOf(query) - 55, 0);
      results.push({ page: index, count, snippet: pageText.slice(start, start + 150) });
    }
    setSearchResults(results);
    setSearching(false);
    if (results[0]) goToPage(results[0].page);
  };

  const toggleReadAloud = async () => {
    if (!doc || typeof window === "undefined") return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = await getPageText(doc, page);
    if (!text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD";
    utterance.rate = speechRate;
    utterance.onend = () => setSpeaking(false);
    speechRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleScroll = () => {
    if (viewMode !== "scroll") return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-page]"));
    const top = 160;
    let nearestPage = page;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const element of elements) {
      const distance = Math.abs(element.getBoundingClientRect().top - top);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPage = Number(element.dataset.scrollPage || page);
      }
    }
    if (nearestPage !== page) setPage(nearestPage);
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
          <p className="text-xs text-gray-400 mt-1">শেষ পড়া পৃষ্ঠা, বুকমার্ক, সার্চ, নোট, TTS, অটো স্ক্রল এবং বইয়ের মতো পৃষ্ঠা উল্টানো একসাথে।</p>
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
          <button type="button" onClick={() => setViewMode("book")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${viewMode === "book" ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-white text-gray-600 border-gray-200"}`}>
            <FaColumns className="inline w-3 h-3 mr-1" /> Book
          </button>
          <button type="button" onClick={() => setViewMode("scroll")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${viewMode === "scroll" ? "bg-primary-50 text-primary-700 border-primary-100" : "bg-white text-gray-600 border-gray-200"}`}>
            <FaScroll className="inline w-3 h-3 mr-1" /> Scroll
          </button>
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
          <button type="button" onClick={toggleBookmark} className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            {currentPageBookmarked ? <FaBookmark className="w-3.5 h-3.5 text-primary-600" /> : <FaRegBookmark className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={() => setFavorite((current) => !current)} className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            {favorite ? <FaStar className="w-3.5 h-3.5 text-amber-500" /> : <FaRegStar className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={() => setSoundOn((current) => !current)} className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            {soundOn ? <FaVolumeUp className="w-3.5 h-3.5" /> : <FaVolumeMute className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={() => setToolsOpen((current) => !current)} className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold">
            <FaListUl className="w-3.5 h-3.5" /> Tools
          </button>
          <button type="button" onClick={() => void handleDownload()} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold">
            <FaDownload className="w-3.5 h-3.5" /> ডাউনলোড
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div ref={containerRef} onScroll={handleScroll} className={`relative max-h-[calc(100vh-96px)] overflow-auto min-h-[680px] p-4 md:p-8 bg-gradient-to-br ${readerSurface}`}>
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
                <div className="text-center bg-white/75 backdrop-blur border border-white/70 rounded-2xl px-5 py-3 shadow-sm min-w-52">
                  <p className="text-sm font-extrabold">পৃষ্ঠা {viewMode === "book" ? visibleBookPages.join(" - ") : page} / {totalPages}</p>
                  <div className="h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs opacity-60 flex items-center justify-center gap-1 mt-1">
                    <FaLayerGroup className="w-3 h-3" /> {progress}% শেষ, আনুমানিক {remainingMinutes} মিনিট বাকি
                  </p>
                </div>
                <button type="button" onClick={() => turnPage("next")} disabled={turning || page >= totalPages} className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 disabled:opacity-40 border border-black/5 rounded-xl text-sm font-bold shadow-sm hover:translate-x-0.5 transition-transform">
                  পরের পৃষ্ঠা <FaAngleRight />
                </button>
              </div>

              {viewMode === "book" ? (
                <div
                  onDoubleClick={handleDoubleClick}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  className="book-turn-stage relative flex justify-center items-start gap-0 overflow-auto pb-8 px-2 md:px-8"
                >
                  <button type="button" aria-label="আগের পৃষ্ঠা" onClick={() => turnPage("prev")} disabled={turning || page <= 1} className="book-edge book-edge-left" />
                  <button type="button" aria-label="পরের পৃষ্ঠা" onClick={() => turnPage("next")} disabled={turning || page >= totalPages} className="book-edge book-edge-right" />
                  {turning && <div className={`book-flip-sheet ${turnDirection === "next" ? "book-flip-next" : "book-flip-prev"}`} />}
                  {isDoublePage && <div className="book-spine" />}
                  {visibleBookPages.map((pageNumber) => (
                    <PdfCanvasPage key={`${pageNumber}-${scale}-${resolvedMode}`} doc={doc} pageNumber={pageNumber} scale={scale} filterClass={canvasFilter} isLeftPage={isDoublePage && pageNumber === visibleBookPages[0]} />
                  ))}
                </div>
              ) : (
                <div onDoubleClick={handleDoubleClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} className="flex flex-col items-center gap-8 pb-8">
                  {allPages.map((pageNumber) => (
                    <div key={pageNumber} data-scroll-page={pageNumber} className="scroll-mt-8">
                      <PdfCanvasPage doc={doc} pageNumber={pageNumber} scale={scale} filterClass={canvasFilter} lazy placeholderHeight={pageSize.height * scale} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {toolsOpen && (
          <aside className="bg-white text-gray-800 border-t xl:border-t-0 xl:border-l border-gray-100 p-4 md:p-5 space-y-4 max-h-[calc(100vh-96px)] overflow-auto">
            <ReaderPanelCard title="রিডিং প্রগ্রেস" icon={<FaClock />}>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <PanelMetric label="বর্তমান পৃষ্ঠা" value={`${page}/${totalPages || "..."}`} />
                <PanelMetric label="সম্পন্ন" value={`${progress}%`} />
                <PanelMetric label="সেশন" value={secondsToLabel(sessionSeconds)} />
                <PanelMetric label="বাকি সময়" value={`${remainingMinutes}m`} />
              </div>
            </ReaderPanelCard>

            <ReaderPanelCard title="সার্চ" icon={<FaSearch />}>
              <div className="flex gap-2">
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void runSearch()} className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-200" placeholder="শব্দ খুঁজুন" />
                <button type="button" onClick={() => void runSearch()} className="px-3 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold disabled:opacity-50" disabled={searching}>
                  {searching ? "..." : "খুঁজুন"}
                </button>
              </div>
              <div className="mt-3 space-y-2 max-h-44 overflow-auto">
                {searchResults.length === 0 ? <p className="text-xs text-gray-400">সার্চ করলে ফলাফল এখানে দেখাবে।</p> : searchResults.map((result) => (
                  <button key={`${result.page}-${result.snippet}`} type="button" onClick={() => goToPage(result.page)} className="block w-full text-left rounded-xl bg-gray-50 hover:bg-primary-50 px-3 py-2 text-xs">
                    <span className="font-bold text-primary-700">পৃষ্ঠা {result.page} ({result.count})</span>
                    <span className="block text-gray-500 line-clamp-2">{result.snippet}</span>
                  </button>
                ))}
              </div>
            </ReaderPanelCard>

            <ReaderPanelCard title="বুকমার্ক" icon={<FaBookmark />}>
              <button type="button" onClick={toggleBookmark} className="w-full mb-3 bg-primary-50 text-primary-700 border border-primary-100 rounded-xl px-3 py-2 text-xs font-bold">
                {currentPageBookmarked ? "এই পৃষ্ঠা থেকে বুকমার্ক সরান" : "এই পৃষ্ঠা বুকমার্ক করুন"}
              </button>
              <div className="space-y-2 max-h-40 overflow-auto">
                {bookmarks.length === 0 ? <p className="text-xs text-gray-400">এখনো বুকমার্ক নেই।</p> : bookmarks.map((bookmark) => (
                  <button key={`${bookmark.page}-${bookmark.createdAt}`} type="button" onClick={() => goToPage(bookmark.page)} className="block w-full text-left rounded-xl bg-gray-50 hover:bg-primary-50 px-3 py-2 text-xs font-bold">
                    {bookmark.label}
                  </button>
                ))}
              </div>
            </ReaderPanelCard>

            <ReaderPanelCard title="নোট ও হাইলাইট" icon={<FaStickyNote />}>
              <textarea value={currentNote} onChange={(event) => setNotes((current) => ({ ...current, [String(page)]: event.target.value }))} className="w-full min-h-24 rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-200" placeholder="এই পৃষ্ঠার নোট লিখুন..." />
              <div className="flex gap-2 mt-2">
                {(["yellow", "green", "blue"] as HighlightColor[]).map((color) => (
                  <button key={color} type="button" onClick={() => addHighlight(color)} className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold border ${color === "yellow" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : color === "green" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                    <FaHighlighter className="inline mr-1" /> {color}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-2 max-h-32 overflow-auto">
                {highlights.slice(0, 8).map((item) => (
                  <button key={`${item.page}-${item.createdAt}`} type="button" onClick={() => goToPage(item.page)} className="block w-full text-left rounded-xl bg-gray-50 px-3 py-2 text-xs">
                    <span className="font-bold">পৃষ্ঠা {item.page}</span> - {item.text}
                  </button>
                ))}
              </div>
            </ReaderPanelCard>

            <ReaderPanelCard title="অডিও ও অটো স্ক্রল" icon={<FaMicrophone />}>
              <div className="flex gap-2">
                <button type="button" onClick={() => void toggleReadAloud()} className="flex-1 rounded-xl bg-primary-600 text-white px-3 py-2 text-xs font-bold">
                  {speaking ? <><FaStop className="inline mr-1" /> বন্ধ</> : <><FaPlay className="inline mr-1" /> পড়ুন</>}
                </button>
                <button type="button" onClick={() => setAutoScroll((current) => !current)} className="flex-1 rounded-xl bg-gray-100 text-gray-700 px-3 py-2 text-xs font-bold">
                  {autoScroll ? <><FaPause className="inline mr-1" /> স্ক্রল বন্ধ</> : <><FaPlay className="inline mr-1" /> অটো স্ক্রল</>}
                </button>
              </div>
              <label className="block text-xs font-bold text-gray-500 mt-3">TTS গতি: {speechRate.toFixed(1)}x</label>
              <input type="range" min="0.6" max="1.8" step="0.1" value={speechRate} onChange={(event) => setSpeechRate(Number(event.target.value))} className="w-full" />
              <label className="block text-xs font-bold text-gray-500 mt-2">স্ক্রল গতি: {autoScrollSpeed}</label>
              <input type="range" min="1" max="8" step="1" value={autoScrollSpeed} onChange={(event) => setAutoScrollSpeed(Number(event.target.value))} className="w-full" />
            </ReaderPanelCard>

            <ReaderPanelCard title="সূচিপত্র ও পৃষ্ঠা" icon={<FaThLarge />}>
              <div className="grid grid-cols-5 gap-2 mb-3 max-h-36 overflow-auto">
                {allPages.map((pageNumber) => (
                  <button key={pageNumber} type="button" onClick={() => goToPage(pageNumber)} className={`rounded-lg border px-2 py-2 text-[10px] font-bold ${pageNumber === page ? "bg-primary-600 text-white border-primary-600" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                    {pageNumber}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-44 overflow-auto">
                {outline.length === 0 ? <p className="text-xs text-gray-400">এই PDF-এ বুকমার্ক/চ্যাপ্টার পাওয়া যায়নি।</p> : outline.map((item) => (
                  <OutlineButton key={`${item.title}-${item.page}`} item={item} goToPage={goToPage} />
                ))}
              </div>
            </ReaderPanelCard>
          </aside>
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
          0% { transform: rotateY(0deg) skewY(0deg); opacity: 0.10; }
          14% { opacity: 1; }
          48% { transform: rotateY(-92deg) skewY(-2deg) translateX(18px); box-shadow: -30px 26px 64px rgba(15,23,42,0.42), inset -42px 0 58px rgba(0,0,0,0.26); }
          100% { transform: rotateY(-178deg) skewY(0deg) translateX(0); opacity: 0; }
        }

        @keyframes pageCurlPrev {
          0% { transform: rotateY(0deg) skewY(0deg); opacity: 0.10; }
          14% { opacity: 1; }
          48% { transform: rotateY(92deg) skewY(2deg) translateX(-18px); box-shadow: 30px 26px 64px rgba(15,23,42,0.42), inset 42px 0 58px rgba(0,0,0,0.26); }
          100% { transform: rotateY(178deg) skewY(0deg) translateX(0); opacity: 0; }
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

async function resolveOutline(doc: PDFDocumentProxy, items: Array<Record<string, unknown>>): Promise<ReaderOutline[]> {
  const resolved: ReaderOutline[] = [];
  for (const item of items) {
    let pageNumber: number | undefined;
    const destination = item.dest;
    try {
      const destinationArray = typeof destination === "string" ? await doc.getDestination(destination) : destination;
      if (Array.isArray(destinationArray) && destinationArray[0]) {
        pageNumber = (await doc.getPageIndex(destinationArray[0])) + 1;
      }
    } catch {
      pageNumber = undefined;
    }
    const nestedItems = Array.isArray(item.items) ? item.items as Array<Record<string, unknown>> : [];
    resolved.push({
      title: String(item.title || "Untitled"),
      page: pageNumber,
      children: await resolveOutline(doc, nestedItems),
    });
  }
  return resolved;
}

function ReaderPanelCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
      <h3 className="text-sm font-extrabold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-primary-600">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function PanelMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <p className="text-[10px] text-gray-400 font-bold">{label}</p>
      <p className="text-sm font-extrabold text-gray-800">{value}</p>
    </div>
  );
}

function OutlineButton({ item, goToPage }: { item: ReaderOutline; goToPage: (page: number) => void }) {
  return (
    <div>
      <button type="button" disabled={!item.page} onClick={() => item.page && goToPage(item.page)} className="block w-full text-left rounded-xl bg-gray-50 hover:bg-primary-50 disabled:opacity-50 px-3 py-2 text-xs font-bold">
        {item.title}
        {item.page && <span className="ml-2 text-primary-600">পৃষ্ঠা {item.page}</span>}
      </button>
      {item.children.length > 0 && (
        <div className="ml-3 mt-2 space-y-2">
          {item.children.map((child) => <OutlineButton key={`${child.title}-${child.page}`} item={child} goToPage={goToPage} />)}
        </div>
      )}
    </div>
  );
}
