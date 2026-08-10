import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

interface BlogPost {
    _id?: string;
    title: string;
    link: string;
    extract: string;
    content: string;
    urlimage: string;
    role: string;
    status: 'Published' | 'Draft';
    Metatitle: string;
    Metadescription: string;
    publishedAt?: string;
    author?: string;
}

const ManageBlog: React.FC = () => {
    const { isDark } = useThemeStore();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState<BlogPost>({
        title: '',
        link: '',
        extract: '',
        content: '',
        urlimage: '',
        role: 'admin',
        status: 'Draft',
        Metatitle: '',
        Metadescription: '',
        author: 'Admin'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    // جلب المقالات من الـ API
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/blog`, {
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('فشل في جلب البيانات');
            }
            const data = await response.json();
            setPosts(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('فشل في جلب المقالات');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (post: BlogPost | null) => {
        setEditingPost(post);
        if (post) {
            setFormData(post);
        } else {
            setFormData({
                title: '',
                link: '',
                extract: '',
                content: '',
                urlimage: '',
                role: 'admin',
                status: 'Draft',
                Metatitle: '',
                Metadescription: '',
                author: 'Admin'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingPost && editingPost._id) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/blog/${editingPost._id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify(formData), headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('فشل في تحديث المقال');
                }

                const updatedPost = await response.json();
                setPosts(posts.map(p => p._id === editingPost._id ? updatedPost : p));
                alert('تم تحديث المقال بنجاح');
            } else {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/blog`, {
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify(formData), headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('فشل في إنشاء المقال');
                }

                const newPost = await response.json();
                setPosts([...posts, newPost]);
                alert('تم إنشاء المقال بنجاح');
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('فشل في حفظ المقال');
        }
    };

    const handleDelete = async (postId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/blog/${postId}`, {
                    method: 'DELETE',
                    credentials: 'include', headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('فشل في حذف المقال');
                }

                setPosts(posts.filter(p => p._id !== postId));
                alert('تم حذف المقال بنجاح');
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('فشل في حذف المقال');
            }
        }
    };

    const getStatusText = (status: string) => {
        return status === 'Published' ? 'منشور' : 'مسودة';
    };

    const getStatusClass = (status: string) => {
        if (status === 'Published') {
            return isDark
                ? 'bg-green-900 text-green-300 border border-green-700'
                : 'bg-green-100 text-green-700 border border-green-200';
        } else {
            return isDark
                ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                : 'bg-yellow-100 text-yellow-700 border border-yellow-200';
        }
    };

    // فلترة المقالات حسب البحث
    const filteredPosts = posts.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.extract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div style={{ color: getTextColor() }}>جاري تحميل المقالات...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`rounded-lg p-4 ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                <p>{error}</p>
                <button
                    onClick={fetchPosts}
                    className={`mt-2 py-2 px-4 rounded transition-colors ${isDark
                        ? 'bg-red-700 hover:bg-red-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    إدارة المدونة
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className={`font-bold py-3 px-6 rounded-lg transition-all duration-300 w-full md:w-auto ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                >
                    مقال جديد
                </button>
            </div>

            {/* حقل البحث */}
            <div className={`rounded-lg p-4 mb-6 transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="ابحث بالعنوان، الكاتب، المقتطف، أو الحالة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`rounded-md p-3 w-full md:w-1/2 text-sm md:text-base transition-all duration-300 ${isDark
                            ? 'bg-gray-700 border border-gray-600 text-white'
                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                            }`}
                    />
                    <div className="text-sm md:text-base" style={{ color: getMutedTextColor() }}>
                        إجمالي المقالات: {posts.length} | المعروض: {filteredPosts.length}
                    </div>
                </div>
            </div>

            {/*  جدول المقالات - للشاشات الكبيرة */}
            <div className={`hidden md:block rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                    <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                        }`}>
                        <tr>
                            <th className="px-6 py-4">العنوان</th>
                            <th className="px-6 py-4">الرابط</th>
                            <th className="px-6 py-4">الكاتب</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.map(post => (
                            <tr key={post._id} className={`border-b transition-colors ${isDark
                                ? 'border-gray-700 hover:bg-gray-700/50'
                                : 'border-[#dfd7bb] hover:bg-gray-50'
                                }`}>
                                <td className="px-6 py-4">
                                    <div className="font-semibold" style={{ color: getTextColor() }}>{post.title}</div>
                                    {post.extract && (
                                        <div className="text-sm mt-1 line-clamp-2" style={{ color: getMutedTextColor() }}>
                                            {post.extract}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm" style={{ color: getMutedTextColor() }}>{post.link}</div>
                                </td>
                                <td className="px-6 py-4" style={{ color: getTextColor() }}>{post.author || 'Admin'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusClass(post.status)}`}>
                                        {getStatusText(post.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2 flex-wrap">
                                        <button
                                            onClick={() => handleOpenModal(post)}
                                            className={`py-2 px-4 rounded-lg text-sm transition-colors flex items-center ${isDark
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                }`}
                                        >
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => post._id && handleDelete(post._id)}
                                            className={`py-2 px-4 rounded-lg text-sm transition-colors flex items-center ${isDark
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                                }`}
                                        >
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            حذف
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredPosts.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="text-lg mb-4" style={{ color: getMutedTextColor() }}>
                            {posts.length === 0 ? 'لا توجد مقالات حالياً' : 'لم يتم العثور على مقالات تطابق البحث'}
                        </div>
                        <button
                            onClick={() => handleOpenModal(null)}
                            className={`py-2 px-6 rounded-lg transition-all duration-300 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            إنشاء أول مقال
                        </button>
                    </div>
                )}
            </div>

            {/*  تصميم البطاقات للهواتف */}
            <div className="block md:hidden">
                <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    {filteredPosts.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-lg mb-4" style={{ color: getMutedTextColor() }}>
                                {posts.length === 0 ? 'لا توجد مقالات حالياً' : 'لم يتم العثور على مقالات تطابق البحث'}
                            </div>
                            <button
                                onClick={() => handleOpenModal(null)}
                                className={`py-3 px-6 rounded-lg w-full transition-all duration-300 ${isDark
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                    : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                إنشاء أول مقال
                            </button>
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <div key={post._id} className={`border-b p-4 transition-colors ${isDark
                                ? 'border-gray-700 hover:bg-gray-700/50'
                                : 'border-[#dfd7bb] hover:bg-gray-50'
                                }`}>
                                {/* رأس البطاقة */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="font-semibold text-lg mb-2" style={{ color: getTextColor() }}>{post.title}</div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(post.status)}`}>
                                                {getStatusText(post.status)}
                                            </span>
                                            <span className="text-sm" style={{ color: getMutedTextColor() }}>{post.author || 'Admin'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* معلومات المقال */}
                                <div className="space-y-2 mb-4">
                                    {post.extract && (
                                        <div>
                                            <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>المقتطف</div>
                                            <div className="text-sm line-clamp-2" style={{ color: getTextColor() }}>
                                                {post.extract}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>الرابط</div>
                                        <div className="text-sm" style={{ color: getMutedTextColor() }}>{post.link}</div>
                                    </div>
                                </div>

                                {/* أزرار الإجراءات */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(post)}
                                        className={`py-2 rounded-lg flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => post._id && handleDelete(post._id)}
                                        className={`py-2 rounded-lg flex items-center gap-1 flex-1 justify-center text-sm transition-colors ${isDark
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* نافذة الإضافة/التعديل */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className={`rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                        }`} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-4 md:p-6">
                            <h3 className="text-xl font-bold mb-6" style={{ color: getTextColor() }}>
                                {editingPost ? 'تعديل مقال' : 'إضافة مقال جديد'}
                            </h3>

                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                                {/* الحقول الأساسية */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>العنوان *</label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="عنوان المقال"
                                            className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                                ? 'bg-gray-700 border border-gray-600 text-white'
                                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                                }`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>الرابط *</label>
                                        <input
                                            name="link"
                                            value={formData.link}
                                            onChange={handleChange}
                                            placeholder="رابط المقال (e.g., my-awesome-post)"
                                            className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                                ? 'bg-gray-700 border border-gray-600 text-white'
                                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                                }`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>المقتطف</label>
                                    <textarea
                                        name="extract"
                                        value={formData.extract}
                                        onChange={handleChange}
                                        placeholder="مقتطف مختصر عن المقال"
                                        rows={3}
                                        className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>المحتوى الكامل *</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        placeholder="المحتوى الكامل للمقال (HTML مسموح)"
                                        rows={6}
                                        className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none font-mono text-sm md:text-base transition-all duration-300 ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                            }`}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>رابط الصورة</label>
                                        <input
                                            name="urlimage"
                                            value={formData.urlimage}
                                            onChange={handleChange}
                                            placeholder="رابط صورة المقال"
                                            className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                                ? 'bg-gray-700 border border-gray-600 text-white'
                                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>الحالة</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                                ? 'bg-gray-700 border border-gray-600 text-white'
                                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                                }`}
                                        >
                                            <option value="Published">منشور</option>
                                            <option value="Draft">مسودة</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>الكاتب</label>
                                        <input
                                            name="author"
                                            value={formData.author || 'Admin'}
                                            onChange={handleChange}
                                            placeholder="الكاتب"
                                            className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                                ? 'bg-gray-700 border border-gray-600 text-white'
                                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>الدور</label>
                                        <input
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                                ? 'bg-gray-700 border border-gray-600 text-white'
                                                : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                                }`}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <hr className={`transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                                    }`} />

                                <h4 className="text-lg font-semibold mb-3" style={{ color: getTextColor() }}>إعدادات SEO</h4>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>Meta Title</label>
                                    <input
                                        name="Metatitle"
                                        value={formData.Metatitle}
                                        onChange={handleChange}
                                        placeholder="عنوان Meta"
                                        className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: getMutedTextColor() }}>Meta Description</label>
                                    <textarea
                                        name="Metadescription"
                                        value={formData.Metadescription}
                                        onChange={handleChange}
                                        placeholder="وصف Meta"
                                        rows={3}
                                        className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none text-sm md:text-base transition-all duration-300 ${isDark
                                            ? 'bg-gray-700 border border-gray-600 text-white'
                                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`py-3 px-6 rounded-lg transition-colors text-sm md:text-base flex-1 md:flex-none ${isDark
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`py-3 px-6 rounded-lg transition-all duration-300 text-sm md:text-base flex-1 md:flex-none ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {editingPost ? 'تحديث المقال' : 'إنشاء المقال'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBlog;