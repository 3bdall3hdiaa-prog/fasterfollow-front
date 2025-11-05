import React, { useState, useEffect } from 'react';
import { Notification } from '../../types';

// بيانات وهمية للإشعارات (كاحتياطي)
const mockNotifications: Notification[] = [
    { id: 1, text: '🎉 تم إكمال طلبك #ORD1004 بنجاح.', isRead: false, createdAt: 'قبل 5 دقائق' },
    { id: 2, text: '💰 تم إضافة 50$ إلى رصيدك بنجاح.', isRead: true, createdAt: 'قبل ساعة' },
    { id: 3, text: '⚠️ تم إلغاء طلبك #ORD1002.', isRead: true, createdAt: 'أمس' },
];

const Notifications: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // جلب البيانات من الـ API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/notification`);

            if (!response.ok) {
                throw new Error(`خطأ في جلب البيانات: ${response.status}`);
            }

            const allNotifications: any = await response.json();

            // الحصول على userName من localStorage أو أي مكان آخر
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const username = user.username;
            // فلترة الإشعارات حسب userName
            const userNotifications = allNotifications.filter(
                notification => notification.userName === username
            );

            setNotifications(userNotifications);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('فشل في جلب الإشعارات');
            // استخدام البيانات الوهمية في حالة الخطأ
            setNotifications(mockNotifications);
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
                notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
            );

            // إرسال تحديث إلى السيرفر (اختياري)
            await fetch(`${import.meta.env.VITE_API_URL}/notification/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },

            });
        } catch (err) {
            console.error('Error updating notification:', err);
        }
    };

    // تحديث نوع Notification ليشمل userName
    // أضف هذا في ملف types.ts
    /*
    export interface Notification {
        id: number;
        text: string;
        isRead: boolean;
        createdAt: string;
        userName?: string; // إضافة هذا الحقل
    }
    */

    return (
        <div className="relative">
            <button onClick={handleToggle} className="relative text-gray-300 hover:text-white">
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
                <div className="absolute top-full mt-2 left-0 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                    <div className="p-3 font-bold border-b border-gray-700 flex justify-between items-center">
                        <span>الإشعارات</span>
                        <button
                            onClick={fetchNotifications}
                            className="text-xs text-gray-400 hover:text-white"
                            disabled={loading}
                        >
                            {loading ? 'جاري التحديث...' : 'تحديث'}
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading && (
                            <div className="p-3 text-center text-gray-400">
                                جاري تحميل الإشعارات...
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-center text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="p-3 text-center text-gray-400">
                                لا توجد إشعارات
                            </div>
                        )}

                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleMarkAsRead(notification._id)}
                                className={`p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 cursor-pointer ${!notification.isRead ? 'bg-primary-900/30' : ''
                                    }`}
                            >
                                <p className="text-sm text-gray-200">{notification.text}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.createdAt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;