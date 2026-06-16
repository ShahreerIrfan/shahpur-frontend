interface SectionTitleProps {
    title: string;
    subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
    return (
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto"></div>
            {subtitle && <p className="text-gray-600 mt-4 max-w-3xl mx-auto">{subtitle}</p>}
        </div>
    );
}
