import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// تعريف الـ Interface
interface Review {
    _id: string;
    comment: string;
    userId: {
        name: string;
        username: string;
        _id: string;
        email?: string;
    };
    serviceId: {
        title: string;
        _id: string;
    };
    rating: number;
    isPublished: boolean; // إضافة هذا الحقل
    createdAt?: string;
}

const ManageReviews = () => {
    const { isDark } = useThemeStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // جلب التقييمات
    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/admin`);
            if (response.data.success) {
                setReviews(response.data.data || response.data);
            } else {
                setReviews(response.data);
            }
        } catch (err: any) {
            console.error('Error fetching reviews:', err);
            setError('فشل في تحميل التقييمات. يرجى المحاولة مرة أخرى.');
            toast.error('فشل في تحميل التقييمات');
        } finally {
            setLoading(false);
        }
    };

    // حذف تقييم (للتقييمات المنشورة وغير المنشورة)
    const handleDelete = async (reviewId: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
            return;
        }

        try {
            setDeletingId(reviewId);
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}`);

            if (response.data) {
                toast.success('تم حذف التقييم بنجاح');
                setReviews(prev => prev.filter(review => review._id !== reviewId));
            } else {
                toast.error(response.data.message || 'فشل في حذف التقييم');
            }
        } catch (err: any) {
            console.error('Error deleting review:', err);
            toast.error(err.response?.data?.message || 'فشل في حذف التقييم');
        } finally {
            setDeletingId(null);
        }
    };

    // قبول التقييم (نشر التقييم)
    const handleApprove = async (reviewId: string) => {
        try {
            setProcessingId(reviewId);
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/reviews/${reviewId}`,
                { isPublished: true }
            );

            if (response.data) {
                toast.success('تم نشر التقييم بنجاح');
                // تحديث التقييم في القائمة
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? { ...review, isPublished: true }
                        : review
                ));
            } else {
                toast.error(response.data.message || 'فشل في نشر التقييم');
            }
        } catch (err: any) {
            console.error('Error approving review:', err);
            toast.error(err.response?.data?.message || 'فشل في نشر التقييم');
        } finally {
            setProcessingId(null);
        }
    };

    // رفض التقييم (حذف التقييم)
    const handleReject = async (reviewId: string) => {
        if (!window.confirm('هل أنت متأكد من رفض هذا التقييم؟')) {
            return;
        }

        await handleDelete(reviewId);
    };

    // جلب البيانات عند تحميل المكون
    useEffect(() => {
        fetchReviews();
    }, []);

    // دالة لعرض النجوم
    const renderStars = (rate: number) => {
        const stars = [];
        const fullStars = Math.floor(rate);
        const hasHalfStar = rate % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                );
            } else if (hasHalfStar && i === fullStars + 1) {
                stars.push(
                    <span key={i} className="text-yellow-400 text-lg">☆</span>
                );
            } else {
                stars.push(
                    <span key={i} className={`text-lg ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>★</span>
                );
            }
        }
        return stars;
    };

    // دالة للحصول على أول حرف من الاسم
    const getInitial = (name: string) => {
        if (!name) return '?';
        return name.trim().charAt(0).toUpperCase();
    };

    // دالة لتوليد لون ثابت للـ Avatar
    const getColorFromName = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dfd7bb] mx-auto"></div>
                    <p className={`mt-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>جاري تحميل التقييمات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <p className={`text-red-500 text-xl mb-4`}>{error}</p>
                    <button
                        onClick={fetchReviews}
                        className={`px-6 py-2 rounded-lg transition-colors ${isDark
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-[#dfd7bb] text-gray-800 hover:bg-[#d4c9a8]'
                            }`}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 py-8">
                {/* العنوان والإحصائيات */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            إدارة التقييمات
                        </h1>
                        <p className={`mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            إجمالي التقييمات: <span className="font-bold">{reviews.length}</span>
                            {' | '}
                            المنشورة: <span className="font-bold text-green-500">{reviews.filter(r => r.isPublished).length}</span>
                            {' | '}
                            قيد المراجعة: <span className="font-bold text-yellow-500">{reviews.filter(r => !r.isPublished).length}</span>
                        </p>
                    </div>
                    <button
                        onClick={fetchReviews}
                        className={`px-4 py-2 rounded-lg transition-colors ${isDark
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-[#dfd7bb] text-gray-800 hover:bg-[#d4c9a8]'
                            }`}
                    >
                        تحديث
                    </button>
                </div>

                {/* قائمة التقييمات */}
                {reviews.length === 0 ? (
                    <div className={`text-center py-20 rounded-lg transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            لا توجد تقييمات حالياً
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {reviews.map((review) => (
                            <div
                                key={review._id}
                                className={`rounded-lg p-6 transition-all duration-300 ${isDark
                                    ? 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                                    : 'bg-white border border-gray-200 hover:shadow-lg'
                                    }`}
                            >
                                {/* حالة النشر */}
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${review.isPublished
                                        ? isDark
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-green-100 text-green-700'
                                        : isDark
                                            ? 'bg-yellow-900/30 text-yellow-400'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {review.isPublished ? '✅ منشور' : '⏳ قيد المراجعة'}
                                    </span>

                                    {/* أزرار الإجراءات حسب حالة النشر */}
                                    {!review.isPublished ? (
                                        // تقييم غير منشور: عرض قبول ورفض
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(review._id)}
                                                disabled={processingId === review._id}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${processingId === review._id
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : isDark
                                                        ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {processingId === review._id ? (
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    'قبول'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleReject(review._id)}
                                                disabled={deletingId === review._id}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${deletingId === review._id
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : isDark
                                                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {deletingId === review._id ? (
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    'رفض'
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        // تقييم منشور: عرض زر حذف فقط
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            disabled={deletingId === review._id}
                                            className={`p-2 rounded-lg transition-all duration-300 ${deletingId === review._id
                                                ? 'opacity-50 cursor-not-allowed'
                                                : isDark
                                                    ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                                                    : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                                                }`}
                                            title="حذف التقييم"
                                        >
                                            {deletingId === review._id ? (
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* رأس البطاقة - اسم المستخدم والخدمة */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                                            style={{ backgroundColor: getColorFromName(review.userId?.name || '') }}
                                        >
                                            {getInitial(review.userId?.name || review.userId?.email || 'مستخدم')}
                                        </div>
                                        <div className="mr-3 min-w-0">
                                            <h3 className={`font-bold text-sm truncate transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                {review.userId?.name || review.userId?.email || 'مستخدم غير معروف'}
                                            </h3>
                                            <p className={`text-xs truncate transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                {review.userId?.username || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* اسم الخدمة */}
                                <div className="mb-3">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isDark
                                        ? 'bg-gray-700 text-gray-300'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {review.serviceId?.title || 'خدمة غير محددة'}
                                    </span>
                                </div>

                                {/* التقييم بالنجوم */}
                                <div className="flex mb-3 gap-0.5">
                                    {renderStars(review.rating || 0)}
                                    <span className={`mr-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        ({review.rating || 0})
                                    </span>
                                </div>

                                {/* التعليق */}
                                <p className={`text-sm mb-3 line-clamp-3 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    "{review.comment}"
                                </p>

                                {/* التاريخ */}
                                {review.createdAt && (
                                    <p className={`text-xs transition-colors duration-300 ${isDark ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                        {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReviews;