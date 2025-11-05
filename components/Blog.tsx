import React, { useState, useEffect } from 'react';

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
            <div className="pt-24 pb-20 bg-gray-900 min-h-screen">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className="text-white text-lg">جاري تحميل المقالات...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pt-24 pb-20 bg-gray-900 min-h-screen">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className="text-red-400 text-lg mb-4">{error}</div>
                        <button
                            onClick={fetchPosts}
                            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-lg"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-gray-900 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white">المدونة</h1>
                    <p className="text-gray-400 mt-2">آخر المقالات والنصائح حول النمو على وسائل التواصل الاجتماعي.</p>
                </div>

                {publishedPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg">لا توجد مقالات منشورة حالياً</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {publishedPosts.map(post => (
                            <div
                                key={post._id}
                                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
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
                                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                                        <span className="text-gray-400">لا توجد صورة</span>
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-3">
                                        {post.extract || post.Metadescription || 'لا يوجد وصف للمقال...'}
                                    </p>
                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-4 border-t border-gray-700">
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
                    <div className="inline-flex items-center space-x-6 space-x-reverse text-gray-400">
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