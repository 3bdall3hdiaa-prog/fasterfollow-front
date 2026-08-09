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
                credentials: 'include',
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
            <span className={`px-3 py-1 text-sm rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
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
                    body: JSON.stringify({ sender: 'admin', text: replyText }),
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
            <div className="p-4" style={{
                backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
                minHeight: "100vh",
                transition: "all 0.3s ease"
            }}>
                <button
                    onClick={() => setSelectedTicket(null)}
                    className={`py-2 px-4 rounded transition-colors ${isDark
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                >
                    ← العودة إلى التذاكر
                </button>

                <div className={`rounded-lg p-4 mt-4 transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: getTextColor() }}>{selectedTicket.title}</h2>
                    <p className="mb-4" style={{ color: getMutedTextColor() }}>{selectedTicket.description}</p>
                    <div className="mb-4">{getStatusBadge(selectedTicket.status)}</div>

                    <div className={`h-96 overflow-y-auto p-3 rounded-lg space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'
                        }`}>
                        {selectedTicket.messages?.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-lg p-3 rounded-lg ${msg.sender === 'admin'
                                        ? isDark ? 'bg-blue-700 text-white' : 'bg-[#c9a84c] text-white'
                                        : isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <p className={`text-xs opacity-70 mt-1 text-right ${isDark ? '' : 'text-gray-600'
                                        }`}>
                                        {formatDate(msg.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedTicket.status !== 'Closed' && (
                        <div className="mt-4">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={4}
                                placeholder="اكتب ردك هنا..."
                                className={`w-full rounded-md p-2 mb-2 transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white'
                                    : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                    }`}
                            ></textarea>
                            <button
                                onClick={handleSendReply}
                                className={`font-bold py-2 px-6 rounded-lg transition-all duration-300 ${isDark
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

    // ✅ عرض قائمة التذاكر
    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <h1 className="text-3xl font-bold mb-6" style={{ color: getTextColor() }}>تذاكر الدعم الفني</h1>

            <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                    <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                        }`}>
                        <tr>
                            <th className="px-6 py-4">الموضوع</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4">تاريخ الإنشاء</th>
                            <th className="px-6 py-4">آخر تحديث</th>
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
                                <td className="px-6 py-4 font-semibold" style={{ color: getTextColor() }}>
                                    {ticket.title}
                                </td>
                                <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                                <td className="px-6 py-4" style={{ color: getMutedTextColor() }}>{formatDate(ticket.createdAt)}</td>
                                <td className="px-6 py-4" style={{ color: getMutedTextColor() }}>{formatDate(ticket.updatedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tickets.length === 0 && (
                    <div className="p-12 text-center" style={{ color: getMutedTextColor() }}>
                        لا توجد تذاكر حالياً
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTickets;