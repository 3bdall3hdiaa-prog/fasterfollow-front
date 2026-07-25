import React from 'react';
import { useThemeStore } from '@/store/theme.store';

interface StatCardProps {
    title: string;
    value: string;
    icon: 'revenue' | 'users' | 'orders' | 'providers';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    const { isDark } = useThemeStore();

    const iconConfig = {
        revenue: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
            color: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
        },
        users: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>,
            color: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
        },
        orders: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
            color: isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
        },
        providers: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2m0 2c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2m0 6c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            color: isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
        },
    };

    return (
        <div className={`rounded-lg p-5 flex items-center space-x-4 space-x-reverse transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md hover:shadow-lg'
            }`}>
            <div className={`p-3 rounded-full transition-colors duration-300 ${iconConfig[icon].color}`}>
                {iconConfig[icon].icon}
            </div>
            <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {title}
                </p>
                <p className={`text-2xl font-bold mt-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default StatCard;