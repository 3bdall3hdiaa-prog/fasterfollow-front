import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

interface BlogPost {
    _id: string;
    title: string;
    link: string;
    extract: string;
    content: string;
    urlimage: string;
    author: string;
    status: 'Published' | 'Draft';
    Metatitle: string;
    Metadescription: string;
    createdAt?: string;
    updatedAt?: string;
}

interface BlogProps {
    onPostClick: (slug: string) => void;
}

const Blog: React.FC<BlogProps> = ({ onPostClick }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isDark } = useThemeStore();

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
            setError('فشل في تحميل المقالات');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // تصفية المقالات المنشورة فقط
    const publishedPosts = posts.filter(post => post.status === 'Published');

    // عرض حالة التحميل
    if (loading) {
        return (
            <div className={`px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 
                            pt-24 pb-20 
                            min-h-screen 
                            transition-colors duration-300 
                            ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-[#faf8f2] to-white'}`}>
                <div className="container mx-auto">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        {/* Spinner أنيق */}
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className={`mt-6 text-lg font-medium transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            جاري تحميل المقالات...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // عرض حالة الخطأ
    if (error) {
        return (
            <div className={`px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 
                            pt-24 pb-20 
                            min-h-screen 
                            transition-colors duration-300 
                            ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-[#faf8f2] to-white'}`}>
                <div className="container mx-auto">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            {/* أيقونة الخطأ */}
                            <div className="text-6xl mb-6">⚠️</div>
                            <p className={`text-lg md:text-xl font-semibold mb-4 transition-colors duration-300 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                {error}
                            </p>
                            <button
                                onClick={fetchPosts}
                                className={`font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 ${isDark
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                    : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`mx-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 
                        pt-20 md:pt-24 pb-20 
                        min-h-screen 
                        transition-colors duration-300 
                        ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-[#faf8f2] to-white'}`}>
            <div className="container mx-auto">
                {/* رأس الصفحة */}
                <div className="text-center mb-8 md:mb-12">
                    <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        المدونة
                    </h1>
                    <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full"></div>
                    <p className={`mt-4 text-sm sm:text-base transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        آخر المقالات والنصائح حول النمو على وسائل التواصل الاجتماعي.
                    </p>
                </div>

                {/* قائمة المقالات */}
                {publishedPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-6xl mb-6">📝</div>
                        <div className={`text-center text-lg transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            لا توجد مقالات منشورة حالياً
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 
                                  sm:grid-cols-2 
                                  lg:grid-cols-3 
                                  2xl:grid-cols-4 
                                  gap-4 sm:gap-6 md:gap-8">
                        {publishedPosts.map((post: any) => (
                            <div
                                key={post._id}
                                className={`group rounded-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-2 ${isDark
                                    ? 'bg-gray-800 border border-gray-700 hover:shadow-xl hover:border-primary-500'
                                    : 'bg-white border border-[#dfd7bb] shadow-md hover:shadow-xl hover:border-[#c9a84c]'
                                    }`}
                                onClick={() => onPostClick(post.link)}
                            >
                                {/* صورة المقال */}
                                {post.urlimage ? (
                                    <div className="relative overflow-hidden h-48 sm:h-56 md:h-64">
                                        <img
                                            src={post.urlimage}
                                            alt={post.title || 'صورة المقال'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/1f2937/6b7280?text=صورة+المقال';
                                            }}
                                        />
                                        {/* Overlay على الصورة عند التمرير */}
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                    </div>
                                ) : (
                                    <div className={`w-full h-48 sm:h-56 md:h-64 flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                                            🖼️ لا توجد صورة
                                        </span>
                                    </div>
                                )}

                                {/* محتوى المقال */}
                                <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                                    <h2 className={`text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 line-clamp-2 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-primary-400' : 'text-gray-800 group-hover:text-[#c9a84c]'
                                        }`}>
                                        {post.title}
                                    </h2>
                                    <p className={`text-xs sm:text-sm mb-3 sm:mb-4 flex-grow line-clamp-3 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {post.extract || post.Metadescription || 'لا يوجد وصف للمقال...'}
                                    </p>
                                    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs pt-3 sm:pt-4 border-t transition-colors duration-300 ${isDark ? 'text-gray-500 border-gray-700' : 'text-gray-500 border-[#dfd7bb]'
                                        }`}>
                                        <span className="flex items-center gap-1">
                                            <span>✍️</span> {post.author || 'مجهول'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span>📅</span> {post.createdAt ? formatDate(post.createdAt) : 'غير محدد'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* إحصائيات */}
                <div className="mt-12 text-center">
                    <div className={`inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 px-6 py-3 rounded-xl transition-colors duration-300 ${isDark
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-white/50 text-gray-600 shadow-sm border border-[#dfd7bb]'
                        }`}>
                        <span className="flex items-center gap-2">
                            <span className="text-lg">📚</span>
                            إجمالي المقالات: <strong className={isDark ? 'text-white' : 'text-gray-800'}>{posts.length}</strong>
                        </span>
                        <span className="hidden sm:inline text-gray-400">|</span>
                        <span className="flex items-center gap-2">
                            <span className="text-lg">✅</span>
                            المنشورة: <strong className={isDark ? 'text-green-400' : 'text-green-600'}>{publishedPosts.length}</strong>
                        </span>
                        <span className="hidden sm:inline text-gray-400">|</span>
                        <span className="flex items-center gap-2">
                            <span className="text-lg">📝</span>
                            المسودات: <strong className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>{posts.length - publishedPosts.length}</strong>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;