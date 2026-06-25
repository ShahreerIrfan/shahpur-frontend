export default function ContactInfo() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ঠিকানা ও যোগাযোগ তথ্য</h2>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">ঠিকানা</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            শাহপুর শাহপুর দরবার শরীফ-৩৫০০,<br />
                            ওয়ার্ড - ৫, পাঁচথুবি,<br />
                            কুমিল্লা আদর্শ সদর, কুমিল্লা
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">ইমেইল</h3>
                        <p className="text-gray-600 text-sm mt-1">info@shahpurdarbarsharif.org</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">ওয়েবসাইট</h3>
                        <p className="text-gray-600 text-sm mt-1">www.shahpurdarbarsharif.org</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
