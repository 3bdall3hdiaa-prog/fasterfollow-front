import React, { useState, useMemo, useEffect } from 'react';
import { ServiceResponse } from '../../types';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useThemeStore } from '@/store/theme.store';

interface NewOrderProps {
    services: ServiceResponse[];
}

// ✅ Interface للتقييمات
interface Review {
    _id: string;
    username: string;
    userId: string;
    serviceId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const NewOrder: React.FC<NewOrderProps> = ({ services }) => {
    const { user } = useUser();
    const { isDark } = useThemeStore();
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<any>(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverServices, setServerServices] = useState<ServiceResponse[]>([]);
    const [walletBalance, setWalletBalance] = useState<any>();
    const { formatPrice } = useCurrency();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState<number>(5);
    const [newComment, setNewComment] = useState<string>('');
    const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
    const [reviewLoading, setReviewLoading] = useState<boolean>(false);
    const [reviewError, setReviewError] = useState<string>('');

    // دوال مساعدة للألوان
    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    // جلب الرصيد الحالي للمستخدم
    useEffect(() => {
        if (user) {
            fetchUserBalance();
        }
    }, [user]);

    const fetchUserBalance = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/paypal`);
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

    // ✅ جلب التقييمات للخدمة المختارة
    useEffect(() => {
        if (selectedServiceId) {
            fetchServiceReviews(selectedServiceId);
        } else {
            setReviews([]);
        }
    }, [selectedServiceId]);

    const fetchServiceReviews = async (serviceId: string) => {
        try {
            setReviewLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/${serviceId}`);
            if (response.data) {
                console.log("ascascacssac", response.data);
                setReviews(response.data);
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setReviews([]);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setReviewError('يجب تسجيل الدخول لإضافة تقييم');
            return;
        }

        if (!newComment.trim()) {
            setReviewError('يرجى كتابة تعليق');
            return;
        }

        setReviewLoading(true);
        setReviewError('');

        try {
            const data = {
                serviceId: selectedServiceId,
                rating: newRating,
                comment: newComment,
                userId: user._id || user.id,
                username: user.username
            }
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, data);

            if (response.data) {
                setReviews(prev => [response.data, ...prev]);
                setNewComment('');
                setNewRating(5);
                setShowReviewForm(false);
                setSuccess('تم إضافة تقييمك بنجاح! شكراً لك');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err: any) {
            setReviewError(err.response?.data?.message || 'فشل في إضافة التقييم');
        } finally {
            setReviewLoading(false);
        }
    };

    // جلب البيانات من السيرفر
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/services-list`);
                const servicesData = response.data;
                const filteredServices = servicesData.filter((service: any) => {
                    return service.status === true;
                })
                setServerServices(filteredServices);
            } catch (err) {
                console.error('خطأ في جلب الخدمات:', err);
                setError('فشل في تحميل الخدمات. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const platforms = useMemo(() => [...new Set(serverServices.map(s => s.platform))], [serverServices]);

    // فلترة الخدمات حسب المنصة المختارة والبحث
    const filteredServices = useMemo(() => {
        let filtered = serverServices.filter(s => s.platform === selectedPlatform);

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(s =>
                s.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
            );
        }

        return filtered;
    }, [serverServices, selectedPlatform, searchTerm]);

    const selectedService = useMemo(() => {
        if (!selectedServiceId) return null;

        return serverServices.find(s => {
            const serviceId = s._id || s.providerServiceId || s.id;
            return String(serviceId) === String(selectedServiceId);
        });
    }, [serverServices, selectedServiceId]);

    useEffect(() => {
        if (selectedService && quantity > 0) {
            const cost = (quantity / 1000) * selectedService.price;
            setTotalCost(cost);
        } else {
            setTotalCost(0);
        }
    }, [quantity, selectedService]);

    const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlatform(e.target.value);
        setSelectedServiceId('');
        setSearchTerm('');
        setTotalCost(0);
        setQuantity(0);
        setReviews([]);
        setShowReviewForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (totalCost > walletBalance) {
            setError('رصيدك غير كافٍ لإتمام هذا الطلب.');
            return;
        }

        try {
            const x = await axios.post(`${import.meta.env.VITE_API_URL}/balance-users`, {
                userName: user?.username,
                amount: -totalCost
            })
            if (!x) {
                throw new Error('فشل في خصم الرصيد');
            }
            const getuser = localStorage.getItem('user')
            const userObject = getuser ? JSON.parse(getuser) : null;

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/new-order`, {
                username: userObject.username,
                id_user: userObject._id,
                selectedPlatform,
                serviceId: selectedService?.id || selectedService?.providerServiceId,
                selectedServiceId: selectedService?.id || selectedService?.providerServiceId,
                selectedCategory: selectedService?.platform,
                serviceTitle: selectedService?.title,
                link,
                quantity,
                totalCost,
                provider: selectedService?.provider
            });

            if (res.data) {
                setSuccess(`تم إرسال طلبك بنجاح! تم خصم ${totalCost.toFixed(2)}$ من رصيدك.`);
                setSelectedPlatform('');
                setSelectedServiceId('');
                setSearchTerm('');
                setLink('');
                setQuantity(0);
                setTotalCost(0);
                setReviews([]);
                setShowReviewForm(false);
            }

        } catch (err: any) {
            setError(err.response?.data?.message || "خطأ في إتمام الطلب");
            console.error('خطأ في إرسال الطلب:', err);
        }
    };

    const renderStars = (rating: number) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div style={{ color: getTextColor() }}>جاري تحميل الخدمات...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6" style={{ color: getTextColor() }}>طلب جديد</h1>

            {/* عرض الرصيد الحالي */}
            <div className={`rounded-lg p-4 mb-6 max-w-3xl mx-auto transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="flex justify-between items-center">
                    <span style={{ color: getMutedTextColor() }}>الرصيد الحالي (تقريبا) : </span>
                    <span className="text-2xl font-bold" style={{ color: isDark ? '#60a5fa' : '#c9a84c' }}>
                        {formatPrice(walletBalance?.toFixed(2))}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={`rounded-lg p-8 max-w-3xl mx-auto transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                {error && (
                    <div className={`p-3 rounded-md mb-6 text-center ${isDark
                        ? 'bg-red-900/50 border border-red-700 text-red-300'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>{error}</div>
                )}
                {success && (
                    <div className={`p-3 rounded-md mb-6 text-center ${isDark
                        ? 'bg-green-900/50 border border-green-700 text-green-300'
                        : 'bg-green-50 border border-green-200 text-green-700'
                        }`}>{success}</div>
                )}

                <div className="space-y-6">
                    {/* حقل البحث عن الخدمة */}
                    <div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث باسم الخدمة (اختر المنصة اولا) ..."
                            className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800 placeholder-gray-400'
                                }`}
                        />
                        {searchTerm && filteredServices.length === 0 && selectedPlatform && (
                            <p className="text-sm mt-2" style={{ color: isDark ? '#f87171' : '#dc2626' }}>
                                ❌ لا توجد خدمات تطابق البحث "{searchTerm}"
                            </p>
                        )}
                    </div>

                    {/* اختيار المنصة */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>المنصة</label>
                        <select
                            value={selectedPlatform}
                            onChange={handlePlatformChange}
                            required
                            className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border border-gray-600 text-white'
                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                }`}
                        >
                            <option value="" disabled>-- اختر المنصة --</option>
                            {platforms.map(platform => (
                                <option key={platform} value={platform}>{platform}</option>
                            ))}
                        </select>
                    </div>

                    {/* اختيار الخدمة */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>
                            الخدمة {searchTerm && filteredServices.length > 0 && `(${filteredServices.length} نتيجة)`}
                        </label>
                        <select
                            value={selectedServiceId}
                            onChange={e => {
                                setSelectedServiceId(e.target.value);
                                setQuantity(0);
                                setTotalCost(0);
                                setShowReviewForm(false);
                            }}
                            required
                            disabled={!selectedPlatform || filteredServices.length === 0}
                            className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border border-gray-600 text-white disabled:opacity-50'
                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800 disabled:opacity-50'
                                }`}
                        >
                            <option value="" disabled>
                                {!selectedPlatform
                                    ? '-- اختر المنصة أولاً --'
                                    : filteredServices.length === 0
                                        ? '-- لا توجد خدمات --'
                                        : '-- اختر خدمة --'}
                            </option>
                            {filteredServices.map(service => {
                                const serviceId = service._id || service.providerServiceId || service.id;
                                return (
                                    <option key={serviceId} value={serviceId}>
                                        {service.title} - {formatPrice(service.price)}/1000
                                    </option>
                                );
                            })}
                        </select>
                        {selectedPlatform && filteredServices.length === 0 && (
                            <p className="text-sm mt-2" style={{ color: isDark ? '#f87171' : '#dc2626' }}>
                                ❌ لا توجد خدمات على منصة {selectedPlatform}{searchTerm ? ` تطابق البحث "${searchTerm}"` : ''}
                            </p>
                        )}
                    </div>

                    {/* عرض وصف الخدمة المختارة */}
                    {selectedService?.description && (
                        <div className={`border rounded-lg p-4 ${isDark
                            ? 'bg-gray-700/50 border-gray-600'
                            : 'bg-gray-50 border-[#dfd7bb]'
                            }`}>
                            <h3 className="text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>وصف الخدمة:</h3>
                            <p className="text-sm leading-relaxed" style={{ color: getTextColor() }}>
                                {selectedService.description}
                            </p>
                        </div>
                    )}

                    {/* ✅ قسم التقييمات - يظهر فقط عند اختيار خدمة */}
                    {selectedServiceId && (
                        <div className={`border rounded-lg p-4 ${isDark
                            ? 'border-gray-600'
                            : 'border-[#dfd7bb]'
                            }`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold" style={{ color: getTextColor() }}>
                                    📊 تقييمات الخدمة
                                </h3>
                                {reviews.length > 0 && (
                                    <span className="text-sm" style={{ color: getMutedTextColor() }}>
                                        {getAverageRating()} ⭐ ({reviews.length} تقييم)
                                    </span>
                                )}
                            </div>

                            {/* عرض التقييمات مع Scroll */}
                            {reviewLoading && reviews.length === 0 ? (
                                <div className="text-center py-4" style={{ color: getMutedTextColor() }}>
                                    جاري تحميل التقييمات...
                                </div>
                            ) : reviews.length === 0 ? (
                                <p className="text-center py-4" style={{ color: getMutedTextColor() }}>
                                    لا توجد تقييمات لهذه الخدمة بعد. كن أول من يقيم!
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                    {reviews.map((review) => (
                                        <div key={review._id} className={`p-3 rounded-lg ${isDark
                                            ? 'bg-gray-700/50'
                                            : 'bg-gray-50'
                                            }`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-medium" style={{ color: getTextColor() }}>
                                                        {review.username || 'مستخدم'}
                                                    </span>
                                                    <span className="text-sm mr-2" style={{ color: getMutedTextColor() }}>
                                                        {renderStars(review.rating)}
                                                    </span>
                                                </div>
                                                <span className="text-xs" style={{ color: getMutedTextColor() }}>
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar-EG') : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1" style={{ color: getMutedTextColor() }}>
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ✅ زر إضافة تقييم */}
                            {user && (
                                <div className="mt-4">
                                    {!showReviewForm ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewForm(true)}
                                            className={`text-sm font-medium transition-colors ${isDark
                                                ? 'text-primary-400 hover:text-primary-300'
                                                : 'text-[#c9a84c] hover:text-[#b8973a]'
                                                }`}
                                        >
                                            + أضف تقييمك
                                        </button>
                                    ) : (
                                        <div className="space-y-3 mt-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: getMutedTextColor() }}>
                                                    تقييمك
                                                </label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setNewRating(star)}
                                                            className="text-2xl transition-transform hover:scale-110"
                                                        >
                                                            {star <= newRating ? '⭐' : '☆'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="شارك تجربتك مع هذه الخدمة..."
                                                    rows={3}
                                                    className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                                        ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800 placeholder-gray-400'
                                                        }`}
                                                />
                                            </div>
                                            {reviewError && (
                                                <p className="text-sm text-red-500">{reviewError}</p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAddReview}
                                                    disabled={reviewLoading || !newComment.trim()}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${reviewLoading || !newComment.trim()
                                                        ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : isDark
                                                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                                            : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white'
                                                        }`}
                                                >
                                                    {reviewLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowReviewForm(false);
                                                        setReviewError('');
                                                        setNewComment('');
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                                        }`}
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* إدخال الرابط */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>الرابط</label>
                        <input
                            type="text"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            required
                            className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border border-gray-600 text-white'
                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                }`}
                            placeholder="https://www.instagram.com/username"
                        />
                    </div>

                    {/* إدخال الكمية */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>الكمية</label>
                        <input
                            type="number"
                            value={quantity || ''}
                            onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setQuantity(val);
                            }}
                            required
                            min="1"
                            className={`w-full rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ${isDark
                                ? 'bg-gray-700 border border-gray-600 text-white'
                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                }`}
                        />
                        {selectedService && (
                            <p className="text-xs mt-2" style={{ color: getMutedTextColor() }}>
                                الحد الأدنى: {selectedService.min?.toLocaleString() || 0} / الحد الأقصى: {selectedService.max?.toLocaleString() || 0}
                            </p>
                        )}
                    </div>
                </div>

                {/* عرض التكلفة وزر الإرسال */}
                <div className={`mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                    } border-t`}>
                    <div className="mb-4 sm:mb-0">
                        <span style={{ color: getMutedTextColor() }}>التكلفة الإجمالية:</span>
                        <span className="text-2xl font-bold mr-2" style={{ color: isDark ? '#60a5fa' : '#c9a84c' }}>
                            {formatPrice(totalCost.toFixed(2))}
                        </span>
                        <div className="text-sm mt-1" style={{ color: getMutedTextColor() }}>
                            الرصيد المتبقي بعد الشراء: {formatPrice((walletBalance - totalCost))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={totalCost > walletBalance || totalCost === 0}
                        className={`w-full sm:w-auto font-bold py-3 px-8 rounded-lg transition-all duration-300 ${totalCost > walletBalance || totalCost === 0
                            ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        {totalCost === 0 ? 'أدخل الكمية' : totalCost > walletBalance ? 'رصيد غير كافي' : 'إرسال الطلب'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewOrder;