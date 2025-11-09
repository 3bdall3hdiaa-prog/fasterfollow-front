import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import StatCard from './StatCard';
import { Order, OrderStatus } from '../../types';

const statusClasses: any = {
    'Pending': 'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'Completed': 'bg-green-900 text-green-300',
    'completed': 'bg-green-900 text-green-300',
    'Cancelled': 'bg-gray-700 text-gray-300',
    'Failed': 'bg-red-900 text-red-300',
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
    const { user } = useUser();
    const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderlength, setOrderlength] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);

    useEffect(() => {
        if (user) {
            fetchCompletedOrders();
            fetchPaypalPayments();
        }
    }, [user]);

    // useEffect منفصل علشان يتنفذ لما walletBalance تتغير
    useEffect(() => {
        if (user && walletBalance > 0) {
            balance_users();
        }
    }, [walletBalance, user]);

    const fetchPaypalPayments = async () => {
        try {
            console.log('جاري جلب بيانات PayPal للمستخدم:', user?.username);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/paypal`);
            if (!res.ok) throw new Error('خطأ أثناء جلب بيانات PayPal');
            const payments = await res.json();

            console.log('بيانات PayPal المستلمة:', payments);

            if (!Array.isArray(payments)) {
                console.log('البيانات ليست مصفوفة');
                return;
            }

            // 🔸 فلترة العمليات الخاصة بالمستخدم الحالي والمكتملة فقط
            const userPayments = payments.filter(
                (p: any) => p.userName === user?.username
            );

            console.log('عمليات المستخدم المفلترة:', userPayments);

            // 🔸 جمع كل قيم الـ amount
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

            // جلب الطلبات من الاند بوينت
            const response = await fetch(`${import.meta.env.VITE_API_URL}/new-order`);

            if (!response.ok) {
                throw new Error(`خطأ في السيرفر: ${response.status}`);
            }

            const ordersData = await response.json();

            // تأكد إن البيانات موجودة وليست undefined
            if (!ordersData || !Array.isArray(ordersData)) {
                throw new Error('البيانات غير صالحة');
            }

            console.log('البيانات المستلمة:', ordersData);
            setOrderlength(ordersData.length);

            // فلترة الطلبات المكتملة فقط
            const completed = ordersData.filter((order: Order) =>
                order && order.status === 'Completed' || order.status === 'completed'
            );
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user?.username,
                    balance: walletBalance
                }),
            });

            const result = await response.json();
            console.log("نتيجة تحديث الرصيد:", result)
        } catch (error) {
            console.error("خطأ في تحديث الرصيد:", error);
        }
    }

    // أضف console.log علشان تشوف القيمة
    console.log('قيمة walletBalance الحالية:', walletBalance);

    if (!user) {
        return <div className="text-white">جاري التحميل...</div>;
    }

    if (loading) {
        return <div className="text-white">جاري تحميل البيانات...</div>;
    }

    if (error) {
        return (
            <div className="text-red-400">
                <p>{error}</p>
                <button
                    onClick={fetchCompletedOrders}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">مرحباً بعودتك، {user.username}!</h1>
            <p className="text-gray-400 mb-8">إليك نظرة سريعة على حسابك.</p>

            {/* إجراءات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <QuickActionButton onClick={() => setActiveView('new-order')} icon="➕" text="طلب جديد" />
                <QuickActionButton onClick={() => setActiveView('add-funds')} icon="💰" text="شحن الرصيد" />
                <QuickActionButton onClick={() => setActiveView('support')} icon="💬" text="الدعم الفني" />
                <QuickActionButton onClick={() => setActiveView('orders-history')} icon="📋" text="طلباتي" />
            </div>
            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="رصيد المحفظة"
                    value={`$${walletBalance.toFixed(2)}`}
                    icon="wallet"
                />
                <StatCard title="إجمالي الطلبات" value={orderlength.toString()} icon="orders" />
                <StatCard title="الطلبات المكتملة" value={completedOrders.length.toString()} icon="completed" />
                <StatCard title="تذاكر الدعم" value="1" icon="tickets" />
            </div>


            {/* الطلبات الأخيرة */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-white p-4 border-b border-gray-700">آخر الطلبات</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3">رقم الطلب</th>
                                <th className="px-4 py-3">الخدمة</th>
                                <th className="px-4 py-3">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedOrders.length > 0 ? (
                                completedOrders.slice(0, 3).map(order => (
                                    <tr key={order.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                                        <td className="px-4 py-4 font-mono">{order.order_number || 'N/A'}</td>
                                        <td className="px-4 py-4 text-white">
                                            {order.serviceTitle || 'اسم الخدمة غير متوفر'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[order.status] || 'bg-gray-700 text-gray-300'}`}>
                                                {order.status || 'غير معروف'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                        لا توجد طلبات مكتملة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-700 text-center">
                    <button onClick={() => setActiveView('orders-history')} className="text-sm font-semibold text-primary-400 hover:text-primary-300">
                        عرض كل الطلبات
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuickActionButton: React.FC<{ onClick: () => void, icon: string, text: string }> = ({ onClick, icon, text }) => (
    <button onClick={onClick} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-primary-500 rounded-lg p-4 flex flex-col items-center justify-center transition-colors">
        <span className="text-3xl mb-2">{icon}</span>
        <span className="text-sm font-semibold text-white">{text}</span>
    </button>
);

export default Dashboard;