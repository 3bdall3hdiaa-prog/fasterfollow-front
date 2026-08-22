import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import axios from 'axios';
import { useThemeStore } from '@/store/theme.store';
import ReviewModal from './ReviewModel';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuthStore } from '@/store/auth.store';

const statusClasses: Record<string, string> = {
    'pending': 'bg-yellow-900 text-yellow-300',
    'Pending': 'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'In progress': 'bg-blue-900 text-blue-300',
    'completed': 'bg-green-900 text-green-300',
    'cancelled': 'bg-gray-700 text-gray-300',
    'failed': 'bg-red-900 text-red-300',
};

const getStatusClasses = (isDark: boolean) => {
    if (isDark) {
        return {
            'pending': 'bg-yellow-900 text-yellow-300',
            'Pending': 'bg-yellow-900 text-yellow-300',
            'In Progress': 'bg-blue-900 text-blue-300',
            'In progress': 'bg-blue-900 text-blue-300',
            'completed': 'bg-green-900 text-green-300',
            'Completed': 'bg-green-900 text-green-300',
            'cancelled': 'bg-gray-700 text-gray-300',
            'failed': 'bg-red-900 text-red-300',
        };
    } else {
        return {
            'pending': 'bg-yellow-100 text-yellow-700',
            'Pending': 'bg-yellow-100 text-yellow-700',
            'In Progress': 'bg-blue-100 text-blue-700',
            'In progress': 'bg-blue-100 text-blue-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-gray-200 text-gray-600',
            'failed': 'bg-red-100 text-red-700',
        };
    }
};


const OrdersHistory = () => {
    const [refillDataMap, setRefillDataMap] = useState<{ [key: string]: any }>({})
    const [refillIdMap, setRefillIdMap] = useState<{ [key: string]: string }>({})
    const [refillingMap, setRefillingMap] = useState<{ [key: string]: boolean }>({});
    const { isDark } = useThemeStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUsername, setCurrentUsername] = useState<string>('');
    const { user } = useAuthStore()
    // States for review modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [reviewComment, setReviewComment] = useState<string>('');
    const [reviewRating, setReviewRating] = useState(5);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');
    const { formatPrice } = useCurrency()
    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };
    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const getCardBackground = () => {
        return isDark ? '#252a41' : '#ffffff';
    };

    const getInputBackground = () => {
        return isDark ? '#1e2235' : '#ffffff';
    };

    const getInputTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getBorderColor = () => {
        return isDark ? '#374151' : '#dfd7bb';
    };


    // دالة لاستخراج بيانات المستخدم كاملة
    const getUserData = () => {
        try {
            if (!user) return null;
            return user;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };
    const handleRefill = async (order: any) => {
        // ضبط حالة التحميل للطلب الحالي
        setRefillingMap(prev => ({ ...prev, [order._id]: true }));

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/services-list/refill`, {
                order: order?.providerOrderId || '',
                apiEndpoint: order?.provider.apiEndpoint || '',
                key: order?.provider.apiKey || '',
            }, { withCredentials: true });

            if (res.data) {
                if (res.data.error) {
                    alert(res.data.error)
                }
                const { refill } = res.data
                setRefillIdMap(prev => ({
                    ...prev,
                    [order._id]: refill
                }))
            }
            setReviewSuccess('تم إرسال طلب إعادة التعبئة بنجاح! شكراً لك.');
        } catch (error) {
            console.error('Error refilling order:', error);
            setReviewError('حدث خطأ أثناء إرسال طلب إعادة التعبئة. حاول مرة أخرى.');
        } finally {
            // إزالة حالة التحميل للطلب الحالي
            setRefillingMap(prev => ({ ...prev, [order._id]: false }));
        }
    }
    const handleView = async (orderId: string, refillid: any, order: any) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/services-list/refillStatus`, {
                refillid,
                key: order.provider.apiKey,
                apiEndpoint: order.provider.apiEndpoint
            }, { withCredentials: true })
            if (res.data) {
                // خزن البيانات مع مفتاح orderId
                setRefillDataMap(prev => ({
                    ...prev,
                    [orderId]: res.data
                }))
            }
        } catch (error) {
            console.error('Error fetching refill status:', error);
        }
    }
    // جلب البيانات من السيرفر
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/new-order/me`, { withCredentials: true, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` } });

                if (!response.data || !Array.isArray(response.data)) {
                    console.error('Invalid response data:', response.data);
                    setError('بيانات غير صالحة من الخادم');
                    setLoading(false);
                    return;
                }

                setOrders(response.data);

            } catch (err: any) {
                console.error('خطأ في جلب الطلبات:', err);
                const errorMessage = err?.response?.data?.message || err?.message || 'لا يوجد طلبات.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // تصفية الطلبات بشكل آمن مع الحفاظ على الترتيب


    // دالة لتنسيق التاريخ بشكل آمن
    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'لا يوجد تاريخ';

            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'تاريخ غير صالح';
            }
            return date.toLocaleString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'تاريخ غير صالح';
        }
    };

    // إحصائيات الطلبات بشكل آمن
    const orderStats = useMemo(() => {
        if (!orders || !Array.isArray(orders)) {
            return {
                total: 0,
                pending: 0,
                completed: 0,
                cancelled: 0,
                failed: 0,
                inProgress: 0
            };
        }

        const validOrders = orders.filter(order => order && order.id && order.status);

        return {
            total: validOrders.length,
            pending: validOrders.filter(o => o.status === 'pending').length,
            completed: validOrders.filter(o => o.status === 'completed').length,
            cancelled: validOrders.filter(o => o.status === 'cancelled').length,
            failed: validOrders.filter(o => o.status === 'failed').length,
            inProgress: validOrders.filter(o => o.status === 'In Progress').length
        };
    }, [orders]);

    // دالة لعرض حالة الطلب بشكل آمن
    const renderStatus = (status: OrderStatus) => {
        const statusTexts: { [key: string]: string } = {
            'pending': 'قيد الانتظار',
            'completed': 'مكتمل',
            'cancelled': 'ملغي',
            'failed': 'فاشل',
            'In Progress': 'جاري التنفيذ',
        };

        const statusClassMap = getStatusClasses(isDark);
        const statusClass = statusClassMap[status.toLocaleLowerCase()] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600');
        const statusText = statusTexts[status.toLocaleLowerCase()] || status;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                {statusText}
            </span>
        );
    };

    // دالة فتح نافذة التقييم
    const openReviewModal = (order: Order) => {
        setSelectedOrder(order);
        setReviewComment('');
        setReviewRating(5);
        setReviewError('');
        setReviewSuccess('');
        setShowReviewModal(true);
    };

    // دالة إغلاق نافذة التقييم
    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedOrder(null);
        setReviewComment('');
        setReviewRating(5);
        setReviewError('');
        setReviewSuccess('');
        setIsSubmittingReview(false);
    };

    // دالة إرسال التقييم
    const handleSubmitReview = async () => {
        if (!selectedOrder) return;

        // التحقق من وجود تعليق
        if (!reviewComment.trim()) {
            setReviewError('الرجاء إدخال تعليق');
            return;
        }

        try {
            setIsSubmittingReview(true);
            setReviewError('');
            setReviewSuccess('');

            const user = getUserData();
            if (!user) {
                setReviewError('لم يتم العثور على بيانات المستخدم');
                setIsSubmittingReview(false);
                return;
            }

            const serviceId = selectedOrder.serviceId._id;

            const reviewData = {
                userId: user._id,
                username: user.username || 'مستخدم',
                serviceId: serviceId,
                rating: reviewRating,
                comment: reviewComment.trim(),
            };


            const res = await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, reviewData, { withCredentials: true });

            if (res.status === 200 || res.status === 201) {
                setReviewSuccess('تم إرسال التقييم بنجاح! شكراً لك.');
                setTimeout(() => {
                    closeReviewModal();
                }, 2000);
            } else {
                setReviewError('حدث خطأ أثناء إرسال التقييم. حاول مرة أخرى.');
            }

        } catch (err: any) {
            console.error('Error submitting review:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'حدث خطأ أثناء إرسال التقييم';
            setReviewError(errorMessage);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // دالة عرض نجوم التقييم
    const renderStars = (rating: number, interactive: boolean = false) => {
        return (
            <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && setReviewRating(star)}
                        className={`text-2xl md:text-3xl transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                            } ${star <= rating
                                ? 'text-yellow-400'
                                : isDark
                                    ? 'text-gray-600'
                                    : 'text-gray-300'
                            }`}
                        disabled={!interactive}
                        style={{ touchAction: 'manipulation' }}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    // مكون نافذة التقييم المنبثقة المحسّن للموبايل


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div style={{ color: getTextColor() }}>جاري تحميل الطلبات...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 rounded-lg text-center ${isDark
                ? 'bg-red-900/50 border border-red-700 text-red-300'
                : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                {error}
                <button
                    onClick={() => window.location.reload()}
                    className={`mt-2 px-4 py-2 rounded-md block mx-auto transition-colors ${isDark
                        ? 'bg-red-700 hover:bg-red-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className=" pt-4 md:p-4" style={{
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-right" style={{ color: getTextColor() }}>
                سجل الطلبات
            </h1>

            {currentUsername && (
                <div className={`p-3 rounded-lg mb-4 text-center md:text-right ${isDark
                    ? 'bg-blue-900/50 border border-blue-700 text-blue-300'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                    <span className="font-medium">المستخدم الحالي:</span> {currentUsername}
                </div>
            )}

            {/* حقل البحث والتصفية */}
            <div className={`rounded-lg p-4 mb-6 transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="ابحث برقم الطلب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`rounded-md p-3 w-full text-sm md:text-base transition-all duration-300 ${isDark
                            ? 'bg-gray-700 border border-gray-600 text-white'
                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                            }`}
                    />

                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm justify-center md:justify-start" style={{ color: getMutedTextColor() }}>
                    <span>الإجمالي: {orderStats.total}</span>
                    <span>المعروض: {orders.length}</span>
                    <span>قيد الانتظار: {orderStats.pending}</span>
                    <span>مكتمل: {orderStats.completed}</span>
                    <span>قيد التنفيذ: {orderStats.inProgress}</span>
                </div>

                <div className="mt-3 text-center md:text-right">
                    <div className="text-sm" style={{ color: isDark ? '#4ade80' : '#22c55e' }}>
                        الطلبات مرتبة من الأحدث إلى الأقدم
                    </div>
                </div>
            </div>


            {/* ✅ تصميم البطاقات للهواتف مع زر تقييم */}
            <div className="block">
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                    {orders.length === 0 ? (
                        <div className={`col-span-full text-center py-8 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-[#dfd7bb] shadow-md'
                            }`} style={{ color: getMutedTextColor() }}>
                            {orders.length === 0 ? 'لا توجد طلبات حالياً' : 'لم يتم العثور على طلبات تطابق البحث'}
                        </div>
                    ) : (
                        orders.map((order: any) => {
                            const orderRefillId = refillIdMap[order._id]
                            const orderRefillData = refillDataMap[order._id]

                            return (
                                <div
                                    key={order._id}
                                    className={`rounded-lg border-2 p-4 transition-colors h-full min-h-[320px] flex flex-col ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#dfd7bb]'
                                        }`}
                                >
                                    {/* رأس البطاقة */}
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs" style={{ color: getMutedTextColor() }}>رقم الطلب</p>
                                            <div className="font-bold text-lg mb-1 truncate" style={{ color: getTextColor() }}>
                                                #{order.id || 'N/A'}
                                            </div>
                                            <div className="text-sm truncate" style={{ color: getMutedTextColor() }}>
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {renderStatus(order.status)}
                                        </div>
                                    </div>

                                    {/* معلومات الطلب */}
                                    <div className="space-y-3 mb-4 flex-1">
                                        <div>
                                            <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>الخدمة</div>
                                            <div className="font-semibold truncate" style={{ color: getTextColor() }}>
                                                {order.serviceTitle || 'خدمة غير معروفة'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>عدد البدا</div>
                                            <div className="font-semibold" style={{ color: getTextColor() }}>
                                                {order.startCount ? order.startCount : order.status === 'completed' ? order.quantity : 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>المتبقي</div>
                                            <div className="font-semibold" style={{ color: getTextColor() }}>
                                                {order.remains ? order.remains : order.status === 'completed' ? 0 : order.quantity}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>الرابط</div>
                                            <div className="text-sm truncate" style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
                                                {order.link || 'لا يوجد رابط'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>الكمية</div>
                                                <div className="font-semibold" style={{ color: getTextColor() }}>
                                                    {(order.quantity || 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>السعر</div>
                                                <div className="text-green-400 font-bold text-lg">
                                                    {formatPrice(order.totalCost || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* أزرار الإجراءات */}
                                    <div className={`flex mt-3 gap-2 ${order.status === 'completed' || order.status === 'Completed' ? '' : 'hidden'
                                        }`}>
                                        <button
                                            onClick={() => openReviewModal(order)}
                                            className={`cursor-pointer hover:opacity-80 transition-all flex-1 ${isDark ? 'text-white bg-[#c9a84c]' : 'text-white bg-[#c9a84c]'
                                                } rounded-lg p-2 text-center font-semibold text-sm`}
                                            style={{ touchAction: 'manipulation' }}
                                        >
                                            تقييم
                                        </button>
                                        <button
                                            onClick={() => { handleRefill(order) }}
                                            disabled={refillingMap[order._id] || false}
                                            className={`${order.serviceId?.refill ? '' : 'hidden'
                                                } ${refillingMap[order._id] ? 'cursor-not-allowed opacity-50' : ''
                                                } cursor-pointer hover:opacity-80 transition-all flex-1 ${isDark ? 'text-white bg-[#60a5fa]' : 'text-white bg-[#60a5fa]'
                                                } rounded-lg p-2 text-center font-semibold text-sm`}
                                            style={{ touchAction: 'manipulation' }}
                                        >
                                            {refillingMap[order._id] ? '...تعويض جاري' : 'تعويض'}
                                        </button>
                                    </div>

                                    {/* ✅ عرض حالة الـ Refill */}
                                    {orderRefillId && (
                                        <div className="mt-3 pt-3 border-t" style={{ borderColor: getBorderColor() }}>
                                            {orderRefillData ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium" style={{ color: getTextColor() }}>
                                                            حالة التعويض:
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderRefillData.status === 'Completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : orderRefillData.status === 'Processing'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : orderRefillData.status === 'Failed'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {orderRefillData.status || 'جاري المعالجة...'}
                                                        </span>
                                                    </div>
                                                    {orderRefillData.remains && (
                                                        <div className="text-sm" style={{ color: getMutedTextColor() }}>
                                                            المتبقي: <span className="font-semibold" style={{ color: getTextColor() }}>{orderRefillData.remains}</span>
                                                        </div>
                                                    )}
                                                    {orderRefillData.start_count && (
                                                        <div className="text-sm" style={{ color: getMutedTextColor() }}>
                                                            عدد البدا: <span className="font-semibold" style={{ color: getTextColor() }}>{orderRefillData.start_count}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleView(order._id, orderRefillId, order)}
                                                    className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-all"
                                                >
                                                    عرض حالة التعويض
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* نافذة التقييم المنبثقة */}
            <ReviewModal
                isDark={isDark}
                showReviewModal={showReviewModal}
                selectedOrder={selectedOrder}
                reviewComment={reviewComment}
                setReviewComment={setReviewComment}
                reviewRating={reviewRating}
                setReviewRating={setReviewRating}
                reviewError={reviewError}
                reviewSuccess={reviewSuccess}
                isSubmittingReview={isSubmittingReview}
                closeReviewModal={closeReviewModal}
                handleSubmitReview={handleSubmitReview}
                renderStars={renderStars}
                getTextColor={getTextColor}
                getMutedTextColor={getMutedTextColor}
            />
        </div>
    );
};

export default OrdersHistory;