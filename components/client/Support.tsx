import React, { useState, useEffect } from 'react';
import { SupportTicket, TicketStatus, TicketMessage } from '../../types';

// عنوان الـ API
const API_BASE_URL = import.meta.env.VITE_API_URL;
const TICKETS_ENDPOINT = `${API_BASE_URL}/technical-support`;

const statusClasses: Record<TicketStatus, string> = {
    Open: 'bg-green-900 text-green-300',
    Answered: 'bg-blue-900 text-blue-300',
    Closed: 'bg-gray-700 text-gray-300',
};

const Support: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [newTicketData, setNewTicketData] = useState({ subject: '', message: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // جلب التذاكر من الـ API
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                const response = await fetch(TICKETS_ENDPOINT);
                if (!response.ok) throw new Error(`خطأ في جلب البيانات: ${response.status}`);

                const data = await response.json();

                // تحويل البيانات القادمة من الباك لضمان وجود messages
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

                // تصفية التذاكر بناءً على المستخدم المسجل
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

            // تحديث الواجهة
            setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)));
            setSelectedTicket(updatedTicket);
            setReplyText('');

            // هنا ممكن تبعت الـ reply للباك لو endpoint متاح
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
                <div className="text-white">جاري تحميل التذاكر...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900 text-red-200 p-4 rounded-lg">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-red-700 hover:bg-red-600 text-white py-1 px-3 rounded"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    // ✅ عرض المحادثة داخل التذكرة
    if (selectedTicket) {
        return (
            <div>
                <button
                    onClick={() => setSelectedTicket(null)}
                    className="flex items-center space-x-2 space-x-reverse text-sm text-primary-400 hover:text-primary-300 mb-4"
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

                <div className="bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                        <span
                            className={`px-2 py-1 text-xs rounded-full mt-2 inline-block ${statusClasses[selectedTicket.status]}`}
                        >
                            {selectedTicket.status}
                        </span>
                    </div>

                    <div className="p-4 h-96 overflow-y-auto space-y-4">
                        {selectedTicket.messages?.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-700'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-70 mt-2 text-right">
                                        {new Date(msg.time).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedTicket.status !== 'Closed' && (
                        <div className="p-4 border-t border-gray-700">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={4}
                                placeholder="اكتب ردك هنا..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mb-2"
                            ></textarea>
                            <button
                                onClick={handleSendReply}
                                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg"
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">الدعم الفني</h1>
                <button
                    onClick={handleOpenNewTicketModal}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                    فتح تذكرة جديدة
                </button>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                    <p className="text-gray-400">لا توجد تذاكر دعم فني حالياً.</p>
                </div>
            ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
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
                                    className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer"
                                >
                                    <td className="px-4 py-4 text-white font-semibold">{ticket.subject}</td>
                                    <td className="px-4 py-4">{ticket.lastUpdate}</td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${statusClasses[ticket.status]}`}
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
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleCreateTicket} className="p-6">
                            <h3 className="text-xl font-bold mb-4">فتح تذكرة جديدة</h3>
                            <div className="space-y-4">
                                <input
                                    value={newTicketData.subject}
                                    onChange={(e) => setNewTicketData((p) => ({ ...p, subject: e.target.value }))}
                                    placeholder="الموضوع"
                                    className="w-full bg-gray-700 p-2 rounded"
                                    required
                                />
                                <textarea
                                    value={newTicketData.message}
                                    onChange={(e) => setNewTicketData((p) => ({ ...p, message: e.target.value }))}
                                    placeholder="اشرح مشكلتك بالتفصيل..."
                                    rows={5}
                                    className="w-full bg-gray-700 p-2 rounded"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-600 py-2 px-4 rounded"
                                >
                                    إلغاء
                                </button>
                                <button type="submit" className="bg-primary-600 py-2 px-4 rounded">
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
