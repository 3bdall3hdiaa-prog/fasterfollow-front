import React from 'react';
import { BlogPost as BlogPostType } from '../types';
import { useThemeStore } from '../store/theme.store';

interface BlogPostProps {
    post: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
    console.log(post);
    const { isDark } = useThemeStore();

    // تنسيق التاريخ
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // استخراج وقت القراءة التقريبي
    const getReadingTime = (content: string) => {
        if (!content) return '1 دقيقة';
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes <= 1 ? '1 دقيقة' : `${minutes} دقائق`;
    };

    return (
        <div className={`min-h-screen pt-24 pb-20 transition-colors duration-300 ${isDark ? 'bg-gray-900' : ''
            }`}>
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                <article className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gray-800/80' : 'bg-white'
                    }`}>

                    {/* صورة المقال مع overlay */}
                    <div className="relative w-full h-64 md:h-96 lg:h-[32rem] overflow-hidden">
                        {post.urlimage ? (
                            <img
                                src={post.urlimage}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                onError={(e) => {
                                    // صورة بديلة في حالة الخطأ
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617213-6d22e7a3c7ba?auto=format&fit=crop&w=1074&q=80';
                                }}
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                <span className="text-6xl">📝</span>
                            </div>
                        )}

                        {/* Overlay للعنوان على الصورة (اختياري) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>

                    {/* محتوى المقال */}
                    <div className="p-6 md:p-8 lg:p-10">
                        {/* العنوان */}
                        <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            {post.title}
                        </h1>

                        {/* معلومات الكاتب والتاريخ */}
                        <div className={`flex flex-wrap items-center gap-3 text-sm mb-6 pb-6 border-b transition-colors duration-300 ${isDark ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'
                            }`}>
                            {post.author && (
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 text-sm font-bold">
                                        {post.author.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="font-medium">{post.author}</span>
                                </div>
                            )}

                            <span className="w-1 h-1 rounded-full bg-gray-500" />

                            {post.publishedAt && (
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{formatDate(post.publishedAt)}</span>
                                </div>
                            )}

                            <span className="w-1 h-1 rounded-full bg-gray-500" />

                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{getReadingTime(post.content)} قراءة</span>
                            </div>
                        </div>

                        {/* الملخص (excerpt) */}
                        {post.excerpt && (
                            <div className={`p-4 rounded-lg mb-6 border-r-4 border-primary-500 transition-colors duration-300 ${isDark ? 'bg-gray-700/50 border-primary-500' : 'bg-gray-100 border-primary-500'
                                }`}>
                                <p className={`text-base font-medium leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    {post.excerpt}
                                </p>
                            </div>
                        )}

                        {/* المحتوى الرئيسي */}
                        <div
                            className={`prose prose-lg max-w-none transition-colors duration-300 ${isDark
                                ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-primary-400 prose-blockquote:text-gray-400 prose-blockquote:border-primary-500'
                                : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-primary-600 prose-blockquote:text-gray-600 prose-blockquote:border-primary-500'
                                }`}
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* أزرار المشاركة */}
                        <div className={`mt-10 pt-6 border-t transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'
                            }`}>

                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPost;