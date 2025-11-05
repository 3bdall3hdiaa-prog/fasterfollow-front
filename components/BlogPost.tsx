import React from 'react';
import { BlogPost as BlogPostType } from '../types';

interface BlogPostProps {
    post: BlogPostType;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
    return (
        <div className="pt-24 pb-20 bg-gray-800/50">
            <div className="container mx-auto px-6 max-w-4xl">
                <article className="text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{post.title}</h1>
                    <div className="text-gray-400 text-sm mb-6">
                        <span>نشر بواسطة {post.author}</span>
                        <span className="mx-2">•</span>
                        <span>{post.publishedAt}</span>
                    </div>
                    
                    <img src={post.imageUrl} alt={post.title} className="w-full h-auto rounded-lg mb-8" />
                    
                    <div 
                        className="prose prose-invert prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </div>
        </div>
    );
};

export default BlogPost;
