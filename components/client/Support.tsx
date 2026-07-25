import React, { useState, useEffect } from 'react';
import { SupportTicket, TicketStatus, TicketMessage } from '../../types';
import { useThemeStore } from '@/store/theme.store';

// عنوان الـ API
const API_BASE_URL = import.meta.env.VITE_API_URL;
const TICKETS_ENDPOINT = `${API_BASE_URL}/technical-support`;

const statusClasses: Record<TicketStatus, string> = {
    Open: 'bg-green-900 text-green-300',
    Answered: 'bg-blue-900 text-blue-300',
    Closed: 'bg-gray-700 text-gray-300',
};

// تحديث statusClasses للوضع الفاتح
const getStatusClasses = (isDark: boolean) => {
    if (isDark) {
        return {
            Open: 'bg-green-900 text-green-300',
            Answered: 'bg-blue-900 text-blue-300',
            Closed: 'bg-gray-700 text-gray-300',
        };
    } else {
        return {
            Open: 'bg-green-100 text-green-700',
            Answered: 'bg-blue-100 text-blue-700',
            Closed: 'bg-gray-200 text-gray-600',
        };
    }
};

const Support: React.FC = () => {
    const { isDark } = useThemeStore();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [newTicketData, setNewTicketData] = useState({ subject: '', message: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const getInputBackground = () => {
        return isDark ? '#1e2235' : '#ffffff';
    };

    const getInputTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getBorderColor = () => {
        return isDark ? '#374151' : '#dfd7bb';
    };

    // جلب التذاكر من الـ API
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                const response = await fetch(TICKETS_ENDPOINT);
                if (!response.ok) throw new Error(`خطأ في جلب البيانات: ${response.status}`);

                const data = await response.json();

                const formattedTickets: SupportTicket[] = data.map((ticket: any) => ({
                    id: ticket._id,
                    user: { username: ticket.username || 'me' },
                    subject: ticket.title,
                    status: ticket.status as TicketStatus,
                    createdAt: new Date(ticket.createdAt).toISOString().split('T')[0],
                    lastUpdate: new Date(ticket.updatedAt).toISOString().split('T')[0],
                    messages: ticket.messages || [
                        {
                            sender: 'user',
                            text: ticket.description,
                            time: ticket.createdAt,
                        },
                    ],
                }));

                const currentUser = JSON.parse(localStorage.getItem('user') || '{}').username;
                const filtered = formattedTickets.filter(
                    (ticket) => ticket.user.username === currentUser
                );

                setTickets(filtered);
                setError(null);
            } catch (err) {
                console.error('Error fetching tickets:', err);
                setError('فشل في جلب بيانات التذاكر. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const handleOpenNewTicketModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            const newTicketDataToSend = {
                title: newTicketData.subject,
                description: newTicketData.message,
                status: 'Open',
                username: user?.username,
            };

            const response = await fetch(TICKETS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicketDataToSend),
            });

            if (!response.ok) throw new Error('فشل في إنشاء التذكرة');
            const createdTicket = await response.json();

            const newTicket: SupportTicket = {
                id: createdTicket._id,
                user: { username: user?.username || 'me' },
                subject: createdTicket.title,
                status: createdTicket.status as TicketStatus,
                createdAt: new Date(createdTicket.createdAt).toISOString().split('T')[0],
                lastUpdate: new Date(createdTicket.updatedAt).toISOString().split('T')[0],
                messages: [
                    {
                        sender: 'user',
                        text: createdTicket.description,
                        time: createdTicket.createdAt,
                    },
                ],
            };

            setTickets([newTicket, ...tickets]);
            setNewTicketData({ subject: '', message: '' });
            handleCloseModal();
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError('فشل في إنشاء التذكرة. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        try {
            const newMessage: TicketMessage = {
                sender: 'user',
                text: replyText,
                time: new Date().toISOString(),
            };

            const updatedTicket = {
                ...selectedTicket,
                messages: [...(selectedTicket.messages || []), newMessage],
                status: 'Open' as TicketStatus,
                lastUpdate: new Date().toISOString().split('T')[0],
            };

            setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)));
            setSelectedTicket(updatedTicket);
            setReplyText('');

            await fetch(`${TICKETS_ENDPOINT}/${selectedTicket.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });
        } catch (err) {
            console.error('Error sending reply:', err);
            setError('فشل في إرسال الرد. يرجى المحاولة مرة أخرى.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div style={{ color: getTextColor() }}>جاري تحميل التذاكر...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 rounded-lg ${isDark
                ? 'bg-red-900 text-red-200'
                : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className={`mt-2 py-1 px-3 rounded transition-colors ${isDark
                        ? 'bg-red-700 hover:bg-red-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    const statusClassesMap = getStatusClasses(isDark);

    // ✅ عرض المحادثة داخل التذكرة
    if (selectedTicket) {
        return (
            <div className="p-4" style={{
                backgroundColor: isDark ? 'bg-gray-900/80' : '#f8f6f0',
                minHeight: "100vh",
                transition: "all 0.3s ease"
            }}>
                <button
                    onClick={() => setSelectedTicket(null)}
                    className={`flex items-center space-x-2 space-x-reverse text-sm mb-4 transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-[#c9a84c] hover:text-[#b8973a]'
                        }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>العودة إلى قائمة التذاكر</span>
                </button>

                <div className={`rounded-lg transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                        }`}>
                        <h2 className="text-xl font-bold" style={{ color: getTextColor() }}>{selectedTicket.subject}</h2>
                        <span
                            className={`px-2 py-1 text-xs rounded-full mt-2 inline-block ${statusClassesMap[selectedTicket.status]}`}
                        >
                            {selectedTicket.status}
                        </span>
                    </div>

                    <div className={`p-4 h-96 overflow-y-auto space-y-4 ${isDark ? '' : 'bg-gray-50'
                        }`}>
                        {selectedTicket.messages?.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user'
                                        ? isDark ? 'bg-primary-600 text-white' : 'bg-[#c9a84c] text-white'
                                        : isDark ? 'bg-gray-700' : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <p className={`text-xs opacity-70 mt-2 text-right ${isDark ? '' : 'text-gray-600'
                                        }`}>
                                        {new Date(msg.time).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedTicket.status !== 'Closed' && (
                        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                            }`}>
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
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    الدعم الفني
                </h1>
                <button
                    onClick={handleOpenNewTicketModal}
                    className={`font-bold py-2 px-4 rounded-lg transition-all duration-300 ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                >
                    فتح تذكرة جديدة
                </button>
            </div>

            {tickets.length === 0 ? (
                <div className={`rounded-lg p-8 text-center transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    <p style={{ color: getMutedTextColor() }}>لا توجد تذاكر دعم فني حالياً.</p>
                </div>
            ) : (
                <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                        <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                            }`}>
                            <tr>
                                <th className="px-4 py-3">الموضوع</th>
                                <th className="px-4 py-3">آخر تحديث</th>
                                <th className="px-4 py-3">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`border-b cursor-pointer transition-colors ${isDark
                                        ? 'border-gray-700 hover:bg-gray-700/50'
                                        : 'border-[#dfd7bb] hover:bg-gray-50'
                                        }`}
                                >
                                    <td className="px-4 py-4 font-semibold" style={{ color: getTextColor() }}>{ticket.subject}</td>
                                    <td className="px-4 py-4" style={{ color: getMutedTextColor() }}>{ticket.lastUpdate}</td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${statusClassesMap[ticket.status]}`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className={`rounded-2xl shadow-xl w-full max-w-lg transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleCreateTicket} className="p-6">
                            <h3 className="text-xl font-bold mb-4" style={{ color: getTextColor() }}>فتح تذكرة جديدة</h3>
                            <div className="space-y-4">
                                <input
                                    value={newTicketData.subject}
                                    onChange={(e) => setNewTicketData((p) => ({ ...p, subject: e.target.value }))}
                                    placeholder="الموضوع"
                                    className={`w-full p-2 rounded transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    required
                                />
                                <textarea
                                    value={newTicketData.message}
                                    onChange={(e) => setNewTicketData((p) => ({ ...p, message: e.target.value }))}
                                    placeholder="اشرح مشكلتك بالتفصيل..."
                                    rows={5}
                                    className={`w-full p-2 rounded transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    required
                                />
                            </div>
                            <div className={`flex justify-end gap-3 pt-4 mt-4 border-t ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                                }`}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`py-2 px-4 rounded transition-colors ${isDark
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`py-2 px-4 rounded transition-all duration-300 ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    إرسال التذكرة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;