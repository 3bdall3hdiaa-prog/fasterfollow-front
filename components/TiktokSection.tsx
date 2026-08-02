import { useCurrency } from '@/contexts/CurrencyContext';
import { useThemeStore } from '@/store/theme.store';
import follows from '../assests/images/izT5j0fBqBTbCFLCilCb98k378E8wQRGZaxpofPN.webp'
import likes from '../assests/images/Q1XSlPbHcQQctOyjxmGzylL0IWzEc4eJs074Hvnw.webp'
import views from '../assests/images/xiR6lDonjc4xRr5MjbKhSqYZMhWQuZx66QREbxfw.webp'
import axios from 'axios';
import React from 'react'

const TiktokSection = () => {
    const [filteredServices, setFilteredServices] = React.useState<any>([]);
    const [loading, setLoading] = React.useState(false);
    const [isError, setIsError] = React.useState(false);
    const { formatPrice } = useCurrency();
    const { isDark } = useThemeStore();
    // const follows = '../assests/images/izT5j0fBqBTbCFLCilCb98k378E8wQRGZaxpofPN.webp'
    // const likes = '../assests/images/Q1XSlPbHcQQctOyjxmGzylL0IWzEc4eJs074Hvnw.webp'
    // const views = '../assests/images/xiR6lDonjc4xRr5MjbKhSqYZMhWQuZx66QREbxfw.webp'
    const getImage = (platform: string) => {
        if (platform.includes("متابعين")) return follows;
        if (platform.includes("اعجاب")) return likes;
        if (platform.includes("مشاهدة")) return views;
    }
    React.useEffect(() => {
        const getServices = async () => {
            try {
                setLoading(true);
                setIsError(false);
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/services-list/getOne/tiktok`)
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
        getServices()
    }, [])


    return (
        <div className='mt-[35px] py-4'>
            <a href='#/services/tiktok' className='rounded-2xl overflow-hidden'>
                <img className='rounded-2xl' src='../assests/images/tikt.webp' />
            </a>
            <div className='mt-[35px]'>

                <p className='text-xl font-bold text-[black] '>خدمات تيك توك</p>

                <div className='mt-[25px]'>
                    {loading ? <p>جاري تحميل البيانات...</p>
                        : isError ? <p>حصل خطا اثناء تحميل البيانات</p> :
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                {filteredServices.slice(0, 3).map((service: any) => (
                                    <a
                                        href={`#/services/platform/${service._id}`}
                                        key={service.id}
                                        className={`px-4 pt-4  rounded-xl overflow-hidden transition-all duration-300  cursor-pointer hover:shadow-lg hover:opacity-75  flex flex-col ${isDark
                                            ? 'bg-gray-800 border border-gray-700 hover:border-primary-500'
                                            : 'bg-white/20 border border-[#dfd7bb] hover:border-[#c9a84c]'
                                            }`}
                                    >
                                        {/* الصورة في الأعلى - تمتد بعرض الكارد */}
                                        <div className="w-full rounded-3xl aspect-square overflow-hidden">
                                            <img
                                                src={service.image.url || getImage(service.platform)}
                                                alt={service.title}
                                                className="w-full rounded-3xl h-full object-cover transition-transform duration-300 "
                                            />
                                        </div>

                                        {/* المحتوى النصي في الأسفل */}
                                        <div className="p-4 flex-1 flex flex-col justify-between ">
                                            {/* العنوان */}
                                            <h3 className={`text-center font-bold text-sm md:text-base transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                {service.title}
                                            </h3>

                                            {/* السعر /1000 */}
                                            <p className={` text-center text-md md:text-lg mt-2 font-semibold transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-green-600'
                                                }`}>
                                                {formatPrice(service.price) || service.price_per_1000 || 0} / <span className='text-xl text-green-600'>1000</span>
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default TiktokSection