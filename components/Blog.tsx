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

    if (loading) {
        return (
            <div className={`pt-24 pb-20 min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-[#faf8f2] to-white'
                }`}>
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                            جاري تحميل المقالات...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`pt-24 pb-20 min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-[#faf8f2] to-white'
                }`}>
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className="text-red-400 text-lg mb-4">{error}</div>
                        <button
                            onClick={fetchPosts}
                            className={`font-bold py-2 px-6 rounded-lg transition-all duration-300 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`pt-24 pb-20 min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-[#faf8f2] to-white'
            }`}>
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className={`text-4xl md:text-5xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        المدونة
                    </h1>
                    <p className={`mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        آخر المقالات والنصائح حول النمو على وسائل التواصل الاجتماعي.
                    </p>
                </div>

                {publishedPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            لا توجد مقالات منشورة حالياً
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publishedPosts.map((post: any) => (
                            <div
                                key={post._id}
                                className={`rounded-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-2 ${isDark
                                    ? 'bg-gray-800 border border-gray-700 hover:shadow-xl'
                                    : 'bg-white border border-[#dfd7bb] shadow-md hover:shadow-xl'
                                    }`}
                                onClick={() => onPostClick(post.link)}
                            >
                                {post.urlimage && (
                                    <img
                                        src={post.urlimage}
                                        alt={post.title}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/1f2937/6b7280?text=صورة+المقال';
                                        }}
                                    />
                                )}
                                {!post.urlimage && (
                                    <div className={`w-full h-48 flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-700' : 'bg-gray-100'
                                        }`}>
                                        <span className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-400'
                                            }`}>
                                            لا توجد صورة
                                        </span>
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                        }`}>
                                        {post.title}
                                    </h2>
                                    <p className={`text-sm mb-4 flex-grow line-clamp-3 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {post.extract || post.Metadescription || 'لا يوجد وصف للمقال...'}
                                    </p>
                                    <div className={`flex justify-between items-center text-xs pt-4 border-t transition-colors duration-300 ${isDark ? 'text-gray-500 border-gray-700' : 'text-gray-500 border-[#dfd7bb]'
                                        }`}>
                                        <span>بواسطة {post.author}</span>
                                        <span>
                                            {post.createdAt ? formatDate(post.createdAt) : 'غير محدد'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* إحصائيات */}
                <div className="mt-12 text-center">
                    <div className={`inline-flex items-center space-x-6 space-x-reverse transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        <span>إجمالي المقالات: {posts.length}</span>
                        <span>المقالات المنشورة: {publishedPosts.length}</span>
                        <span>المسودات: {posts.length - publishedPosts.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;