"use client";

export default function ContactForm() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">বার্তা পাঠান</h2>
            <form className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="আপনার নাম"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="আপনার ইমেইল"
                    />
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">বিষয়</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        placeholder="বিষয়"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">বার্তা</label>
                    <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                        placeholder="আপনার বার্তা লিখুন..."
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                    পাঠান
                </button>
            </form>
        </div>
    );
}
