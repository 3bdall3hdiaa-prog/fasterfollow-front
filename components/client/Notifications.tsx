import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';

// بيانات وهمية للإشعارات (كاحتياطي)


const Notifications: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isDark } = useThemeStore();
    const { user }: any = useAuthStore();
    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    // جلب البيانات من الـ API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/notification`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`خطأ في جلب البيانات: ${response.status}`);
            }

            const allNotifications: any = await response.json();

            // الحصول على userName من localStorage أو أي مكان آخر
            const username = user.username;
            // فلترة الإشعارات حسب userName
            const userNotifications = allNotifications.filter(
                (notification: any) => notification.userName === username
            );

            setNotifications(userNotifications);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('فشل في جلب الإشعارات');
            // استخدام البيانات الوهمية في حالة الخطأ
            setNotifications([
                { id: 1, text: 'هذا إشعار وهمي 1', isRead: false, createdAt: '2023-10-01' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // جلب البيانات عند فتح القائمة
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (id: any) => {
        try {
            // تحديث حالة القراءة محلياً
            setNotifications(
                notifications.map((n: any) => n.id === id ? { ...n, isRead: true } : n)
            );

            // إرسال تحديث إلى السيرفر (اختياري)
            await fetch(`${import.meta.env.VITE_API_URL}/notification/${id}`, {
                method: 'PUT',
                credentials: 'include',

            });
        } catch (err) {
            console.error('Error updating notification:', err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className={`relative transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-[#c9a84c]'
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute top-full mt-2 left-0 w-80 rounded-lg shadow-lg border z-10 transition-colors duration-300 ${isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-[#dfd7bb] shadow-xl'
                    }`}>
                    <div className={`p-3 font-bold border-b flex justify-between items-center transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                        }`}>
                        <span className={isDark ? 'text-white' : 'text-gray-800'}>
                            الإشعارات
                        </span>
                        <button
                            onClick={fetchNotifications}
                            className={`text-xs transition-colors duration-300 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#c9a84c]'
                                }`}
                            disabled={loading}
                        >
                            {loading ? 'جاري التحديث...' : 'تحديث'}
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading && (
                            <div className={`p-3 text-center transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                جاري تحميل الإشعارات...
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-center text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className={`p-3 text-center transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                لا توجد إشعارات
                            </div>
                        )}

                        {notifications.map((notification: any) => (
                            <div
                                key={notification.id || notification._id}
                                onClick={() => handleMarkAsRead(notification._id || notification.id)}
                                className={`p-3 border-b last:border-0 cursor-pointer transition-colors duration-300 ${isDark
                                    ? `border-gray-700 hover:bg-gray-700 ${!notification.isRead ? 'bg-primary-900/30' : ''}`
                                    : `border-[#dfd7bb] hover:bg-gray-50 ${!notification.isRead ? 'bg-amber-50' : ''}`
                                    }`}
                            >
                                <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                    {notification.text}
                                </p>
                                <p className={`text-xs mt-1 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-400'
                                    }`}>
                                    {notification.createdAt}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;