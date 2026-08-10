import React, { useState } from 'react';
import { ServiceResponse } from '../types';
import Sidebar from './client/Sidebar';
import Dashboard from './client/Dashboard';
import NewOrder from './client/NewOrder';
import OrdersHistory from './client/OrdersHistory';
import AddFunds from './client/AddFunds';
import Support from './client/Support';
import ServicesList from './client/ServicesList';
import Profile from './client/Profile';
import { useThemeStore } from '@/store/theme.store';

interface ClientPanelProps {
    services: ServiceResponse[];
    initialView?: string;
}

const ClientPanel: React.FC<ClientPanelProps> = ({ services, initialView = 'dashboard' }) => {
    const [activeView, setActiveView] = useState(initialView);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isDark } = useThemeStore();

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

            default:
                return <Dashboard setActiveView={setActiveView} />;
        }
    };

    return (
        <div className={`pt-16 min-h-screen transition-colors duration-300 ${isDark
            ? 'bg-gray-900 text-gray-300'
            : ' text-gray-800'
            }`}>
            <div className="flex">
                <Sidebar activeView={activeView} setActiveView={setActiveView} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <main className="flex-1 transition-all duration-300 md:mr-64">
                    <div className="  md:p-8">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ClientPanel;