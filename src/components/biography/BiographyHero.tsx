interface BiographyHeroProps {
    name: string;
    titles: string;
    dates: string;
}

export default function BiographyHero({ name, titles, dates }: BiographyHeroProps) {
    return (
        <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-dark py-16 islamic-pattern">
            <div className="max-w-4xl mx-auto px-4 text-center text-white">
                <p className="arabic-text text-gold-light text-xl mb-4">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{name}</h1>
                <p className="text-primary-200 text-lg">{titles}</p>
                <p className="text-primary-300 mt-2">{dates}</p>
            </div>
        </section>
    );
}
