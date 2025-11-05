import React from 'react';
import { useUser } from '../../contexts/UserContext';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{ viewName: string, activeView: string, setActiveView: (view: string) => void, closeSidebar: () => void, children: React.ReactNode }> = ({ viewName, activeView, setActiveView, closeSidebar, children }) => {
    return (
        <a
            href={`#/admin/${viewName}`}
            onClick={closeSidebar}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === viewName ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
            {children}
        </a>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, setIsSidebarOpen }) => {
    const { logout } = useUser();

    const closeSidebar = () => {
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const navItems = [
        { view: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
        { view: 'users', label: 'إدارة المستخدمين', icon: '👥' },
        { view: 'orders', label: 'إدارة الطلبات', icon: '🛒' },
        { view: 'services', label: 'إدارة الخدمات', icon: '📦' },
        { view: 'copons', label: 'إدارة الكوبون', icon: '🎁' },
        { view: 'providers', label: 'إدارة المزودين', icon: '🔌' },
        { view: 'payments', label: 'إدارة طرق الدفع ', icon: '💳' },
        { view: 'support', label: 'الدعم الفني', icon: '💬' },
        { view: 'announcements', label: 'الإعلانات', icon: '📢' },
        { view: 'pages', label: 'إدارة الصفحات', icon: '📄' },
        { view: 'blog', label: 'إدارة المدونة', icon: '✍️' },
        { view: 'banners', label: 'إدارة البنرات', icon: '🖼️' },
        { view: 'platforms', label: 'إدارة المنصات', icon: '📱' },
        { view: 'settings', label: 'إعدادات الموقع', icon: '⚙️' },
    ];

    return (
        <>
            <aside className={`fixed top-0 right-0 h-full bg-gray-800 border-l border-gray-700 w-64 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ paddingTop: '5rem' }}>
                <div className="p-4 h-full flex flex-col">
                    <nav className="space-y-2 flex-grow overflow-y-auto">
                        {navItems.map(item => (
                            <NavLink key={item.view} viewName={item.view} activeView={activeView} setActiveView={setActiveView} closeSidebar={closeSidebar}>
                                <span className="ml-3 w-6 text-center">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="mt-auto">
                        <button onClick={logout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-900/50">
                            <span className="ml-3">🚪</span>
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </aside>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>}
        </>
    );
};

export default Sidebar;