import { useCurrency } from '@/contexts/CurrencyContext'
import { useThemeStore } from '@/store/theme.store'
import React from 'react'
import followsInst from '../assests/images/EzRHFVSQOirAJd2cOs3W58iQGLHRMp9zcPkEn3e5.webp'
import likesInst from '../assests/images/jifRUVNIaicl4pJ6qnFcGFNg5tiMsTn332WSXCwt.webp'
import viewsInst from '../assests/images/hKTNSTbO20pNx6ZyJY7u0ItIFxxIEif5w5tnFiZs.webp'
import followstiktok from '../assests/images/izT5j0fBqBTbCFLCilCb98k378E8wQRGZaxpofPN.webp'
import likestiktok from '../assests/images/Q1XSlPbHcQQctOyjxmGzylL0IWzEc4eJs074Hvnw.webp'
import viewstiktok from '../assests/images/xiR6lDonjc4xRr5MjbKhSqYZMhWQuZx66QREbxfw.webp'

const Services = ({ services, length }: any) => {

    const { isDark } = useThemeStore();
    const { formatPrice } = useCurrency();

    const getServiceImage = (service: any) => {
        if (service.image) return (service.image.url);
        // Instagram
        if (service.platform.includes("انستقرام")) {
            if (service.platform.includes("متابعين")) return followsInst;
            if (service.platform.includes("اعجاب")) return likesInst;
            if (service.platform.includes("مشاهدة")) return viewsInst;
        }

        // TikTok
        if (service.platform.includes("تيك توك")) {
            if (service.platform.includes("متابعين")) return followstiktok;
            if (service.platform.includes("اعجاب")) return likestiktok;
            if (service.platform.includes("مشاهدة")) return viewstiktok;
        }

        return viewsInst; // صورة افتراضية
    };

    return (
        <div className={`mx-4  sm:px-6  md:px-10 lg:px-16 xl:px-[120px]   md:pt-[90px] pt-[80px] py-12 transition-colors duration-300 ${isDark ? 'bg-gray-900' : ''
            }`}>
            <p className={`p-2 sm:p-4 text-lg sm:text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'
                }`}>
                {length} منتجات
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {services.map((service: any) => (
                    <a
                        href={`#/services/platform/${service._id}`}
                        key={service.id}
                        className={`px-3 sm:px-4 pt-3 sm:pt-4 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] flex flex-col ${isDark
                            ? 'bg-gray-800 border border-gray-700 hover:border-[#dfd7bb]'
                            : 'bg-white/20 border border-[#dfd7bb] hover:border-[#c9a84c]'
                            }`}
                    >
                        {/* الصورة في الأعلى */}
                        <div className="w-full rounded-2xl sm:rounded-3xl aspect-square overflow-hidden">
                            <img
                                src={getServiceImage(service)}
                                alt={service.title}
                                className="w-full rounded-2xl sm:rounded-3xl h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>

                        {/* المحتوى النصي في الأسفل */}
                        <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between">
                            {/* العنوان */}
                            <h3 className={`text-center font-bold text-[14px] sm:text-sm md:text-base transition-colors duration-300 line-clamp-2 ${isDark ? 'text-gray-100' : 'text-gray-800'
                                }`}>
                                {service.title}
                            </h3>

                            {/* السعر /1000 */}
                            <p className={`text-center  text-md xl:text-lg sm:text-md md:text-lg mt-2 font-semibold transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-green-600'
                                }`}>
                                {formatPrice(service.price) || service.price_per_1000 || 0}
                                <span className={`font-semibold xl:text-xl text-lg sm:text-sm ${isDark ? 'text-blue-400' : 'text-green-600'
                                    }`}>
                                    {' '}/ 1000
                                </span>
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    )
}

export default Services