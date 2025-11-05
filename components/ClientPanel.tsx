import React, { useState } from 'react';
import { ServicePackage } from '../types';
import Sidebar from './client/Sidebar';
import Dashboard from './client/Dashboard';
import NewOrder from './client/NewOrder';
import OrdersHistory from './client/OrdersHistory';
import AddFunds from './client/AddFunds';
import Support from './client/Support';
import ServicesList from './client/ServicesList';
import Profile from './client/Profile';
import Affiliate from './client/Affiliate';

interface ClientPanelProps {
    services: ServicePackage[];
    initialView?: string;
}

const ClientPanel: React.FC<ClientPanelProps> = ({ services, initialView = 'dashboard' }) => {
    const [activeView, setActiveView] = useState(initialView);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    React.useEffect(() => {
        setActiveView(initialView);
    }, [initialView]);

    // دالة لعرض المكون المناسب بناءً على الحالة
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard setActiveView={setActiveView} />;
            case 'new-order':
                return <NewOrder services={services} />;
            case 'orders-history':
                return <OrdersHistory />;
            case 'add-funds':
                return <AddFunds />;
            case 'support':
                return <Support />;
            case 'services-list':
                return <ServicesList />;
            case 'profile':
                return <Profile />;
            case 'affiliate':
                return <Affiliate />;
            default:
                return <Dashboard setActiveView={setActiveView} />;
        }
    };

    return (
        <div className="pt-20 bg-gray-900 min-h-screen text-gray-300">
            <div className="flex">
                <Sidebar activeView={activeView} setActiveView={setActiveView} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <main className="flex-1 transition-all duration-300 md:mr-64">
                    <div className="p-4 md:p-8">
                        {/* زر القائمة الثابت */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="fixed md:hidden z-50 bottom-6 right-6 p-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg transition-all duration-300 hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientPanel;