import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

interface TicketMessage {
    sender: string;
    text: string;
    createdAt: string;
}

interface SupportTicket {
    _id: string;
    title: string;
    description: string;
    status: 'Open' | 'Answered' | 'Closed';
    createdAt: string;
    updatedAt: string;
    messages?: TicketMessage[];
}

const SupportTickets: React.FC = () => {
    const { isDark } = useThemeStore();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replyText, setReplyText] = useState('');

    // دوال مساعدة للألوان
    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const getCardBackground = () => {
        return isDark ? '#252a41' : '#ffffff';
    };

    const getCardHeaderBackground = () => {
        return isDark ? '#2f3450' : '#f0ede4';
    };

    const getInputBackground = () => {
        return isDark ? '#1e2235' : '#ffffff';
    };

    const getInputTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getBorderColor = () => {
        return isDark ? '#374151' : '#dfd7bb';
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/technical-support`, {
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setTickets(data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            alert('فشل في جلب بيانات التذاكر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            Open: isDark
                ? 'bg-green-900 text-green-300 border border-green-700'
                : 'bg-green-100 text-green-700 border border-green-200',
            Answered: isDark
                ? 'bg-blue-900 text-blue-300 border border-blue-700'
                : 'bg-blue-100 text-blue-700 border border-blue-200',
            Closed: isDark
                ? 'bg-gray-700 text-gray-300 border border-gray-600'
                : 'bg-gray-200 text-gray-600 border border-gray-300',
        };
        return (
            <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
                {status === 'Open' ? 'مفتوحة' : status === 'Answered' ? 'تم الرد' : 'مغلقة'}
            </span>
        );
    };

    // إرسال رد الأدمن
    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/technical-support/${selectedTicket._id}/reply`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify({ sender: 'admin', text: replyText }), headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('فشل في إرسال الرد');

            const updatedTicket = await response.json();
            setSelectedTicket(updatedTicket);
            setTickets((prev) =>
                prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
            );
            setReplyText('');
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('فشل في إرسال الرد');
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <div style={{ color: getTextColor() }}>جاري تحميل التذاكر...</div>
            </div>
        );

    // ✅ عرض المحادثة عند اختيار تذكرة
    if (selectedTicket) {
        return (
            <div
                className="p-3 sm:p-4 md:p-6 min-h-screen"
                style={{
                    backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
                    transition: "all 0.3s ease"
                }}
            >
                <button
                    onClick={() => setSelectedTicket(null)}
                    className={`py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base ${isDark
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                >
                    ← العودة إلى التذاكر
                </button>

                <div
                    className={`rounded-lg p-3 sm:p-4 md:p-6 mt-3 sm:mt-4 transition-all duration-300 ${isDark
                            ? 'bg-gray-800 border border-gray-700'
                            : 'bg-white border border-[#dfd7bb] shadow-md'
                        }`}
                >
                    <h2
                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words"
                        style={{ color: getTextColor() }}
                    >
                        {selectedTicket.title}
                    </h2>
                    <p
                        className="mb-3 sm:mb-4 text-sm sm:text-base break-words"
                        style={{ color: getMutedTextColor() }}
                    >
                        {selectedTicket.description}
                    </p>
                    <div className="mb-3 sm:mb-4">{getStatusBadge(selectedTicket.status)}</div>

                    <div
                        className={`h-64 sm:h-80 md:h-96 overflow-y-auto p-2 sm:p-3 rounded-lg space-y-3 sm:space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
                            }`}
                    >
                        {selectedTicket.messages?.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[75%] md:max-w-lg p-2 sm:p-3 rounded-lg ${msg.sender === 'admin'
                                            ? isDark ? 'bg-blue-700 text-white' : 'bg-[#c9a84c] text-white'
                                            : isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p className="text-sm sm:text-base break-words">{msg.text}</p>
                                    <p
                                        className={`text-[10px] sm:text-xs opacity-70 mt-1 text-right ${isDark ? '' : 'text-gray-600'
                                            }`}
                                    >
                                        {formatDate(msg.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedTicket.status !== 'Closed' && (
                        <div className="mt-3 sm:mt-4">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                                placeholder="اكتب ردك هنا..."
                                className={`w-full rounded-md p-2 sm:p-3 mb-2 transition-all duration-300 text-sm sm:text-base ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                            />
                            <button
                                onClick={handleSendReply}
                                className={`w-full sm:w-auto font-bold py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 text-sm sm:text-base ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                إرسال الرد
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ✅ عرض قائمة التذاكر - نسخة متجاوبة
    return (
        <div
            className="p-3 sm:p-4 md:p-6 min-h-screen"
            style={{
                backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
                transition: "all 0.3s ease"
            }}
        >
            <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
                style={{ color: getTextColor() }}
            >
                تذاكر الدعم الفني
            </h1>

            {/* نسخة الجوال - بطاقات */}
            <div className="block lg:hidden space-y-3 sm:space-y-4">
                {tickets.map((ticket) => (
                    <div
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-300 ${isDark
                                ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700/50'
                                : 'bg-white border border-[#dfd7bb] shadow-sm hover:shadow-md'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3
                                className="text-sm sm:text-base font-semibold flex-1 mr-2 break-words"
                                style={{ color: getTextColor() }}
                            >
                                {ticket.title}
                            </h3>
                            {getStatusBadge(ticket.status)}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm" style={{ color: getMutedTextColor() }}>
                            <span>📅 {formatDate(ticket.createdAt)}</span>
                            <span>•</span>
                            <span>🔄 {formatDate(ticket.updatedAt)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* نسخة الكمبيوتر اللوحي والكمبيوتر - جدول */}
            <div className="hidden lg:block">
                <div
                    className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                            ? 'bg-gray-800 border border-gray-700'
                            : 'bg-white border border-[#dfd7bb] shadow-md'
                        }`}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ color: getTextColor() }}>
                            <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                                }`}>
                                <tr>
                                    <th className="px-4 py-3 text-right">الموضوع</th>
                                    <th className="px-4 py-3 text-right">الحالة</th>
                                    <th className="px-4 py-3 text-right hidden md:table-cell">تاريخ الإنشاء</th>
                                    <th className="px-4 py-3 text-right hidden lg:table-cell">آخر تحديث</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket._id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`border-b cursor-pointer transition-colors ${isDark
                                                ? 'border-gray-700 hover:bg-gray-700/30'
                                                : 'border-[#dfd7bb] hover:bg-gray-50'
                                            }`}
                                    >
                                        <td
                                            className="px-4 py-3 font-semibold max-w-[150px] md:max-w-[200px] truncate"
                                            style={{ color: getTextColor() }}
                                        >
                                            {ticket.title}
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                                        <td className="px-4 py-3 hidden md:table-cell" style={{ color: getMutedTextColor() }}>
                                            {formatDate(ticket.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell" style={{ color: getMutedTextColor() }}>
                                            {formatDate(ticket.updatedAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {tickets.length === 0 && (
                <div className="p-8 sm:p-12 text-center" style={{ color: getMutedTextColor() }}>
                    لا توجد تذاكر حالياً
                </div>
            )}
        </div>
    );
};

export default SupportTickets;