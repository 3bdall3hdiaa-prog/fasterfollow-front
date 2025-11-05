import React, { useState } from 'react';
import { ServicePackage, Page, BlogPost, Provider, Banner, SiteSettings, Platform } from '../types';
import Sidebar from './admin/Sidebar';
import Dashboard from './admin/Dashboard';
import ManageUsers from './admin/ManageUsers';
import ManageOrders from './admin/ManageOrders';
import ManageServices from './admin/ManageServices';
import ManageProviders from './admin/ManageProviders';
import SupportTickets from './admin/SupportTickets';
import Announcements from './admin/Announcements';
import SiteSettingsComponent from './admin/SiteSettings';
import ManagePages from './admin/ManagePages';
import ManageBlog from './admin/ManageBlog';
import ManageBanners from './admin/ManageBanners';
import ManagePlatforms from './admin/ManagePlatforms';
import ManageCoupons from './admin/ManageCoppons';
import ManagePayments from './admin/MangePayments';
interface AdminPanelProps {
    initialView?: string;
    services: ServicePackage[];
    setServices: React.Dispatch<React.SetStateAction<ServicePackage[]>>;
    pages: Page[];
    setPages: React.Dispatch<React.SetStateAction<Page[]>>;
    posts: BlogPost[];
    setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
    providers: Provider[];
    setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
    banners: Banner[];
    setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
    settings: SiteSettings;
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
    platforms: Platform[];
    setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const [activeView, setActiveView] = useState(props.initialView || 'dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    React.useEffect(() => {
        setActiveView(props.initialView || 'dashboard');
    }, [props.initialView]);

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard />;
            case 'users': return <ManageUsers />;
            case 'orders': return <ManageOrders />;
            case 'services': return <ManageServices services={props.services} setServices={props.setServices} providers={props.providers} platforms={props.platforms} />;
            case 'providers': return <ManageProviders providers={props.providers} setProviders={props.setProviders} />;
            case 'support': return <SupportTickets />;
            case 'announcements': return <Announcements />;
            case 'pages': return <ManagePages pages={props.pages} setPages={props.setPages} />;
            case 'blog': return <ManageBlog posts={props.posts} setPosts={props.setPosts} />;
            case 'banners': return <ManageBanners banners={props.banners} setBanners={props.setBanners} />;
            case 'platforms': return <ManagePlatforms platforms={props.platforms} setPlatforms={props.setPlatforms} />;
            case 'settings': return <SiteSettingsComponent settings={props.settings} setSettings={props.setSettings} />;
            case 'coupons': return <ManageCoupons />;
            case 'payments': return <ManagePayments />;
            default: return <Dashboard />;
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

export default AdminPanel;