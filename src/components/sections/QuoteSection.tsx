export default function QuoteSection() {
    return (
        <section className="py-14 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
            <div className="absolute inset-0 islamic-pattern opacity-10"></div>
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative max-w-4xl mx-auto px-4 text-center">
                <p className="arabic-text text-gold-light text-3xl md:text-4xl leading-relaxed mb-5">
                    فَادْخُلِي فِي عِبَادِي وَادْخُلِي جَنَّتِي
                </p>
                <p className="text-white/90 text-lg md:text-xl mb-2">
                    &quot;অতঃপর আমার বান্দাদের মধ্যে প্রবেশ কর এবং আমার জান্নাতে প্রবেশ কর।&quot;
                </p>
                <p className="text-primary-200 text-sm">— সূরা আল-ফাজর (৮৯:২৯-৩০)</p>
            </div>
        </section>
    );
}
