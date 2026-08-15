import { useCurrency } from '@/contexts/CurrencyContext';
import { useThemeStore } from '@/store/theme.store';
import axios from 'axios';
import React from 'react'
import followsInst from '../assests/images/EzRHFVSQOirAJd2cOs3W58iQGLHRMp9zcPkEn3e5.webp'
import likesInst from '../assests/images/jifRUVNIaicl4pJ6qnFcGFNg5tiMsTn332WSXCwt.webp'
import viewsInst from '../assests/images/hKTNSTbO20pNx6ZyJY7u0ItIFxxIEif5w5tnFiZs.webp'
import followstiktok from '../assests/images/izT5j0fBqBTbCFLCilCb98k378E8wQRGZaxpofPN.webp'
import likestiktok from '../assests/images/Q1XSlPbHcQQctOyjxmGzylL0IWzEc4eJs074Hvnw.webp'
import viewstiktok from '../assests/images/xiR6lDonjc4xRr5MjbKhSqYZMhWQuZx66QREbxfw.webp'

const ServicesSection = ({ platform }: any) => {
    const [filteredServices, setFilteredServices] = React.useState<any>([]);
    const [loading, setLoading] = React.useState(false);
    const [isError, setIsError] = React.useState(false);
    const { formatPrice } = useCurrency();
    const { isDark } = useThemeStore();
    // const filteredServices = services.filter((service: any) => service.platform.includes('انستقرام'));

    const getImage = (service: any) => {
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

    React.useEffect(() => {
        getServices()
    }, [])
    const getServices = async () => {
        try {
            setLoading(true);
            setIsError(false);

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/services-list/getOne/${platform.slug}`
            );

            if (res.data) {
                setFilteredServices(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='mt-[35px] py-4'>
            <a href={`#/services/${platform.slug}`} className='rounded-xl overflow-hidden block'>
                <img
                    className='rounded-2xl w-full h-auto object-cover transition-transform duration-300 hover:scale-105'
                    src={platform.image.url}
                    alt={platform.name}
                />
            </a>

            <div className='mt-[35px]'>
                <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-black  ${isDark ? 'text-white' : 'text-black'} transition-colors duration-300`}>
                    خدمات {platform.name}
                </p>

                <div className='mt-[25px]'>
                    {loading ? (
                        // حالة التحميل
                        <div className='flex justify-center items-center py-12'>
                            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500'></div>
                            <p className='mr-3 text-lg text-gray-600 dark:text-gray-300'>جاري تحميل البيانات...</p>
                        </div>
                    ) : isError ? (
                        // حالة الخطأ
                        <div className='text-center py-12'>
                            <p className='text-red-500 text-lg font-semibold'>⚠️ حدث خطأ أثناء تحميل الخدمات</p>
                            <button
                                onClick={() => window.location.reload()}
                                className='mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors'
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        // حالة عدم وجود منتجات
                        <div className='text-center py-12'>
                            <p className='text-gray-500 dark:text-gray-400 text-lg'>🚫 لا توجد خدمات متاحة حالياً</p>
                        </div>
                    ) : (
                        // عرض المنتجات
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                            {filteredServices.slice(0, 4).map((service: any) => (
                                <a
                                    href={`#/services/${platform.slug}/${service._id}`}
                                    key={service.id}
                                    className={`group
                          px-2 sm:px-3 md:px-4 
                          pt-2 sm:pt-3 md:pt-4 
                          pb-1 sm:pb-2 
                          rounded-xl 
                          overflow-hidden 
                          transition-all 
                          duration-300 
                          cursor-pointer                         
                          hover:opacity-75 
                          flex flex-col 
                          border 
                          ${isDark
                                            ? 'bg-gray-800 border-gray-700 hover:border-primary-500'
                                            : 'bg-white/20 border-[#dfd7bb] hover:border-[#c9a84c]'
                                        }`}
                                >
                                    {/* الصورة في الأعلى */}
                                    <div className="w-full rounded-2xl sm:rounded-3xl aspect-square overflow-hidden">
                                        <img
                                            src={getImage(service)}
                                            alt={service.title}
                                            className="w-full h-full object-cover transition-transform duration-300"
                                        />
                                    </div>

                                    {/* المحتوى النصي في الأسفل */}
                                    <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between">
                                        {/* العنوان */}
                                        <h3
                                            className={`text-center 
                              font-bold 
                              text-[14px] sm:text-xs md:text-sm lg:text-base 
                              transition-colors 
                              duration-300 
                              line-clamp-2 
                              ${isDark ? 'text-gray-100' : 'text-gray-800'
                                                }`}
                                        >
                                            {service.title}
                                        </h3>

                                        {/* السعر /1000 */}
                                        <p
                                            className={`text-center 
                              text-md sm:text-sm md:text-base 
                              mt-1 sm:mt-2 
                              xl:text-md
                              font-semibold 
                              transition-colors 
                              duration-300 
                              ${isDark ? 'text-primary-400' : 'text-green-600'
                                                }`}
                                        >
                                            {formatPrice(service.price) || 0}
                                            <span className={`font-semibold xl:text-lg text-lg sm:text-sm md:text-base ${isDark ? 'text-primary-400' : 'text-green-600'}`}>
                                                {' '}/ 1000
                                            </span>
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ServicesSection