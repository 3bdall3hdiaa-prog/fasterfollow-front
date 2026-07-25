import React from 'react';
import { SiteSettings } from '../types';
import { useThemeStore } from '@/store/theme.store';

const testimonialsData = [
    {
        name: 'أحمد علي',
        username: '@ahmed_ali',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        text: 'خدمة ممتازة وسريعة جداً. زاد عدد متابعيني بشكل ملحوظ في وقت قصير. أنصح به بشدة!'
    },
    {
        name: 'سارة محمد',
        username: '@sara_mo',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
        text: 'كنت متشككة في البداية، لكن النتائج كانت مذهلة. جودة المتابعين عالية والتفاعل زاد. شكراً لكم.'
    },
    {
        name: 'خالد الجاسم',
        username: '@k_jasim',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
        text: 'أفضل موقع تعاملت معه. أسعارهم معقولة والدعم الفني متعاون جداً. سأستمر في استخدام خدماتهم.'
    }
];

interface TestimonialsProps {
    content: SiteSettings['homepageContent']['testimonials'];
}

const Testimonials: React.FC<TestimonialsProps> = ({ content }) => {
    const { isDark } = useThemeStore();

    return (
        <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-gradient-to-b from-[#faf8f2] to-white'
            }`}>
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl md:text-4xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        {content.title}
                    </h2>
                    <p className={`mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        {content.subtitle}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonialsData.map((testimonial, index) => (
                        <div
                            key={index}
                            className={`rounded-lg p-8 transition-all duration-300 ${isDark
                                    ? 'bg-gray-800 border border-gray-700'
                                    : 'bg-white border border-[#dfd7bb] shadow-md hover:shadow-xl'
                                }`}
                        >
                            <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                "{testimonial.text}"
                            </p>
                            <div className="flex items-center">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full ml-4 ring-2 ring-[#dfd7bb]"
                                />
                                <div>
                                    <h4 className={`font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                        }`}>
                                        {testimonial.name}
                                    </h4>
                                    <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                        {testimonial.username}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;