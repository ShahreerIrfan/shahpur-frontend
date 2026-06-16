interface HighlightCardProps {
    title: string;
    description: string;
}

export default function HighlightCard({ title, description }: HighlightCardProps) {
    return (
        <div className="bg-primary-50 p-4 rounded-lg border-l-4 border-primary-500">
            <h4 className="font-semibold text-primary-800 mb-1">{title}</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
