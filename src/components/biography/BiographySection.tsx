import { ReactNode } from "react";

interface BiographySectionProps {
    title: string;
    children: ReactNode;
}

export default function BiographySection({ title, children }: BiographySectionProps) {
    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary-800 mb-4 pb-2 border-b-2 border-primary-200">
                {title}
            </h2>
            {children}
        </section>
    );
}
