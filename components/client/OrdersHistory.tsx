import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../../types';
import axios from 'axios';
import { useThemeStore } from '@/store/theme.store';
import ReviewModal from './ReviewModel';
import { useCurrency } from '@/contexts/CurrencyContext';

const statusClasses: Record<string, string> = {
    'pending': 'bg-yellow-900 text-yellow-300',
    'Pending': 'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'In progress': 'bg-blue-900 text-blue-300',
    'completed': 'bg-green-900 text-green-300',
    'cancelled': 'bg-gray-700 text-gray-300',
    'failed': 'bg-red-900 text-red-300',
};

// تحديث statusClasses للوضع الفاتح
const getStatusClasses = (isDark: boolean) => {
    if (isDark) {
        return {
            'pending': 'bg-yellow-900 text-yellow-300',
            'Pending': 'bg-yellow-900 text-yellow-300',
            'In Progress': 'bg-blue-900 text-blue-300',
            'In progress': 'bg-blue-900 text-blue-300',
            'completed': 'bg-green-900 text-green-300',
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

const allStatuses = ['pending', 'In Progress', 'completed', 'cancelled', 'failed'];

const OrdersHistory = () => {
    const { isDark } = useThemeStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [currentUsername, setCurrentUsername] = useState<string>('');

    // States for review modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [reviewComment, setReviewComment] = useState<string>('');
    const [reviewRating, setReviewRating] = useState(5);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');
    const { formatPrice } = useCurrency()
    // دوال مساعدة للألوان
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
            const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (!userData) return null;
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };
    const handleRefill = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/services-list/refill`,
                {
                    order: selectedOrder?.providerOrderId || '',
                    apiEndpoint: selectedOrder?.provider.apiEndpoint || '',
                    key: selectedOrder?.provider.apiKey || '',
                },);

            if (res.status === 200 || res.status === 201 || res.data) {
                setReviewSuccess('تم إرسال طلب إعادة التعبئة بنجاح! شكراً لك.');
            }

        } catch (error) {
            console.error('Error refilling order:', error);
            setReviewError('حدث خطأ أثناء إرسال طلب إعادة التعبئة. حاول مرة أخرى.');
        }
    }

    // جلب البيانات من السيرفر
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/new-order`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                console.log('API Response:', response.data);

                if (!response.data || !Array.isArray(response.data)) {
                    console.error('Invalid response data:', response.data);
                    setError('بيانات غير صالحة من الخادم');
                    setLoading(false);
                    return;
                }

                const ordersData: any = response.data;

                const sortedOrders = ordersData.sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                console.log('Transformed and sorted orders:', sortedOrders);
                setOrders(sortedOrders);

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
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];

        const filtered = orders
            .filter((order: Order) => {
                if (!order) return false;
                return statusFilter === 'all' || order.status === statusFilter;
            })
            .filter((order: Order) => {
                const orderNumber = order._id?.toString() || '';
                return orderNumber.toLowerCase().includes(searchTerm);
            });

        return filtered.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [orders, searchTerm, statusFilter]);

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
        const statusTexts: Record<string, string> = {
            'pending': 'pending',
            'completed': 'completed',
            'cancelled': 'cancelled',
            'failed': 'failed',
            'In Progress': 'In Progress'
        };

        const statusClassMap = getStatusClasses(isDark);
        const statusClass = statusClassMap[status] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600');
        const statusText = statusTexts[status] || status;

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

            const serviceId = selectedOrder._id || selectedOrder.id;

            const reviewData = {
                userId: user._id || user.id,
                username: user.username || user.name || 'مستخدم',
                serviceId: serviceId,
                rating: reviewRating,
                comment: reviewComment.trim(),
            };

            console.log('Sending review data:', reviewData);

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, reviewData);

            if (res.status === 200 || res.status === 201) {
                setReviewSuccess('تم إرسال التقييم بنجاح! شكراً لك.');
                // إغلاق النافذة بعد 2 ثانية
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
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
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
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                        className={`rounded-md p-3 w-full md:w-48 text-sm md:text-base transition-all duration-300 ${isDark
                            ? 'bg-gray-700 border border-gray-600 text-white'
                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                            }`}
                    >
                        <option value="all">كل الحالات</option>
                        {allStatuses.map(s => (
                            <option key={s} value={s}>
                                {s === 'pending' && 'قيد الانتظار'}
                                {s === 'completed' && 'مكتمل'}
                                {s === 'cancelled' && 'ملغي'}
                                {s === 'failed' && 'فاشل'}
                                {s === 'In Progress' && 'قيد التنفيذ'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm justify-center md:justify-start" style={{ color: getMutedTextColor() }}>
                    <span>الإجمالي: {orderStats.total}</span>
                    <span>المعروض: {filteredOrders.length}</span>
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

            {/* ✅ جدول الطلبات - للشاشات الكبيرة مع زر تقييم */}
            <div className={`hidden md:block rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                        {orders.length === 0 ? 'لا توجد طلبات حالياً' : 'لم يتم العثور على طلبات تطابق البحث'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                            <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                                }`}>
                                <tr>
                                    <th className="px-4 py-3">رقم الطلب</th>
                                    <th className="px-4 py-3">التاريخ</th>
                                    <th className="px-4 py-3">الخدمة</th>
                                    <th className="px-4 py-3">الرابط</th>
                                    <th className="px-4 py-3">الكمية</th>
                                    <th className="px-4 py-3">السعر</th>
                                    <th className="px-4 py-3">الحالة</th>
                                    <th className={`px-4 py-3 text-center `}>
                                        <span className="sr-only">الإجراءات</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order: any) => (
                                    <tr key={order.id} className={`border-b transition-colors ${isDark
                                        ? 'border-gray-700 hover:bg-gray-700/50'
                                        : 'border-[#dfd7bb] hover:bg-gray-50'
                                        }`}>
                                        <td className="px-4 py-4 font-mono text-xs" style={{ color: getMutedTextColor() }}>
                                            {order._id || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap" style={{ color: getMutedTextColor() }}>
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-4" style={{ color: getTextColor() }}>
                                            {order.provider?.title || 'خدمة غير معروفة'}
                                        </td>
                                        <td className="px-4 py-4 font-mono truncate max-w-xs" title={order.link} style={{ color: getMutedTextColor() }}>
                                            {order.link || 'لا يوجد رابط'}
                                        </td>
                                        <td className="px-4 py-4" style={{ color: getTextColor() }}>
                                            {(order.quantity || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-green-400 font-semibold">
                                            {formatPrice(order.price || 0)}
                                        </td>
                                        <td className="px-4 py-4">
                                            {renderStatus(order.status)}
                                        </td>
                                        <td className={`${order.status === 'completed' || order.status === 'Completed' ? '' : 'hidden'} px-4 py-4 flex flex-col gap-y-2 text-center`}>
                                            <button
                                                onClick={() => openReviewModal(order)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isDark
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                    }`}
                                            >
                                                تقييم
                                            </button>
                                            <button
                                                onClick={() => { handleRefill() }}
                                                className={`${order.serviceId?.refill ? '' : 'hidden'} cursor-pointer hover:opacity-80 transition-all flex-1 ${isDark ? 'text-white bg-[#60a5fa]' : 'text-white bg-[#60a5fa]'} rounded-lg p-2 text-center font-semibold text-sm`}
                                                style={{ touchAction: 'manipulation' }}
                                            >
                                                تعويض
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ✅ تصميم البطاقات للهواتف مع زر تقييم */}
            <div className="block md:hidden">
                <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                            {orders.length === 0 ? 'لا توجد طلبات حالياً' : 'لم يتم العثور على طلبات تطابق البحث'}
                        </div>
                    ) : (
                        filteredOrders.map((order: any) => (
                            <div key={order.id} className={`border-b p-4 transition-colors ${isDark
                                ? 'border-gray-700 hover:bg-gray-700/50'
                                : 'border-[#dfd7bb] hover:bg-gray-50'
                                }`}>
                                {/* رأس البطاقة */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div>
                                            <p>رقم الطلب</p>
                                            <div className="font-bold text-lg mb-1" style={{ color: getTextColor() }}>
                                                #{order._id || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="text-sm" style={{ color: getMutedTextColor() }}>
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </div>
                                    <div>
                                        {renderStatus(order.status)}
                                    </div>
                                </div>

                                {/* معلومات الطلب */}
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>الخدمة</div>
                                        <div className="font-semibold" style={{ color: getTextColor() }}>
                                            {order.provider?.title || 'خدمة غير معروفة'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>الرابط</div>
                                        <div className="text-sm break-all" style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
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



                                {/* أزرار الإجراءات في الموبايل */}
                                <div className={`flex mt-3 gap-2 ${order.status === 'completed' || order.status === 'Completed' ? '' : 'hidden'}`}>
                                    <button
                                        onClick={() => openReviewModal(order)}
                                        className={`cursor-pointer hover:opacity-80 transition-all flex-1 ${isDark ? 'text-white bg-[#c9a84c]' : 'text-white bg-[#c9a84c]'} rounded-lg p-2 text-center font-semibold text-sm`}
                                        style={{ touchAction: 'manipulation' }}
                                    >
                                        تقييم
                                    </button>
                                    <button
                                        onClick={() => { handleRefill() }}
                                        className={`${order.serviceId?.refill ? '' : 'hidden'} cursor-pointer hover:opacity-80 transition-all flex-1 ${isDark ? 'text-white bg-[#60a5fa]' : 'text-white bg-[#60a5fa]'} rounded-lg p-2 text-center font-semibold text-sm`}
                                        style={{ touchAction: 'manipulation' }}
                                    >
                                        تعويض
                                    </button>
                                </div>
                            </div>
                        ))
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