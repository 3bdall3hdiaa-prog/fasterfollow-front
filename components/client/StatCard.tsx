import React from 'react';
import { useThemeStore } from '@/store/theme.store';

interface StatCardProps {
    title: string;
    value: string;
    icon: 'wallet' | 'orders' | 'completed' | 'tickets';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    const { isDark } = useThemeStore();

    // تعريف الأيقونات والألوان لكل نوع بطاقة
    const iconConfig = {
        wallet: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
            color: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
        },
        orders: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
            color: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
        },
        completed: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            color: isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
        },
        tickets: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2V5zM5 14a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3z" /></svg>,
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
                    }`}>{title}</p>
                <p className={`text-2xl font-bold mt-1 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                    }`}>{value}</p>
            </div>
        </div>
    );
};

export default StatCard;