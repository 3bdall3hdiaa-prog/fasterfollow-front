import React, { useState } from 'react';
import { Page } from '../../types';

interface ManagePagesProps {
    pages: Page[];
    setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

const ManagePages: React.FC<ManagePagesProps> = ({ pages, setPages }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState<Partial<Page>>({});
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

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

    // دالة لجلب جميع الصفحات من الـ API
    const fetchPages = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/managepages`);
            if (!response.ok) throw new Error('Failed to fetch pages');
            const data = await response.json();
            setPages(data);
        } catch (error) {
            console.error('Error fetching pages:', error);
            alert('فشل في تحميل الصفحات');
        }
    };

    // دالة لإضافة صفحة جديدة
    const handleAddPage = async (pageData: Partial<Page>) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/managepages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pageData),
            });

            if (!response.ok) throw new Error('Failed to add page');

            await fetchPages(); // إعادة تحميل البيانات بعد الإضافة
        } catch (error) {
            console.error('Error adding page:', error);
            alert('فشل في إضافة الصفحة');
        } finally {
            setLoading(false);
        }
    };

    // دالة لتعديل صفحة موجودة
    const handleUpdatePage = async (pageId: string, pageData: Partial<Page>) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/managepages/${pageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pageData),
            });

            if (!response.ok) throw new Error('Failed to update page');

            await fetchPages(); // إعادة تحميل البيانات بعد التعديل
        } catch (error) {
            console.error('Error updating page:', error);
            alert('فشل في تعديل الصفحة');
        } finally {
            setLoading(false);
        }
    };

    // دالة لحذف صفحة
    const handleDeletePage = async (pageId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/managepages/${pageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete page');

            await fetchPages(); // إعادة تحميل البيانات بعد الحذف
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
            // استخدام _id بدل id للتعديل
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
        // استخدام _id بدل id لتغيير حالة النشر
        await handleUpdatePage(page._id || page.id, { isPublished: !page.isPublished });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">إدارة الصفحات</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg"
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة صفحة جديدة'}
                </button>
            </div>

            {loading && (
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
                    <p className="text-blue-300">جاري تحديث البيانات...</p>
                </div>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3">العنوان</th>
                                <th className="px-4 py-3">الرابط (Slug)</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map(page => (
                                <tr key={page._id || page.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-4 text-white">{page.title}</td>
                                    <td className="px-4 py-4 font-mono">/{page.slug}</td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleTogglePublish(page)}
                                            className={`px-2 py-1 text-xs rounded-full ${page.isPublished ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-200'}`}
                                            disabled={loading}
                                        >
                                            {page.isPublished ? 'منشورة' : 'مسودة'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 flex space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleOpenModal(page)}
                                            className="text-primary-400 hover:text-primary-300"
                                            disabled={loading}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(page._id || page.id)}
                                            className="text-red-400 hover:text-red-300"
                                            disabled={loading}
                                        >
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6">
                            <h3 className="text-xl font-bold mb-4">{editingPage ? 'تعديل صفحة' : 'إضافة صفحة جديدة'}</h3>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                <input
                                    name="title"
                                    value={formData.title || ''}
                                    onChange={handleChange}
                                    placeholder="عنوان الصفحة"
                                    className="w-full bg-gray-700 p-2 rounded"
                                    required
                                    disabled={loading}
                                />
                                <input
                                    name="slug"
                                    value={formData.slug || ''}
                                    onChange={handleChange}
                                    placeholder="الرابط (e.g., privacy-policy)"
                                    className="w-full bg-gray-700 p-2 rounded"
                                    required
                                    disabled={loading}
                                />
                                <textarea
                                    name="content"
                                    value={formData.content || ''}
                                    onChange={handleChange}
                                    placeholder="محتوى الصفحة (HTML مسموح)"
                                    rows={10}
                                    className="w-full bg-gray-700 p-2 rounded font-mono"
                                    disabled={loading}
                                />
                                <label className="flex items-center space-x-2 space-x-reverse">
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
                            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-600 py-2 px-4 rounded"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 py-2 px-4 rounded"
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