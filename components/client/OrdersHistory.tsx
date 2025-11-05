import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import axios from 'axios';

const statusClasses: Record<string, string> = {
    'pending': 'bg-yellow-900 text-yellow-300',
    'Pending': 'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'In progress': 'bg-blue-900 text-blue-300',
    'completed': 'bg-green-900 text-green-300',
    'cancelled': 'bg-gray-700 text-gray-300',
    'failed': 'bg-red-900 text-red-300',
};

const allStatuses = ['pending', 'In Progress', 'completed', 'cancelled', 'failed'];

const OrdersHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [currentUsername, setCurrentUsername] = useState<string>('');

    // دالة لتحويل status إلى النوع الصحيح
    // const normalizeStatus = (status: string): OrderStatus => {
    //     const statusMap: any = {
    //         'pending': 'pending',
    //         'Pending': 'pending',
    //         'in progress': 'In Progress',
    //         'In progress': 'In Progress',
    //         'In Progress': 'In Progress',
    //         'completed': 'completed',
    //         'cancelled': 'cancelled',
    //         'failed': 'failed'
    //     };

    //     return statusMap[status] || 'pending';
    // };

    // دالة لاستخراج username من التوكن
    const getUsernameFromToken = (): string => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.warn('No token found');
                return '';
            }

            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.error('Invalid token format');
                return '';
            }

            const payload = JSON.parse(atob(tokenParts[1]));
            return payload.username || payload.sub || '';
        } catch (error) {
            console.error('Error decoding token:', error);
            return '';
        }
    };

    // جلب البيانات من السيرفر
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError('');

                const usernameFromToken = getUsernameFromToken();
                setCurrentUsername(usernameFromToken);

                if (!usernameFromToken) {
                    setError('لا يوجد طلبات');
                    setLoading(false);
                    return;
                }

                console.log('Fetching orders for user:', usernameFromToken);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/new-order`);
                console.log('API Response:', response.data);

                if (!response.data || !Array.isArray(response.data)) {
                    console.error('Invalid response data:', response.data);
                    setError('بيانات غير صالحة من الخادم');
                    setLoading(false);
                    return;
                }

                // تحويل البيانات بناءً على الهيكل الحقيقي مع تحويل status
                const ordersData: any = response.data
                    .filter((order: any) => {
                        const matchesUsername = order && order.username === usernameFromToken;
                        console.log(`Order ${order?._id} username: ${order?.username}, matches: ${matchesUsername}`);
                        return matchesUsername;
                    })
                    .map((order: any, index: number) => {
                        console.log('Processing order:', order);

                        // استخدام البيانات الحقيقية من API مع تحويل status
                        return {
                            id: order._id || `ORD${Date.now()}_${index}`,
                            order_number: order.order_number || `ORD${order._id?.substring(0, 8)}` || `ORDER_${index}`,
                            user: {
                                id: order.id_user || order._id,
                                username: order.username || 'user'
                            },
                            service: {
                                id: order.selectedServiceId || 0,
                                title: order.serviceTitle || `${order.quantity} ${order.selectedCategory}`
                            },
                            link: order.link || '',
                            quantity: order.quantity || 0,
                            price: order.totalCost || 0,
                            status: order.status, // تحويل status هنا
                            createdAt: order.createdAt || new Date().toISOString()
                        };
                    });

                console.log('Transformed orders:', ordersData);
                setOrders(ordersData);

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

    // تصفية الطلبات بشكل آمن
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];

        return orders
            .filter((order: Order) => {
                if (!order) return false;
                return statusFilter === 'all' || order.status === statusFilter;
            })
            .filter((order: Order) => {
                const orderNumber = order.order_number?.toString() || '';
                return orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
            });
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
            'pending': 'قيد الانتظار',
            'completed': 'مكتمل',
            'cancelled': 'ملغي',
            'failed': 'فاشل',
            'In Progress': 'قيد التنفيذ'
        };

        const statusClass = statusClasses[status] || 'bg-gray-700 text-gray-300';
        const statusText = statusTexts[status] || status;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                {statusText}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-lg">جاري تحميل الطلبات...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                {error}
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md block mx-auto"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">سجل الطلبات</h1>

            {currentUsername && (
                <div className="bg-blue-900/50 border border-blue-700 text-blue-300 p-3 rounded-lg mb-4">
                    <span className="font-medium">المستخدم الحالي:</span> {currentUsername}
                </div>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="ابحث برقم الطلب فقط..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white w-full"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white w-full md:w-48"
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

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>إجمالي الطلبات: {orderStats.total}</span>
                    <span>المعروض: {filteredOrders.length}</span>
                    <span>قيد الانتظار: {orderStats.pending}</span>
                    <span>مكتمل: {orderStats.completed}</span>
                    <span>قيد التنفيذ: {orderStats.inProgress}</span>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        {orders.length === 0 ? 'لا توجد طلبات حالياً' : 'لم يتم العثور على طلبات تطابق البحث'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3">رقم الطلب</th>
                                    <th className="px-4 py-3">التاريخ</th>
                                    <th className="px-4 py-3">الخدمة</th>
                                    <th className="px-4 py-3">الرابط</th>
                                    <th className="px-4 py-3">الكمية</th>
                                    <th className="px-4 py-3">السعر</th>
                                    <th className="px-4 py-3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-4 py-4 font-mono text-xs">
                                            {order.order_number || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-4 text-white">
                                            {order.service?.title || 'خدمة غير معروفة'}
                                        </td>
                                        <td className="px-4 py-4 font-mono truncate max-w-xs" title={order.link}>
                                            {order.link || 'لا يوجد رابط'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {(order.quantity || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4">
                                            ${(order.price || 0).toFixed(3)}
                                        </td>
                                        <td className="px-4 py-4">
                                            {order.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersHistory;