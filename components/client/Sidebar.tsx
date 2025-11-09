import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { useEffect, useState } from 'react';


interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

// مكون رابط التنقل القابل لإعادة الاستخدام
const NavLink: React.FC<{ viewName: string, activeView: string, setActiveView: (view: string) => void, closeSidebar: () => void, children: React.ReactNode }> = ({ viewName, activeView, setActiveView, closeSidebar, children }) => {
    const isActive = activeView === viewName;
    return (
        <a
            href={`#/client/${viewName}`}
            onClick={closeSidebar}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
            {children}
        </a>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, setIsSidebarOpen }) => {
    const { user, logout } = useUser();

    // إغلاق الشريط الجانبي تلقائيًا على الشاشات الصغيرة بعد النقر
    const closeSidebar = () => {
        if (window.innerWidth < 768) { // md breakpoint
            setIsSidebarOpen(false);
        }
    };

    const [walletBalance, setWalletBalance] = useState(0);
    useEffect(() => {
        if (user) {
            fetchPaypalPayments();
        }
    }, [user]);

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
    return (
        <>
            {/* الشريط الجانبي */}
            <aside className={`fixed top-0 right-0 h-full bg-gray-800 border-l border-gray-700 w-64 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ paddingTop: '5rem' }}>
                <div className="p-4 h-full flex flex-col">
                    <div className="mb-6 text-center">
                        <h4 className="font-bold text-white">{user?.username}</h4>
                        <p className="text-sm text-primary-400">رصيدك: ${walletBalance.toFixed(2) || "0.00"}</p>
                    </div>
                    <nav className="space-y-2 flex-grow">
                        <NavLink viewName="dashboard" activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            لوحة التحكم
                        </NavLink>
                        <NavLink viewName="new-order" activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            طلب جديد
                        </NavLink>
                        <NavLink viewName="orders-history" activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            سجل الطلبات
                        </NavLink>
                        <NavLink viewName="add-funds" activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            شحن الرصيد
                        </NavLink>
                        <NavLink viewName="services-list" activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            قائمة الخدمات
                        </NavLink>

                        <NavLink viewName="support" activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            الدعم الفني
                        </NavLink>
                        <NavLink viewName="profile" activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            الملف الشخصي
                        </NavLink>
                    </nav>
                    <div className="mt-auto">
                        <button onClick={logout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-900/50">
                            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </aside>
            {/* خلفية معتمة عند فتح الشريط الجانبي على الجوال */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>}
        </>
    );
};

export default Sidebar;