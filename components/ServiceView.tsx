import { useThemeStore } from '@/store/theme.store';
import { Check, ShieldCheck, Clock, Zap } from "lucide-react";
import axios from 'axios';
import React from 'react'
import Reviews from './Reviews';
import { useCurrency } from '@/contexts/CurrencyContext';
import followsInst from '../assests/images/EzRHFVSQOirAJd2cOs3W58iQGLHRMp9zcPkEn3e5.webp'
import likesInst from '../assests/images/jifRUVNIaicl4pJ6qnFcGFNg5tiMsTn332WSXCwt.webp'
import viewsInst from '../assests/images/hKTNSTbO20pNx6ZyJY7u0ItIFxxIEif5w5tnFiZs.webp'
import followstiktok from '../assests/images/izT5j0fBqBTbCFLCilCb98k378E8wQRGZaxpofPN.webp'
import likestiktok from '../assests/images/Q1XSlPbHcQQctOyjxmGzylL0IWzEc4eJs074Hvnw.webp'
import viewstiktok from '../assests/images/xiR6lDonjc4xRr5MjbKhSqYZMhWQuZx66QREbxfw.webp'
import { useAuthStore } from '@/store/auth.store';
const ServiceView = ({ id }: { id: string }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = React.useState(false);
    const [isError, setIsError] = React.useState(false);
    const [avrgRating, setAvrgRating] = React.useState(0);
    const [numReviews, setNumReviews] = React.useState(0);
    const { formatPrice } = useCurrency();
    const [link, setLink] = React.useState('');
    const [quantity, setQuantity] = React.useState<number>(0);
    const [totalCost, setTotalCost] = React.useState<any>(0);
    const [walletBalance, setWalletBalance] = React.useState<any>();
    const [Service, setService] = React.useState<any>(null);
    const { isDark } = useThemeStore();

    const getServiceImage = (platform: string) => {
        if (Service?.image) return (Service.image.url);
        if (!platform) return viewsInst; // لو القيمة مش موجودة لسه، رجّع صورة افتراضية

        // Instagram
        if (platform.includes("انستقرام")) {
            if (platform.includes("متابعين")) return followsInst;
            if (platform.includes("اعجاب")) return likesInst;
            if (platform.includes("مشاهدة")) return viewsInst;
        }

        // TikTok
        if (platform.includes("تيك توك")) {
            if (platform.includes("متابعين")) return followstiktok;
            if (platform.includes("اعجاب")) return likestiktok;
            if (platform.includes("مشاهدة")) return viewstiktok;
        }

        return viewsInst; // صورة افتراضية
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const guarantee = React.useMemo(() => {
        const description = Service?.title || '';
        return description.match(/ضمان\s+(\d+)/)?.[1] || Service?.guarantee || 'غير معروف';
    }, [Service]);

    const perDay = React.useMemo(() => {
        const description = Service?.title || '';
        return description.match(/\[\s*(\d+\s*(?:الاف|الف|ألف)?)\s*\/\s*باليوم/i)?.[1] || Service?.perDay || 'غير معروف';
    }, [Service]);

    const cards = [

        {
            icon: ShieldCheck,
            label: "الضمان",
            value: `${guarantee} يوم`,
        },
        {
            icon: Zap,
            label: "السرعة",
            value: ` يوم/${perDay}  `,
        },
    ];



    const isDisabled = user.role === 'admin' || totalCost > walletBalance || quantity === 0 || !user.role;
    {/*handlers */ }
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <span key={i} className="text-yellow-400 text-4xl">★</span>  // تغيير text-lg إلى text-4xl
                );
            } else if (hasHalfStar && i === fullStars + 1) {
                stars.push(
                    <span key={i} className="text-yellow-400 text-4xl">☆</span>  // تغيير text-lg إلى text-4xl
                );
            } else {
                stars.push(
                    <span key={i} className={`text-4xl ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>★</span>  // تغيير text-lg إلى text-4xl
                );
            }
        }
        return stars;
    };
    const getService = async () => {
        try {
            setLoading(true);
            setIsError(false);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/services-list/${id}`, { withCredentials: true, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            if (res.data) {
                setService(res.data)
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    }
    const fetchUserBalance = async () => {
        try {

            const res = await fetch(`${import.meta.env.VITE_API_URL}/paypal`, {
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('خطأ أثناء جلب بيانات PayPal');
            const payments = await res.json();

            if (!Array.isArray(payments)) return;

            const userPayments = payments.filter(
                (p: any) => p.userName === user?.username
            );

            const totalBalance = userPayments.reduce(
                (sum: number, p: any) => sum + parseFloat(p.amount || 0),
                0
            );

            setWalletBalance(totalBalance);
        } catch (err) {
            console.error('PayPal Fetch Error:', err);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (totalCost > walletBalance) {
            alert('رصيدك غير كافٍ لإتمام هذا الطلب.');
            return;
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/new-order`, {
                username: user.username,
                id_user: user._id,
                serviceId: Service?._id,
                selectedCategory: Service?.platform,
                serviceTitle: Service?.title,
                link,
                quantity,
                totalCost,
                provider: Service?.provider._id,
            }, { withCredentials: true, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });

            if (res.data && res.data.success) {
                const x = await axios.post(`${import.meta.env.VITE_API_URL}/balance-users`, {
                    userName: user?.username,
                    amount: -res.data.totalCost
                }, { withCredentials: true, headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                if (!x) {
                    throw new Error('فشل في خصم الرصيد');
                }
                alert(`تم إرسال طلبك بنجاح! تم خصم ${totalCost.toFixed(2)}$ من رصيدك.`);
                setLink('');
                setQuantity(0);
                setTotalCost(0);

            }

        } catch (err: any) {
            alert(err.response?.data?.message || "خطأ في إتمام الطلب");
            console.error('خطأ في إرسال الطلب:', err);
        }
    };


    React.useEffect(() => {
        if (user) {
            fetchUserBalance();
        }
    }, [user]);
    React.useEffect(() => {
        if (!id) return
        getService()

    }, [id])

    React.useEffect(() => {
        if (quantity <= 0) {
            setTotalCost(0);
            return;
        }

        const cost = (quantity / 1000) * Service.price;

        const discountRule = Service.discounts?.find(
            (item: any) =>
                quantity >= item.from &&
                quantity <= item.to
        );

        if (discountRule) {
            setTotalCost(cost * ((100 - discountRule.discount) / 100));
        } else {
            setTotalCost(cost);
        }

    }, [quantity, Service]);
    return (
        <div className='pt-10 sm:pt-16 lg:pt-[120px]    sm:px-6   mx-4 lg:px-[120px] '>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-8'>

                <div className='pt-12 lg:sticky lg:top-24 overflow-hidden rounded-3xl w-full lg:w-[500px] h-90 sm:h-[800px] lg:h-[550px] shrink-0'>
                    <img className='object-cover w-full h-full rounded-3xl' src={getServiceImage(Service?.platform)} />
                </div>

                <div className='flex-1 flex flex-col gap-y-4'>
                    <span className={`font-bold text-2xl sm:text-3xl lg:text-4xl leading-snug lg:leading-[50px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}> {Service?.title}</span>
                    {/* التقييم */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex gap-1">
                            {renderStars(avrgRating)}
                        </div>
                        <span className={`text-lg lg:text-2xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            ({numReviews} مراجعة)
                        </span>
                    </div>
                    <div className={`flex flex-col gap-y-4 text-lg lg:text-2xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <p className=''>السعر لكل <span className='underline'>1000</span></p>
                        <span className={`text-lg lg:text-2xl font-semibold ${isDark ? 'text-gray-300' : 'text-[#c9a84c]'}`}>
                            {formatPrice(Service?.price || 0)}
                        </span>
                    </div>
                    {/* الخصائص  */}
                    <div>
                        <div dir="ltr" className="w-full max-w-3xl font-sans" style={{ fontFamily: "Tahoma, Arial, sans-serif" }}>
                            {/* 4 feature cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                {cards.map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-4 sm:py-6 px-2"
                                    >
                                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#c9a84c]" strokeWidth={2.5} />
                                        <span className="text-gray-800 text-xs sm:text-sm font-medium text-center">{label}</span>

                                        <span className="flex items-center gap-1 text-gray-900 font-semibold text-xs sm:text-sm">
                                            {value}
                                            {label === "الضمان" && (
                                                <ShieldCheck className="w-4 h-4 text-green-500" strokeWidth={2.5} />
                                            )}
                                        </span>

                                    </div>
                                ))}
                            </div>

                            {/* checklist */}
                            <div className="text-right rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                                <p className="flex flex-col gap-3">

                                    <span dir="rtl" className="text-gray-800 text-sm  leading-relaxed whitespace-pre-line">
                                        {`${Service?.description || ''}`}
                                    </span>


                                </p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}>

                        {/*quantity and link video */}
                        <div className='flex flex-col gap-y-4'>
                            {/* إدخال الكمية */}
                            <div>
                                <label className="text-sm font-medium mb-2 flex justify-between flex-wrap gap-2" style={{ color: getMutedTextColor() }}>
                                    <p className="text-lg font-semibold">الكمية</p>
                                    <div className="">
                                        <span className="text-xl font-bold mr-2" style={{ color: isDark ? '#60a5fa' : '#c9a84c' }}>
                                            {formatPrice(totalCost)}
                                        </span>
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    value={quantity || ''}
                                    onChange={e => {
                                        const val = parseInt(e.target.value) || 0;
                                        setQuantity(val);
                                    }}
                                    required
                                    min="1"
                                    max={Service?.max || 0}
                                    className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                />
                                <span className='text-gray-400 text-sm'>الحد الادني لطلب الخدمه هو {Service?.min?.toLocaleString() || 0}</span>
                            </div>
                            {/* إدخال الرابط */}
                            <div>
                                <label className="block mb-2 text-lg font-semibold" style={{ color: getMutedTextColor() }}>الرابط</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    required
                                    className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    placeholder="ضع رابط هنا واتاكد انه عام"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className={`w-full sm:w-auto font-bold py-3 mt-4 px-8 rounded-lg transition-all duration-300 ${isDisabled
                                ? isDark
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : isDark
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                    : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {user.role === 'admin' ? "انت الادمن" : !user.role ? "سجل الدخول للطلب" : totalCost > walletBalance ? 'رصيد غير كافي' : 'إرسال الطلب'}
                        </button>
                    </form>

                </div>

            </div>
            {/*Reviews*/}
            <Reviews serviceId={Service?._id} setAvrgRating={setAvrgRating} setNumReviews={setNumReviews} />
        </div>
    )
}

export default ServiceView