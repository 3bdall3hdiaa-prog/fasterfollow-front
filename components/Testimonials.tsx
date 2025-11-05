import React from 'react';
import { SiteSettings } from '../types';

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
    return (
        <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">{content.title}</h2>
                    <p className="text-gray-400 mt-2">{content.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonialsData.map((testimonial, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                            <p className="text-gray-300 mb-6">"{testimonial.text}"</p>
                            <div className="flex items-center">
                                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full ml-4" />
                                <div>
                                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                                    <p className="text-gray-500 text-sm">{testimonial.username}</p>
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