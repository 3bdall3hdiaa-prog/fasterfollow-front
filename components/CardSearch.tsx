import React from 'react'
import image from '../assests/images/EzRHFVSQOirAJd2cOs3W58iQGLHRMp9zcPkEn3e5.webp'
import { useThemeStore } from '@/store/theme.store';
import { useCurrency } from '@/contexts/CurrencyContext';

const CardSearch = ({ services, setSearchTerm }: any) => {
    console.log(services);
    const { isDark } = useThemeStore();
    const { formatPrice } = useCurrency();

    return (
        <div className={`overflow-y-auto max-h-[300px] rounded-lg flex flex-col gap-2 p-4 absolute -left-[100px] top-12 lg:right-0 lg:top-14 w-full min-w-[280px] sm:w-[400px] md:w-[450px] lg:w-[500px] shadow-2xl transition-colors duration-300 ${isDark
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
            }`}>
            {services.map((service: any) => (
                <a
                    href={`#/services/platform/${service._id}`}
                    onClick={() => { setSearchTerm('') }}
                    key={service._id}
                    className={`flex gap-3 sm:gap-4 p-2 rounded-lg transition-all duration-200 hover:scale-[1.02] ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                >
                    <div className='w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] flex-shrink-0'>
                        <img
                            src={service.image ? service.image.url : image}
                            alt={service.title || 'خدمة'}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`line-clamp-2 text-sm sm:text-base ${isDark ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                            {service.title}
                        </p>
                        <p className={`text-md sm:text-sm md:text-base mt-1 sm:mt-2 font-semibold transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-green-600'
                            }`}>
                            {formatPrice(service.price) || 0}
                            <span className={`font-semibold text-sm sm:text-base ${isDark ? 'text-primary-400' : 'text-green-600'
                                }`}>
                                {' '}/ 1000
                            </span>
                        </p>
                    </div>
                </a>
            ))}
            {services.length === 0 && (
                <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    لا توجد نتائج
                </div>
            )}
        </div>
    )
}

export default CardSearch