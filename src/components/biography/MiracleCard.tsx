interface MiracleCardProps {
    title: string;
    description: string;
}

export default function MiracleCard({ title, description }: MiracleCardProps) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
