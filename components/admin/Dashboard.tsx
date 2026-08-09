import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { useThemeStore } from '@/store/theme.store';
import { useCurrency } from '@/contexts/CurrencyContext';

const Dashboard: React.FC = () => {
    const [orderlength, setOrderlength] = useState(0);
    const [userslength, setUserslength] = useState(0);
    const [providerslength, setProviderslength] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const { isDark } = useThemeStore();
    const { formatPrice } = useCurrency();
    useEffect(() => {
        const getdata = async () => {
            try {
                setLoading(true);

                // جلب بيانات الطلبات
                const response = await fetch(`${import.meta.env.VITE_API_URL}/new-order`, {
                    credentials: 'include',
                });
                const data = await response.json();
                setOrderlength(data.length);

                // جلب بيانات المستخدمين
                const response2 = await fetch(`${import.meta.env.VITE_API_URL}/getallusers`, {
                    credentials: 'include',
                });
                const data2 = await response2.json();
                setUserslength(data2.length);

                // جلب بيانات المزودين
                const response3 = await fetch(`${import.meta.env.VITE_API_URL}/manage-providers`, {

                    credentials: 'include',
                });
                const data3 = await response3.json();
                const filteredProviders = data3.filter(provider => provider.status === 'Active');
                setProviderslength(filteredProviders.length);

                // جلب بيانات PayPal وحساب الإيرادات
                const response4 = await fetch(`${import.meta.env.VITE_API_URL}/paypal`, {
                    credentials: 'include'
                });
                const paypalData = await response4.json();

                // جمع جميع قيم amount
                const revenue = paypalData.reduce((total: number, item: any) => {
                    // تحقق من وجود amount وتحويله إلى رقم
                    const amount = parseFloat(item.amount) || 0;
                    return total + amount;
                }, 0);

                setTotalRevenue(revenue);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        getdata();
    }, []);

    // تنسيق الإيرادات كعملة
    const formattedRevenue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(totalRevenue);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    جاري تحميل البيانات...
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className={`text-3xl font-bold mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                }`}>
                لوحة تحكم المشرف
            </h1>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="إجمالي الإيرادات"
                    value={formatPrice(totalRevenue)}
                    icon="revenue"
                />
                <StatCard
                    title="إجمالي المستخدمين"
                    value={userslength.toString()}
                    icon="users"
                />
                <StatCard
                    title="إجمالي الطلبات"
                    value={orderlength.toString()}
                    icon="orders"
                />
                <StatCard
                    title="مزودين نشطين"
                    value={providerslength.toString()}
                    icon="providers"
                />
            </div>

            <div className={`rounded-lg p-6 transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <h2 className={`text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    مرحباً بك في لوحة التحكم
                </h2>
                <p className={`mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    من هنا يمكنك إدارة جميع جوانب متجرك، من المستخدمين والطلبات إلى الخدمات والمزودين.
                    استخدم الشريط الجانبي للتنقل بين الأقسام المختلفة.
                </p>

                {/* عرض تفاصيل الإيرادات */}
                <div className={`mt-4 p-4 rounded-lg transition-all duration-300 ${isDark ? 'bg-gray-700' : 'bg-[#faf8f2] border border-[#dfd7bb]'
                    }`}>
                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        ملخص الإيرادات
                    </h3>
                    <p className={`transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        إجمالي الإيرادات: <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'
                            }`}>{formatPrice(totalRevenue)}</span>
                    </p>
                    <p className={`transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        عدد المعاملات: <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'
                            }`}>{totalRevenue > 0 ? 'معلومات المعاملات متاحة' : 'لا توجد معاملات'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;