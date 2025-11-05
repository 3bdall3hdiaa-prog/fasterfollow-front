import React, { useState, useEffect } from 'react';

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
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replyText, setReplyText] = useState('');

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/technical-support`);
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
            Open: 'bg-green-900 text-green-300 border border-green-700',
            Answered: 'bg-blue-900 text-blue-300 border border-blue-700',
            Closed: 'bg-gray-700 text-gray-300 border border-gray-600',
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
                    headers: { 'Content-Type': 'application/json' },
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
                <div className="text-white">جاري تحميل التذاكر...</div>
            </div>
        );

    // ✅ عرض المحادثة عند اختيار تذكرة
    if (selectedTicket) {
        return (
            <div className="p-4">
                <button
                    onClick={() => setSelectedTicket(null)}
                    className="mb-4 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
                >
                    ← العودة إلى التذاكر
                </button>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h2 className="text-2xl text-white font-bold mb-2">{selectedTicket.title}</h2>
                    <p className="text-gray-400 mb-4">{selectedTicket.description}</p>
                    <div className="mb-4">{getStatusBadge(selectedTicket.status)}</div>

                    <div className="h-96 overflow-y-auto bg-gray-900 p-3 rounded-lg space-y-4">
                        {selectedTicket.messages?.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-lg p-3 rounded-lg ${msg.sender === 'admin'
                                        ? 'bg-blue-700 text-white'
                                        : 'bg-gray-700 text-gray-100'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">
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
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mb-2 text-white"
                            ></textarea>
                            <button
                                onClick={handleSendReply}
                                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-lg"
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
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">تذاكر الدعم الفني</h1>

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
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
                                className="border-b border-gray-700 hover:bg-gray-700/30 cursor-pointer"
                            >
                                <td className="px-6 py-4 text-white font-semibold">
                                    {ticket.title}
                                </td>
                                <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                                <td className="px-6 py-4">{formatDate(ticket.createdAt)}</td>
                                <td className="px-6 py-4">{formatDate(ticket.updatedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tickets.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        لا توجد تذاكر حالياً
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTickets;
