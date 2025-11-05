import React, { useState, useEffect } from 'react';

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

    // جلب المقالات من الـ API
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/blog`);
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
                // تحديث مقال موجود - PUT /blog/:id
                const response = await fetch(`${import.meta.env.VITE_API_URL}/blog/${editingPost._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    throw new Error('فشل في تحديث المقال');
                }

                const updatedPost = await response.json();
                setPosts(posts.map(p => p._id === editingPost._id ? updatedPost : p));
                alert('تم تحديث المقال بنجاح');
            } else {
                // إنشاء مقال جديد - POST /blog
                const response = await fetch(`${import.meta.env.VITE_API_URL}/blog`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
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
                // حذف مقال - DELETE /blog/:id
                const response = await fetch(`${import.meta.env.VITE_API_URL}/blog/${postId}`, {
                    method: 'DELETE',
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
        return status === 'Published'
            ? 'bg-green-900 text-green-300 border border-green-700'
            : 'bg-yellow-900 text-yellow-300 border border-yellow-700';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-lg">جاري تحميل المقالات...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900 text-red-200 p-4 rounded-lg">
                <p>{error}</p>
                <button
                    onClick={fetchPosts}
                    className="mt-2 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">إدارة المدونة</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                    مقال جديد
                </button>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4">العنوان</th>
                            <th className="px-6 py-4">الرابط</th>
                            <th className="px-6 py-4">الكاتب</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition duration-150">
                                <td className="px-6 py-4">
                                    <div className="text-white font-semibold">{post.title}</div>
                                    {post.extract && (
                                        <div className="text-gray-400 text-sm mt-1 line-clamp-2">
                                            {post.extract}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-300 text-sm">{post.link}</div>
                                </td>
                                <td className="px-6 py-4">{post.author || 'Admin'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusClass(post.status)}`}>
                                        {getStatusText(post.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleOpenModal(post)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition duration-200 flex items-center"
                                        >
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => post._id && handleDelete(post._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition duration-200 flex items-center"
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

                {posts.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 text-lg mb-4">لا توجد مقالات حالياً</div>
                        <button
                            onClick={() => handleOpenModal(null)}
                            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-lg"
                        >
                            إنشاء أول مقال
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6">
                            <h3 className="text-xl font-bold mb-6">{editingPost ? 'تعديل مقال' : 'إضافة مقال جديد'}</h3>

                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                                {/* الحقول الأساسية */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">العنوان *</label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="عنوان المقال"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">الرابط *</label>
                                        <input
                                            name="link"
                                            value={formData.link}
                                            onChange={handleChange}
                                            placeholder="رابط المقال (e.g., my-awesome-post)"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">المقتطف</label>
                                    <textarea
                                        name="extract"
                                        value={formData.extract}
                                        onChange={handleChange}
                                        placeholder="مقتطف مختصر عن المقال"
                                        rows={3}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">المحتوى الكامل *</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        placeholder="المحتوى الكامل للمقال (HTML مسموح)"
                                        rows={8}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none font-mono"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                                        <input
                                            name="urlimage"
                                            value={formData.urlimage}
                                            onChange={handleChange}
                                            placeholder="رابط صورة المقال"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">الحالة</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                        >
                                            <option value="Published">منشور</option>
                                            <option value="Draft">مسودة</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">الكاتب</label>
                                        <input
                                            name="author"
                                            value={formData.author || 'Admin'}
                                            onChange={handleChange}
                                            placeholder="الكاتب"
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">الدور</label>
                                        <input
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-700 my-4" />

                                <h4 className="text-lg font-semibold mb-3">إعدادات SEO</h4>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Meta Title</label>
                                    <input
                                        name="Metatitle"
                                        value={formData.Metatitle}
                                        onChange={handleChange}
                                        placeholder="عنوان Meta"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        name="Metadescription"
                                        value={formData.Metadescription}
                                        onChange={handleChange}
                                        placeholder="وصف Meta"
                                        rows={3}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:border-primary-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-600 hover:bg-gray-500 text-white py-3 px-8 rounded-lg transition duration-200"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-lg transition duration-200"
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