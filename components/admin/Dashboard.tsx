import React, { useEffect, useState } from 'react';
import StatCard from './StatCard';

const Dashboard: React.FC = () => {
    const [orderlength, setOrderlength] = useState(0);
    const [userslength, setUserslength] = useState(0);
    const [providerslength, setProviderslength] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getdata = async () => {
            try {
                setLoading(true);

                // جلب بيانات الطلبات
                const response = await fetch(`${import.meta.env.VITE_API_URL}/new-order`);
                const data = await response.json();
                setOrderlength(data.length);

                // جلب بيانات المستخدمين
                const response2 = await fetch(`${import.meta.env.VITE_API_URL}/getallusers`);
                const data2 = await response2.json();
                setUserslength(data2.length);

                // جلب بيانات المزودين
                const response3 = await fetch(`${import.meta.env.VITE_API_URL}/manage-providers`);
                const data3 = await response3.json();
                const filteredProviders = data3.filter(provider => provider.status === 'Active');
                setProviderslength(filteredProviders.length);

                // جلب بيانات PayPal وحساب الإيرادات
                const response4 = await fetch(`${import.meta.env.VITE_API_URL}/paypal`);
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
                <div className="text-white text-xl">جاري تحميل البيانات...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">لوحة تحكم المشرف</h1>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="إجمالي الإيرادات"
                    value={formattedRevenue}
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

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white">مرحباً بك في لوحة التحكم</h2>
                <p className="text-gray-400 mt-2">
                    من هنا يمكنك إدارة جميع جوانب متجرك، من المستخدمين والطلبات إلى الخدمات والمزودين.
                    استخدم الشريط الجانبي للتنقل بين الأقسام المختلفة.
                </p>

                {/* عرض تفاصيل الإيرادات */}
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">ملخص الإيرادات</h3>
                    <p className="text-gray-300">
                        إجمالي الإيرادات: <span className="text-green-400 font-bold">{formattedRevenue}</span>
                    </p>
                    <p className="text-gray-300">
                        عدد المعاملات: <span className="text-blue-400">{totalRevenue > 0 ? 'معلومات المعاملات متاحة' : 'لا توجد معاملات'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;