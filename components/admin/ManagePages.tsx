import React, { useState } from 'react';
import { Page } from '../../types';
import { useThemeStore } from '@/store/theme.store';
import axios from 'axios';

interface ManagePagesProps {
    pages: Page[];
    setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

const ManagePages: React.FC<ManagePagesProps> = ({ pages, setPages }) => {
    const { isDark } = useThemeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState<Partial<Page>>({});
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

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

    const handleOpenModal = (page: Page | null) => {
        setEditingPage(page);
        setFormData(page || { title: '', slug: '', content: '', isPublished: true });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const fetchPages = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/managepages`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPages(response.data);
        } catch (error) {
            console.error('Error fetching pages:', error);
            alert('فشل في تحميل الصفحات');
        }
    };

    const handleAddPage = async (pageData: Partial<Page>) => {
        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/managepages`, pageData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            await fetchPages();
        } catch (error) {
            console.error('Error adding page:', error);
            alert('فشل في إضافة الصفحة');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePage = async (pageId: string, pageData: Partial<Page>) => {
        try {
            setLoading(true);
            await axios.put(`${API_BASE_URL}/managepages/${pageId}`, pageData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            await fetchPages();
        } catch (error) {
            console.error('Error updating page:', error);
            alert('فشل في تعديل الصفحة');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePage = async (pageId: string) => {
        try {
            setLoading(true);
            await axios.delete(`${API_BASE_URL}/managepages/${pageId}`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            await fetchPages();
        } catch (error) {
            console.error('Error deleting page:', error);
            alert('فشل في حذف الصفحة');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pageData = {
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            isPublished: formData.isPublished
        };

        if (editingPage) {
            await handleUpdatePage(editingPage._id || editingPage.id, pageData);
        } else {
            await handleAddPage(pageData);
        }
        handleCloseModal();
    };

    const handleDelete = async (pageId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
            await handleDeletePage(pageId);
        }
    };

    const handleTogglePublish = async (page: Page) => {
        await handleUpdatePage(page._id || page.id, { isPublished: !page.isPublished });
    };

    return (
        <div className="p-4" style={{
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    إدارة الصفحات
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className={`font-bold py-3 px-6 rounded-lg w-full md:w-auto transition-all duration-300 ${isDark ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة صفحة جديدة'}
                </button>
            </div>

            {loading && (
                <div className={`rounded-lg p-4 mb-4 transition-all duration-300 ${isDark ? 'bg-blue-900/20 border border-blue-700 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                    <p>جاري تحديث البيانات...</p>
                </div>
            )}

            {/* ✅ بطاقات الصفحات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.length === 0 ? (
                    <div className={`col-span-full text-center py-8 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-[#dfd7bb] shadow-md'
                        }`} style={{ color: getMutedTextColor() }}>
                        لا توجد صفحات حالياً
                    </div>
                ) : (
                    pages.map(page => (
                        <div
                            key={page._id || page.id}
                            className={`border-2 rounded-lg p-4 transition-colors h-full min-h-[200px] flex flex-col ${isDark ? 'border-gray-700 hover:bg-gray-700/50 bg-gray-800' : 'border-[#dfd7bb] hover:bg-gray-50 bg-white'
                                }`}
                        >
                            {/* رأس البطاقة */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-lg truncate" style={{ color: getTextColor() }}>
                                        {page.title}
                                    </div>
                                    <div className="text-sm font-mono mt-1 break-all" style={{ color: getMutedTextColor() }}>
                                        /{page.slug}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleTogglePublish(page)}
                                    className={`px-2 py-1 text-xs rounded-full transition-colors flex-shrink-0 ${page.isPublished
                                        ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                        : isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-600'
                                        }`}
                                    disabled={loading}
                                >
                                    {page.isPublished ? 'منشورة' : 'مسودة'}
                                </button>
                            </div>

                            {/* محتوى مختصر */}
                            <div className="flex-1 mb-4">
                                <div className="text-sm line-clamp-3" style={{ color: getMutedTextColor() }}>
                                    {page.content ? page.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'لا يوجد محتوى'}
                                </div>
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => handleOpenModal(page)}
                                    className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                        }`}
                                    disabled={loading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    تعديل
                                </button>
                                <button
                                    onClick={() => handleDelete(page._id || page.id)}
                                    className={`p-2 rounded flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                                        }`}
                                    disabled={loading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal - نفس اللي موجود */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className={`rounded-2xl shadow-xl w-full max-w-2xl transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                        }`} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6">
                            <h3 className="text-xl font-bold mb-4" style={{ color: getTextColor() }}>
                                {editingPage ? 'تعديل صفحة' : 'إضافة صفحة جديدة'}
                            </h3>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                <input
                                    name="title"
                                    value={formData.title || ''}
                                    onChange={handleChange}
                                    placeholder="عنوان الصفحة"
                                    className={`w-full p-2 rounded transition-all duration-300 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                    disabled={loading}
                                />
                                <input
                                    name="slug"
                                    value={formData.slug || ''}
                                    onChange={handleChange}
                                    placeholder="الرابط (e.g., privacy-policy)"
                                    className={`w-full p-2 rounded transition-all duration-300 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                    disabled={loading}
                                />
                                <textarea
                                    name="content"
                                    value={formData.content || ''}
                                    onChange={handleChange}
                                    placeholder="محتوى الصفحة (HTML مسموح)"
                                    rows={10}
                                    className={`w-full p-2 rounded font-mono transition-all duration-300 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    disabled={loading}
                                />
                                <label className="flex items-center space-x-2 space-x-reverse" style={{ color: getTextColor() }}>
                                    <input
                                        type="checkbox"
                                        name="isPublished"
                                        checked={formData.isPublished || false}
                                        onChange={handleChange}
                                        className="form-checkbox"
                                        disabled={loading}
                                    />
                                    <span>نشر الصفحة</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-4 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`py-2 px-4 rounded transition-colors ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`py-2 px-4 rounded transition-all duration-300 ${isDark ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePages;