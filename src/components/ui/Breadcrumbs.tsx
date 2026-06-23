"use client";

import SpaLink from "@/components/SpaLink";
import { FaHome, FaChevronRight } from "react-icons/fa";

export interface BreadcrumbItem {
    label: string;
    url?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center space-x-2 text-xs md:text-sm text-gray-500 py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-100 max-w-7xl mx-auto my-4 shadow-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
                <li className="inline-flex items-center">
                    <SpaLink href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors font-medium">
                        <FaHome className="w-3.5 h-3.5 text-primary-600" />
                        <span>হোম</span>
                    </SpaLink>
                </li>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="inline-flex items-center">
                            <FaChevronRight className="w-2.5 h-2.5 text-gray-300 mx-1 shrink-0" />
                            {item.url && !isLast ? (
                                <SpaLink href={item.url} className="text-gray-500 hover:text-primary-600 transition-colors font-medium">
                                    {item.label}
                                </SpaLink>
                            ) : (
                                <span className="text-primary-900 font-extrabold truncate max-w-[200px] sm:max-w-[300px] md:max-w-md" aria-current="page">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
