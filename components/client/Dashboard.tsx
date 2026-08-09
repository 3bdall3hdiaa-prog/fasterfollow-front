import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import StatCard from './StatCard';
import { Order } from '../../types';
import { useThemeStore } from '@/store/theme.store';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuthStore } from '@/store/auth.store';

const statusClasses: any = {
    'Pending': 'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'Completed': 'bg-green-900 text-green-300',
    'completed': 'bg-green-900 text-green-300',
    'Cancelled': 'bg-gray-700 text-gray-300',
    'Failed': 'bg-red-900 text-red-300',
};

// تحديث statusClasses للوضع الفاتح
const getStatusClasses = (isDark: boolean) => {
    if (isDark) {
        return {
            'Pending': 'bg-yellow-900 text-yellow-300',
            'In Progress': 'bg-blue-900 text-blue-300',
            'Completed': 'bg-green-900 text-green-300',
            'completed': 'bg-green-900 text-green-300',
            'Cancelled': 'bg-gray-700 text-gray-300',
            'Failed': 'bg-red-900 text-red-300',
        };
    } else {
        return {
            'Pending': 'bg-yellow-100 text-yellow-700',
            'In Progress': 'bg-blue-100 text-blue-700',
            'Completed': 'bg-green-100 text-green-700',
            'completed': 'bg-green-100 text-green-700',
            'Cancelled': 'bg-gray-200 text-gray-600',
            'Failed': 'bg-red-100 text-red-700',
        };
    }
};

interface DashboardProps {
    setActiveView: (view: string) => void;
}

interface PayPalTransaction {
    id: string;
    username: string;
    amount: number;
    status: string;
    createdAt: string;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
    const { user } = useAuthStore();
    const { isDark } = useThemeStore();
    const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderlength, setOrderlength] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
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

    useEffect(() => {
        if (user) {
            fetchCompletedOrders();
            fetchPaypalPayments();
        }
    }, [user]);

    useEffect(() => {
        if (user && walletBalance > 0) {
            balance_users();
        }
    }, [walletBalance, user]);

    const fetchPaypalPayments = async () => {
        try {
            console.log('جاري جلب بيانات PayPal للمستخدم:', user?.username);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/paypal`, {
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('خطأ أثناء جلب بيانات PayPal');
            const payments = await res.json();

            console.log('بيانات PayPal المستلمة:', payments);

            if (!Array.isArray(payments)) {
                console.log('البيانات ليست مصفوفة');
                return;
            }

            const userPayments = payments.filter(
                (p: any) => p.userName === user?.username
            );

            console.log('عمليات المستخدم المفلترة:', userPayments);

            const totalBalance = userPayments.reduce(
                (sum: number, p: any) => sum + parseFloat(p.amount || 0),
                0
            );

            console.log('إجمالي الرصيد المحسوب:', totalBalance);
            setWalletBalance(totalBalance);

        } catch (err) {
            console.error('PayPal Fetch Error:', err);
        }
    };

    const fetchCompletedOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/new-order`, {
                method: 'GET',
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`خطأ في السيرفر: ${response.status}`);
            }

            const ordersData = await response.json();

            if (!ordersData || !Array.isArray(ordersData)) {
                throw new Error('البيانات غير صالحة');
            }

            console.log('البيانات المستلمة:', ordersData);
            setOrderlength(ordersData.length);
            const username = user.username
            const completed = ordersData.filter((order: any) => {
                return (
                    order && order.status === 'Completed' && order.username === username || order.status === 'completed' && order.username === username
                )
            })
            setCompletedOrders(completed);

        } catch (error) {
            console.error('Error fetching orders data:', error);
            setError('فشل في جلب البيانات من السيرفر');
        } finally {
            setLoading(false);
        }
    };

    const balance_users = async () => {
        try {
            console.log('جاري تحديث الرصيد في السيرفر:', walletBalance);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/balance-users`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    username: user?.username,
                    balance: walletBalance
                }), headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();
            console.log("نتيجة تحديث الرصيد:", result)
        } catch (error) {
            console.error("خطأ في تحديث الرصيد:", error);
        }
    }

    console.log('قيمة walletBalance الحالية:', walletBalance);

    if (!user) {
        return <div style={{ color: getTextColor() }}>جاري التحميل...</div>;
    }

    if (loading) {
        return <div style={{ color: getTextColor() }}>جاري تحميل البيانات...</div>;
    }

    if (error) {
        return (
            <div className="text-red-400">
                <p>{error}</p>
                <button
                    onClick={fetchCompletedOrders}
                    className={`mt-4 px-4 py-2 rounded transition-colors ${isDark
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white'
                        }`}
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    const statusClassesMap = getStatusClasses(isDark);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: getTextColor() }}>
                مرحباً بعودتك، {user.username}!
            </h1>
            <p className="mb-8" style={{ color: getMutedTextColor() }}>
                إليك نظرة سريعة على حسابك.
            </p>

            {/* إجراءات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <QuickActionButton
                    onClick={() => window.location.href = '#/'}
                    icon="🏠"
                    text="الرئيسية"
                    isDark={isDark}
                />
                <QuickActionButton
                    onClick={() => setActiveView('add-funds')}
                    icon="💰"
                    text="شحن الرصيد"
                    isDark={isDark}
                />
                <QuickActionButton
                    onClick={() => setActiveView('support')}
                    icon="💬"
                    text="الدعم الفني"
                    isDark={isDark}
                />
                <QuickActionButton
                    onClick={() => setActiveView('orders-history')}
                    icon="📋"
                    text="طلباتي"
                    isDark={isDark}
                />
            </div>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="رصيد المحفظة"
                    value={`${formatPrice(walletBalance)}`}
                    icon="wallet"
                />
                <StatCard title="إجمالي الطلبات" value={orderlength.toString()} icon="orders" />
                <StatCard title="الطلبات المكتملة" value={completedOrders.length.toString()} icon="completed" />
                <StatCard title="تذاكر الدعم" value="1" icon="tickets" />
            </div>

            {/* الطلبات الأخيرة */}
            <div className={`rounded-lg transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <h2 className={`text-xl font-semibold p-4 border-b transition-colors duration-300 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-[#dfd7bb]'
                    }`}>
                    آخر الطلبات
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                        <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                            }`}>
                            <tr>
                                <th className="px-4 py-3">رقم الطلب</th>
                                <th className="px-4 py-3">الخدمة</th>
                                <th className="px-4 py-3">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedOrders.length > 0 ? (
                                completedOrders.slice(0, 3).map((order: any) => (
                                    <tr key={order.id} className={`border-b last:border-b-0 transition-colors ${isDark
                                        ? 'border-gray-700 hover:bg-gray-700/50'
                                        : 'border-[#dfd7bb] hover:bg-gray-50'
                                        }`}>
                                        <td className="px-4 py-4 font-mono" style={{ color: getMutedTextColor() }}>
                                            {order.order_number || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4" style={{ color: getTextColor() }}>
                                            {order.serviceTitle || 'اسم الخدمة غير متوفر'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${order.status || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
                                                }`}>
                                                {order.status || 'غير معروف'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center" style={{ color: getMutedTextColor() }}>
                                        لا توجد طلبات مكتملة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className={`p-4 border-t text-center transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                    }`}>
                    <button
                        onClick={() => setActiveView('orders-history')}
                        className={`text-sm font-semibold transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-[#c9a84c] hover:text-[#b8973a]'
                            }`}
                    >
                        عرض كل الطلبات
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuickActionButton: React.FC<{ onClick: () => void, icon: string, text: string, isDark: boolean }> = ({ onClick, icon, text, isDark }) => (
    <button
        onClick={onClick}
        className={`rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-300 ${isDark
            ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-primary-500'
            : 'bg-white hover:bg-gray-50 border border-[#dfd7bb] hover:border-[#c9a84c] shadow-sm hover:shadow-md'
            }`}
    >
        <span className="text-3xl mb-2">{icon}</span>
        <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
            }`}>{text}</span>
    </button>
);

export default Dashboard;