import Link from "next/link";

interface BiographyCardProps {
    name: string;
    title: string;
    dates: string;
    description: string;
    href: string;
}

export default function BiographyCard({ name, title, dates, description, href }: BiographyCardProps) {
    return (
        <article className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-8 border border-primary-100 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-primary-800 mb-1">{name}</h3>
            <p className="text-sm text-primary-600 mb-2">{title}</p>
            <p className="text-sm text-gray-500 mb-3">{dates}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
            <Link
                href={href}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
                বিস্তারিত পড়ুন
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
        </article>
    );
}
