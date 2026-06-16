interface PageHeroProps {
    title: string;
    subtitle?: string;
    showBismillah?: boolean;
}

export default function PageHero({ title, subtitle, showBismillah = true }: PageHeroProps) {
    return (
        <section className="bg-gradient-to-br from-primary-50/60 via-white to-primary-50/40 border-b border-primary-100/60 py-16 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 islamic-pattern opacity-[0.95] pointer-events-none"></div>
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-primary-950">
                {showBismillah && (
                    <p className="arabic-text text-primary-600 text-lg mb-3">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                )}
                <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-primary-950">{title}</h1>
                {subtitle && <p className="text-primary-800/95 text-base font-semibold">{subtitle}</p>}
            </div>
        </section>
    );
}
