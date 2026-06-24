"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "...";

function buildPages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }

  const sorted = Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const result: PageItem[] = [];
  sorted.forEach((item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) {
      result.push("...");
    }
    result.push(item);
  });
  return result;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = buildPages(page, totalPages);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-semibold text-primary-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:text-primary-800"
      >
        Previous
      </button>

      {pages.map((item, index) => (
        item === "..." ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm font-semibold text-gray-400">...</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={page === item ? "page" : undefined}
            className={`min-w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
              page === item
                ? "bg-primary-600 text-white shadow-sm"
                : "text-primary-700 hover:bg-primary-50"
            }`}
          >
            {item}
          </button>
        )
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 text-sm font-semibold text-primary-700 disabled:text-gray-300 disabled:cursor-not-allowed hover:text-primary-800"
      >
        Next
      </button>
    </nav>
  );
}
